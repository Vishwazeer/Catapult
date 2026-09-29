import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses, chatMessages } from '@/db/schema';
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
