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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, city, state, type, bhk, sqft, priceInr, amenities, builder, possessionStatus, description } = body;
    
    if (!name || !location || !city || !type || !sqft || priceInr === undefined || !builder) {
      return NextResponse.json({ error: 'Missing required property fields' }, { status: 400 });
    }

    const amenitiesList = Array.isArray(amenities)
      ? amenities
      : typeof amenities === 'string'
      ? amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const [inserted] = await db
      .insert(properties)
      .values({
        name,
        location,
        city,
        state: state || 'India',
        type,
        bhk: bhk || null,
        sqft: parseInt(sqft),
        priceInr: parseFloat(priceInr), // Stored in Lakhs (e.g. 150 = 1.5 Cr)
        amenities: amenitiesList,
        builder,
        possessionStatus: possessionStatus || 'ready',
        description: description || null,
      })
      .returning();

    return NextResponse.json({ property: inserted });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create property' }, { status: 500 });
  }
}
