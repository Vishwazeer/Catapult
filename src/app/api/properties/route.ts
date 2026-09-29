import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { and, gte, lte, eq, ilike, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q');
    const city = url.searchParams.get('city');
    const type = url.searchParams.get('type');
    const budgetMin = url.searchParams.get('budgetMin');
    const budgetMax = url.searchParams.get('budgetMax');
    const bhk = url.searchParams.get('bhk');
    
    let conditions = [];
    
    if (q) {
      conditions.push(
        or(
          ilike(properties.name, `%${q}%`),
          ilike(properties.location, `%${q}%`),
          ilike(properties.city, `%${q}%`)
        )
      );
    } else {
      if (city) conditions.push(ilike(properties.city, `%${city}%`));
      if (type) conditions.push(eq(properties.type, type));
      if (bhk) conditions.push(eq(properties.bhk, bhk));
      if (budgetMin) conditions.push(gte(properties.priceInr, parseFloat(budgetMin)));
      if (budgetMax) conditions.push(lte(properties.priceInr, parseFloat(budgetMax)));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const results = await db.select().from(properties).where(whereClause);
    
    return NextResponse.json({ properties: results });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
