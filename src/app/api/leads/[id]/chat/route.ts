import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses, chatMessages } from '@/db/schema';
import { streamLeadChat } from '@/lib/ai/chat';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    const { message } = await req.json();
    
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    const [analysis] = await db.select().from(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));
    const existingMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.leadId, leadId))
      .orderBy(asc(chatMessages.createdAt));
    
    if (!lead || !analysis) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    await db.insert(chatMessages).values({
      leadId,
      role: 'user',
      content: message,
    });
    
    const chatHistory = existingMessages.map(msg => ({
      id: msg.id.toString(),
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
    
    const result = streamLeadChat({
      leadData: lead as any,
      analysis: analysis as any,
      chatHistory,
      userMessage: message,
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error streaming chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
