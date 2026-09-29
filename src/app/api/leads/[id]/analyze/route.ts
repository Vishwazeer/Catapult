import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses } from '@/db/schema';
import { analyzeLead } from '@/lib/ai/analyze-lead';
import { eq } from 'drizzle-orm';

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
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Run AI analysis
    const analysis = await analyzeLead(lead);

    // Delete existing analysis if any (for clean re-scan)
    await db.delete(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));

    // Insert new analysis
    const [insertedAnalysis] = await db.insert(leadAnalyses).values({
      leadId: lead.id,
      summary: analysis.summary,
      intent: analysis.intent,
      keyRequirements: analysis.keyRequirements,
      objectionsAndConcerns: analysis.objectionsAndConcerns,
      recommendedNextAction: analysis.recommendedNextAction,
      suggestedResponse: analysis.suggestedResponse,
      score: analysis.score,
      tag: analysis.tag,
      reasoning: analysis.reasoning,
      callPrepQuestions: analysis.callPrepQuestions,
    }).returning();

    return NextResponse.json({
      success: true,
      analysis: insertedAnalysis,
    });
  } catch (error: any) {
    console.error('Error analyzing lead:', error);
    return NextResponse.json({ error: error?.message || 'Failed to analyze lead' }, { status: 500 });
  }
}
