import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses } from '@/db/schema';
import { analyzeLead } from '@/lib/ai/analyze-lead';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const [lead] = await db.insert(leads).values(body).returning();
    
    const analysis = await analyzeLead(body);
    
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
    
    return NextResponse.json({ id: lead.id, lead, analysis: insertedAnalysis }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
