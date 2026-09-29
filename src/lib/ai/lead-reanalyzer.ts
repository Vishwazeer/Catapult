import { createGroq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { simulationReanalysisSchema, type SimulationReanalysis } from './schemas';
import { formatCurrency } from '../utils';

export async function reanalyzeLead(params: {
  leadData: Record<string, any>;
  originalAnalysis: Record<string, any>;
  conversationHistory: { role: string; content: string }[];
  availableProperties?: any[];
}): Promise<SimulationReanalysis> {
  const { leadData, originalAnalysis, conversationHistory, availableProperties = [] } = params;

  const budgetStr = leadData.budgetMin || leadData.budgetMax
    ? `₹${leadData.budgetMin || '?'} - ₹${leadData.budgetMax || '?'} Lakhs`
    : 'Not specified';

  const conversationText = conversationHistory
    .map(msg => `${msg.role === 'salesperson' ? 'SALESPERSON' : 'CUSTOMER'}: ${msg.content}`)
    .join('\n\n');

  const propertiesListText = availableProperties.length > 0
    ? availableProperties
        .map(
          (p) => {
            const priceLakhs = p.priceInr ?? p.price_inr ?? 0;
            const formattedPrice = formatCurrency(priceLakhs);
            const status = p.possessionStatus || p.possession_status || 'ready';
            return `- [ID: ${p.id}] "${p.name}" in ${p.location}, ${p.city} | ${p.bhk || p.type} | ${p.sqft} sq.ft | Exact Price: ${formattedPrice} (₹${priceLakhs} Lakhs) | Status: ${status} | Builder: ${p.builder}`;
          }
        )
        .join('\n')
    : 'No specific inventory currently in database.';

  const systemPrompt = `You are a real-estate lead qualification and sales assistance engine.

You are given:
1. The original lead information.
2. The original AI analysis.
3. The complete salesperson/customer conversation.
4. AVAILABLE PROPERTY INVENTORY from the real database.

Your job is to:
A. Evaluate whether the customer's qualification (intent, urgency, score, tag) has changed.
B. Recommend the best matching property from the real database (matchedPropertyId).
C. Suggest a tailored follow-up reply for the salesperson to send next.

CRITICAL PROPERTY GROUNDING RULES:
1. When recommending a property in 'suggestedResponse' and selecting 'matchedPropertyId', you MUST ONLY choose from the provided AVAILABLE PROPERTY INVENTORY list.
2. NEVER invent fake project names, fake locations, or arbitrary pricing. Use the exact name, location, price, and BHK from the inventory list.
3. If a customer mentions specific desires (e.g. 2 BHK in Noida, ready to move), pick the property in the inventory list that matches closest.

SUGGESTED RESPONSE INSTRUCTIONS:
Always craft a concise, professional, and persuasive 'suggestedResponse' for the salesperson to send back to the customer.
- Directly answer the customer's latest questions or hesitations.
- Explicitly mention the best matching property from the database list by its real name and price.
- End with a clear, low-friction call-to-action (e.g. scheduling a site visit for the weekend).`;

  const userPrompt = `ORIGINAL LEAD DATA:
Name: ${leadData.name || 'N/A'}
Location: ${leadData.location || 'N/A'}
Property Type: ${leadData.propertyType || 'N/A'}
BHK: ${leadData.bhkConfig || 'N/A'}
Budget: ${budgetStr}
Timeline: ${leadData.buyingTimeline || 'N/A'}
Loan Ready: ${leadData.loanReady || 'N/A'}
Customer Message: ${leadData.customerMessage || 'N/A'}

ORIGINAL AI ANALYSIS:
Score: ${originalAnalysis.score}/100
Tag: ${originalAnalysis.tag}
Intent: ${originalAnalysis.intent}
Summary: ${originalAnalysis.summary}
Key Requirements: ${(originalAnalysis.keyRequirements || []).join(', ')}
Objections: ${(originalAnalysis.objectionsAndConcerns || []).join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE PROPERTY INVENTORY FROM DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${propertiesListText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${conversationText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on this conversation and the real inventory list, provide your updated lead qualification assessment, matchedPropertyId, and suggestedResponse.`;

  // Primary: Gemini
  try {
    const { object } = await generateObject({
      model: google('gemini-flash-latest'),
      schema: simulationReanalysisSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    return object;
  } catch (primaryErr: any) {
    console.warn('Gemini reanalysis failed, falling back to Groq:', primaryErr?.message || primaryErr);
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    const { object } = await generateObject({
      model: groq('openai/gpt-oss-120b'),
      schema: simulationReanalysisSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    return object;
  }
}
