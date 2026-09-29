import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses, simulationMessages } from '@/db/schema';
import { streamCustomerSimulation } from '@/lib/ai/customer-simulator';
import { eq, asc } from 'drizzle-orm';

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

    const body = await req.json();
    const { message, saveCustomerResponse } = body;

    // Handle saving customer AI response after streaming
    if (saveCustomerResponse) {
      await db.insert(simulationMessages).values({
        leadId,
        role: 'customer',
        content: saveCustomerResponse,
      });
      return NextResponse.json({ success: true });
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    const [analysis] = await db.select().from(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));

    if (!lead || !analysis) {
      return NextResponse.json({ error: 'Lead or analysis not found' }, { status: 404 });
    }

    // Load conversation history from DB
    const history = await db
      .select()
      .from(simulationMessages)
      .where(eq(simulationMessages.leadId, leadId))
      .orderBy(asc(simulationMessages.createdAt));

    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Save salesperson message to DB
    await db.insert(simulationMessages).values({
      leadId,
      role: 'salesperson',
      content: message.trim(),
    });

    // Stream customer simulation response
    const result = streamCustomerSimulation({
      leadData: lead as any,
      analysis: analysis as any,
      conversationHistory,
      salespersonMessage: message.trim(),
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Error in customer simulation:', error);
    return NextResponse.json({ error: error?.message || 'Simulation failed' }, { status: 500 });
  }
}

// GET — load simulation conversation history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const history = await db
      .select()
      .from(simulationMessages)
      .where(eq(simulationMessages.leadId, leadId))
      .orderBy(asc(simulationMessages.createdAt));

    return NextResponse.json({ messages: history });
  } catch (error) {
    console.error('Error fetching simulation history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — clear simulation history
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    await db.delete(simulationMessages).where(eq(simulationMessages.leadId, leadId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing simulation history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
