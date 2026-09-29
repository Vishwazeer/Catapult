import { createGroq } from '@ai-sdk/groq';
import { streamText, type CoreMessage } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export function streamLeadChat(params: {
  leadData: Record<string, any>;
  analysis: Record<string, any>;
  chatHistory: { role: string; content: string }[];
  userMessage: string;
}) {
  const { leadData, analysis, chatHistory, userMessage } = params;

  const systemPrompt = `You are an AI assistant for a real-estate salesperson. You have full context of a specific lead and their analysis. Your goal is to give specific, actionable advice grounded in the lead's data, not generic tips.

Lead Context:
Name: ${leadData.name || 'N/A'}
Location: ${leadData.location || 'N/A'}
Property Type: ${leadData.propertyType || 'N/A'}
BHK: ${leadData.bhkConfig || 'N/A'}
Budget: ${leadData.budgetMin || 'N/A'} - ${leadData.budgetMax || 'N/A'} Lakhs
Timeline: ${leadData.buyingTimeline || 'N/A'}
Loan Ready: ${leadData.loanReady || 'N/A'}
Occupancy: ${leadData.occupancyType || 'N/A'}
Customer Message: ${leadData.customerMessage || 'N/A'}
Must-haves: ${leadData.mustHaveFeatures || 'N/A'}
Deal-breakers: ${leadData.dealBreakers || 'N/A'}

Analysis Context:
Summary: ${analysis.summary || 'N/A'}
Intent: ${analysis.intent || 'N/A'}
Score: ${analysis.score || 'N/A'} (${analysis.tag || 'N/A'})
Reasoning: ${analysis.reasoning || 'N/A'}
Key Requirements: ${(analysis.keyRequirements || []).join(', ')}
Recommended Next Action: ${analysis.recommendedNextAction || 'N/A'}
Objections/Concerns: ${(analysis.objectionsAndConcerns || []).join(', ')}

Respond concisely but with actionable specifics. Reference the lead's actual data in your responses.`;

  const messages: CoreMessage[] = [
    ...chatHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  return streamText({
    model: groq('openai/gpt-oss-120b'),
    system: systemPrompt,
    messages,
  });
}
