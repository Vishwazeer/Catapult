import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, leadAnalyses } from '@/db/schema';
import { searchProperties, streamCallPrep } from '@/lib/ai/call-prep';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { leadId, message } = await req.json();
    
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    const [analysis] = await db.select().from(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));
    
    if (!lead || !analysis) {
      return NextResponse.json({ error: 'Lead or analysis not found' }, { status: 404 });
    }
    
    const text = (message || '').toLowerCase();
    const searchParams: any = {};
    
    // Parse city from message
    const cityMap: Record<string, string> = {
      gurugram: 'Gurugram', gurgaon: 'Gurugram',
      noida: 'Noida', 'greater noida': 'Greater Noida',
      mumbai: 'Mumbai', thane: 'Thane', 'navi mumbai': 'Navi Mumbai',
      bangalore: 'Bangalore', bengaluru: 'Bangalore',
      hyderabad: 'Hyderabad', pune: 'Pune',
      chennai: 'Chennai', delhi: 'Delhi',
    };
    
    for (const [key, city] of Object.entries(cityMap)) {
      if (text.includes(key)) {
        searchParams.city = city;
        break;
      }
    }
    
    // Parse BHK
    const bhkMatch = text.match(/(\d+)\s*bhk/);
    if (bhkMatch) searchParams.bhk = `${bhkMatch[1]} BHK`;
    
    // Parse budget (DB stores in lakhs)
    const budgetMatch = text.match(/(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l)\b/);
    if (budgetMatch) {
      const val = parseFloat(budgetMatch[1]);
      if (budgetMatch[2].startsWith('c')) {
        // 1 Cr = 100 Lakhs
        searchParams.budgetMax = val * 100;
      } else {
        searchParams.budgetMax = val;
      }
    }

    // Parse property type
    if (text.includes('villa')) searchParams.type = 'villa';
    if (text.includes('plot')) searchParams.type = 'plot';
    if (text.includes('commercial')) searchParams.type = 'commercial';
    if (text.includes('penthouse')) searchParams.type = 'penthouse';
    
    // If no specific search params extracted, use location from query
    if (Object.keys(searchParams).length === 0 && text.length > 3) {
      searchParams.location = text;
    }
    
    const matchingProperties = await searchProperties(searchParams);
    
    const result = streamCallPrep({
      leadData: lead as any,
      analysis: analysis as any,
      matchingProperties,
      userMessage: message,
      chatHistory: [],
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in call prep:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
