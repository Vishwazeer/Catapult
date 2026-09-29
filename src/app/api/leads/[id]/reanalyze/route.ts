import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses, simulationMessages, properties } from '@/db/schema';
import { reanalyzeLead } from '@/lib/ai/lead-reanalyzer';
import { eq, asc, or, ilike, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    const [analysis] = await db.select().from(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));

    if (!lead || !analysis) {
      return NextResponse.json({ error: 'Lead or analysis not found' }, { status: 404 });
    }

    // Load full conversation history
    const history = await db
      .select()
      .from(simulationMessages)
      .where(eq(simulationMessages.leadId, leadId))
      .orderBy(asc(simulationMessages.createdAt));

    if (history.length === 0) {
      return NextResponse.json({ error: 'No conversation to analyze' }, { status: 400 });
    }

    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Fetch available property inventory from DB for this lead's city or all properties
    let availableProperties: any[] = [];
    try {
      if (lead.location) {
        availableProperties = await db
          .select()
          .from(properties)
          .where(
            or(
              ilike(properties.city, `%${lead.location}%`),
              ilike(properties.location, `%${lead.location}%`)
            )
          )
          .limit(10);
      }
      
      if (!availableProperties || availableProperties.length === 0) {
        availableProperties = await db.select().from(properties).limit(10);
      }
    } catch (err) {
      console.warn('Failed to fetch properties for re-analysis:', err);
    }

    // Capture old score/tag before re-analysis
    const oldScore = analysis.score;
    const oldTag = analysis.tag;

    // Run lead re-analyzer (Grok #2 / Gemini) with grounded property inventory
    const reanalysis = await reanalyzeLead({
      leadData: lead as any,
      originalAnalysis: analysis as any,
      conversationHistory,
      availableProperties,
    });

    // Update lead_analyses with new score and tag
    await db.update(leadAnalyses)
      .set({
        score: reanalysis.priorityScore,
        tag: reanalysis.temperature,
        intent: reanalysis.intent,
        reasoning: reanalysis.reasoning,
        recommendedNextAction: reanalysis.recommendedNextAction,
      })
      .where(eq(leadAnalyses.leadId, leadId));

    // Resolve matched property from inventory
    let matchedProperty = null;
    if (reanalysis.matchedPropertyId && availableProperties.length > 0) {
      matchedProperty = availableProperties.find((p) => p.id === reanalysis.matchedPropertyId) || null;
    }
    if (!matchedProperty && availableProperties.length > 0) {
      matchedProperty = availableProperties[0];
    }

    return NextResponse.json({
      success: true,
      oldScore,
      oldTag,
      newScore: reanalysis.priorityScore,
      newTag: reanalysis.temperature,
      direction: reanalysis.direction,
      scoreChange: reanalysis.scoreChange,
      buyingSignals: reanalysis.buyingSignals || [],
      objections: reanalysis.newObjections || [],
      newObjections: reanalysis.newObjections || [],
      newRequirements: reanalysis.newRequirements || [],
      informationDiscovered: reanalysis.informationDiscovered || [],
      missingInformation: reanalysis.missingInformation || [],
      recommendedNextAction: reanalysis.recommendedNextAction || '',
      suggestedResponse: reanalysis.suggestedResponse || '',
      matchedProperty: matchedProperty,
      reasoning: reanalysis.reasoning || '',
    });
  } catch (error: any) {
    console.error('Error reanalyzing lead:', error);
    return NextResponse.json({ error: error?.message || 'Reanalysis failed' }, { status: 500 });
  }
}
