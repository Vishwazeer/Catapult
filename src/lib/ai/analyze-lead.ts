import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { leadAnalysisSchema, type LeadAnalysis } from './schemas';

export async function analyzeLead(leadData: Record<string, any>): Promise<LeadAnalysis> {
  const systemPrompt = `You are an expert real-estate sales analyst for the Indian real-estate market. Your role is to analyze lead data, extract their primary buying intent, score the lead quality, and generate actionable call prep questions for the salesperson.
  
Scoring Criteria (0-100):
- High scores (70-100): Clear budget, short timeline (immediate/1-3 months), specific property requirements (BHK, location, amenities), loan pre-approved or full cash, ready-to-move preference.
- Medium scores (40-69): Interested but missing key details, longer timeline (3-6 months), unclear loan readiness, general location preference.
- Low scores (0-39): Early stage exploring, vague requirements, 6-12 months or "just exploring", no budget clarity, no loan plans.

Analyze the customer message carefully for hidden intent, urgency signals, and potential objections. Generate specific, actionable call prep questions.`;

  const budgetStr = leadData.budgetMin || leadData.budgetMax
    ? `₹${leadData.budgetMin || '?'} - ₹${leadData.budgetMax || '?'} Lakhs`
    : 'Not specified';

  const userPrompt = `Please analyze the following real-estate lead:

Personal Info:
- Name: ${leadData.name || 'N/A'}
- Email: ${leadData.email || 'N/A'}
- Phone: ${leadData.phone || 'N/A'}
- Source: ${leadData.source || 'N/A'}

Property Preferences:
- Location: ${leadData.location || 'N/A'}
- Property Type: ${leadData.propertyType || 'N/A'}
- BHK Configuration: ${leadData.bhkConfig || 'N/A'}
- Sq.ft Range: ${leadData.sqftMin || '?'} - ${leadData.sqftMax || '?'}
- Preferred Floor: ${leadData.preferredFloor || 'N/A'}
- Facing Direction: ${leadData.facingDirection || 'N/A'}

Budget & Financing:
- Budget Range: ${budgetStr}
- Loan Ready: ${leadData.loanReady || 'N/A'}
- Max Loan Amount: ${leadData.maxLoanAmount ? `₹${leadData.maxLoanAmount} Lakhs` : 'N/A'}
- Credit Score Range: ${leadData.creditScoreRange || 'N/A'}
- Down Payment Available: ${leadData.downPaymentAvailable ? `₹${leadData.downPaymentAvailable} Lakhs` : 'N/A'}

Timeline & Urgency:
- Buying Timeline: ${leadData.buyingTimeline || 'N/A'}
- Occupancy Type: ${leadData.occupancyType || 'N/A'}
- Possession Preference: ${leadData.possessionPreference || 'N/A'}

Requirements:
- Preferred Amenities: ${Array.isArray(leadData.preferredAmenities) ? leadData.preferredAmenities.join(', ') : 'N/A'}
- Must-have Features: ${leadData.mustHaveFeatures || 'N/A'}
- Deal-breakers: ${leadData.dealBreakers || 'N/A'}

Customer Message (verbatim):
${leadData.customerMessage || 'No message provided.'}`;

  const { object } = await generateObject({
    model: google('gemini-2.5-flash-preview-05-20'),
    schema: leadAnalysisSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return object;
}
