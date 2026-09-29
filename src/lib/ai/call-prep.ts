import { google } from '@ai-sdk/google';
import { streamText, type CoreMessage } from 'ai';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { and, gte, lte, ilike, eq, or } from 'drizzle-orm';

export type PropertySearchQuery = {
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  type?: string;
  bhk?: string;
  city?: string;
};

export async function searchProperties(query: PropertySearchQuery) {
  const conditions = [];

  if (query.location) {
    conditions.push(
      or(
        ilike(properties.location, `%${query.location}%`),
        ilike(properties.city, `%${query.location}%`)
      )
    );
  }
  if (query.budgetMin !== undefined) {
    conditions.push(gte(properties.priceInr, query.budgetMin));
  }
  if (query.budgetMax !== undefined) {
    conditions.push(lte(properties.priceInr, query.budgetMax));
  }
  if (query.type) {
    conditions.push(eq(properties.type, query.type));
  }
  if (query.bhk) {
    conditions.push(ilike(properties.bhk, `%${query.bhk}%`));
  }
  if (query.city) {
    conditions.push(ilike(properties.city, `%${query.city}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(properties)
    .where(whereClause)
    .limit(10);

  return results;
}

export function streamCallPrep(params: {
  leadData: Record<string, any>;
  analysis: Record<string, any>;
  matchingProperties: any[];
  userMessage: string;
  chatHistory: { role: string; content: string }[];
}) {
  const { leadData, analysis, matchingProperties, userMessage, chatHistory } = params;

  const systemPrompt = `You are an AI call prep assistant for a real-estate salesperson. Help them prepare for a call with their lead, recommend properties, and answer questions about the property database.

Lead Context:
Name: ${leadData.name || 'N/A'}
Location: ${leadData.location || 'N/A'}
Property Type: ${leadData.propertyType || 'N/A'}
BHK: ${leadData.bhkConfig || 'N/A'}
Budget: ${leadData.budgetMin || 'N/A'} - ${leadData.budgetMax || 'N/A'} Lakhs
Timeline: ${leadData.buyingTimeline || 'N/A'}
Requirements: ${(analysis.keyRequirements || []).join(', ')}
Objections: ${(analysis.objectionsAndConcerns || []).join(', ')}

Matching Properties:
${matchingProperties.length === 0 ? 'No matching properties found in our database.' : matchingProperties.map(p => 
  `- [${p.id}] ${p.name} (${p.type}${p.bhk ? ', ' + p.bhk : ''}) in ${p.location}, ${p.city} | ${p.sqft} sq.ft | Price: ₹${p.priceInr >= 100 ? (p.priceInr/100).toFixed(1) + ' Cr' : p.priceInr + 'L'} | ${p.possessionStatus} | Builder: ${p.builder}`
).join('\n')}

Instructions:
- When showing property results, present them in a clear, organized format
- Recommend the best property match with reasoning based on the lead's specific requirements
- Suggest talking points and questions for the call
- If asked to compare, provide a structured comparison
- Be concise and actionable`;

  const messages: CoreMessage[] = [
    ...chatHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  return streamText({
    model: google('gemini-2.5-flash-preview-05-20'),
    system: systemPrompt,
    messages,
  });
}
