import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses, chatMessages } from '@/db/schema';
import { analyzeLead } from '@/lib/ai/analyze-lead';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const [analysis] = await db.select().from(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));
    const chat = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.leadId, leadId))
      .orderBy(asc(chatMessages.createdAt));
    
    return NextResponse.json({ lead, analysis, chatMessages: chat });
  } catch (error) {
    console.error('Error fetching lead details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    const body = await req.json();
    const { callNotes, phase } = body;

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (callNotes !== undefined) updateFields.callNotes = callNotes;
    if (phase !== undefined) updateFields.phase = phase;

    await db
      .update(leads)
      .set(updateFields)
      .where(eq(leads.id, leadId));

    return NextResponse.json({ success: true, callNotes, phase });
  } catch (error) {
    console.error('Error updating lead patch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    const body = await req.json();

    const updateData: Record<string, any> = {
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
      updatedAt: new Date(),
    };

    const [updatedLead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, leadId))
      .returning();

    if (!updatedLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Background auto-analysis after edit
    (async () => {
      try {
        const analysis = await analyzeLead(updateData);
        await db.delete(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));
        await db.insert(leadAnalyses).values({
          leadId,
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
        console.log(`Auto-analysis completed for edited lead ${leadId}`);
      } catch (err) {
        console.error(`Auto-analysis failed for lead ${leadId}:`, err);
      }
    })();

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    
    await db.delete(chatMessages).where(eq(chatMessages.leadId, leadId));
    await db.delete(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));
    await db.delete(leads).where(eq(leads.id, leadId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
