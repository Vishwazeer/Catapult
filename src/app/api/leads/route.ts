import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses } from '@/db/schema';
import { analyzeLead } from '@/lib/ai/analyze-lead';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Convert string form values to proper types for DB
    const leadData = {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      location: body.location,
      propertyType: body.propertyType,
      propertyRequirement: body.propertyRequirement || null,
      bhkConfig: body.bhkConfig || null,
      sqftMin: body.sqftMin && !isNaN(parseInt(body.sqftMin)) ? parseInt(body.sqftMin) : null,
      sqftMax: body.sqftMax && !isNaN(parseInt(body.sqftMax)) ? parseInt(body.sqftMax) : null,
      preferredFloor: body.preferredFloor || null,
      facingDirection: body.facingDirection || null,
      budgetMin: body.budgetMin && !isNaN(parseFloat(body.budgetMin)) ? parseFloat(body.budgetMin) : null,
      budgetMax: body.budgetMax && !isNaN(parseFloat(body.budgetMax)) ? parseFloat(body.budgetMax) : null,
      loanReady: body.loanReady || null,
      maxLoanAmount: body.maxLoanAmount && !isNaN(parseFloat(body.maxLoanAmount)) ? parseFloat(body.maxLoanAmount) : null,
      creditScoreRange: body.creditScoreRange || null,
      downPaymentAvailable: body.downPaymentAvailable && !isNaN(parseFloat(body.downPaymentAvailable)) ? parseFloat(body.downPaymentAvailable) : null,
      buyingTimeline: body.buyingTimeline,
      occupancyType: body.occupancyType || null,
      possessionPreference: body.possessionPreference || null,
      preferredAmenities: Array.isArray(body.preferredAmenities) && body.preferredAmenities.length > 0 ? body.preferredAmenities : null,
      mustHaveFeatures: body.mustHaveFeatures || null,
      dealBreakers: body.dealBreakers || null,
      customerMessage: body.customerMessage,
      source: body.source || null,
    };
    
    const [lead] = await db.insert(leads).values(leadData).returning();
    
    // Asynchronous background AI analysis — user is never blocked
    (async () => {
      try {
        const analysis = await analyzeLead(leadData);
        await db.insert(leadAnalyses).values({
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
        });
        console.log(`AI analysis completed successfully for lead ${lead.id}`);
      } catch (err) {
        console.error(`Background analysis failed for lead ${lead.id}:`, err);
      }
    })();
    
    return NextResponse.json({ id: lead.id, lead, status: 'saved' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allLeads = await db
      .select({
        lead: leads,
        analysis: leadAnalyses,
      })
      .from(leads)
      .leftJoin(leadAnalyses, eq(leads.id, leadAnalyses.leadId))
      .orderBy(desc(leadAnalyses.score));

    const formatted = allLeads.map(row => ({
      lead: row.lead,
      analysis: row.analysis,
    }));

    return NextResponse.json({ leads: formatted });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
