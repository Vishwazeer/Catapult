import { z } from 'zod';

export const leadAnalysisSchema = z.object({
  summary: z.string().describe('2-3 sentence summary of the lead and their needs'),
  intent: z.string().describe('Primary buying intent - what the customer really wants'),
  keyRequirements: z.array(z.string()).describe('List of specific property requirements extracted'),
  objectionsAndConcerns: z.array(z.string()).describe('Potential objections, hesitations, or concerns'),
  recommendedNextAction: z.string().describe('Specific next action for the salesperson'),
  suggestedResponse: z.string().describe('Draft response message to send to the customer'),
  score: z.number().min(0).max(100).describe('Lead quality score: 0-100. Consider budget readiness, timeline urgency, specificity of requirements, loan readiness'),
  tag: z.enum(['hot', 'warm', 'cold']).describe('hot: score>=70 ready buyer, warm: score 40-69 interested but not urgent, cold: score<40 early stage or unclear'),
  reasoning: z.string().describe('Brief explanation of why this score/tag was assigned'),
  callPrepQuestions: z.array(z.string()).min(3).max(8).describe('Questions the salesperson should ask on the first call to qualify this lead further'),
});

export type LeadAnalysis = z.infer<typeof leadAnalysisSchema>;

export const simulationReanalysisSchema = z.object({
  intent: z.enum(['high', 'medium', 'low']).describe('Updated purchase intent level'),
  urgency: z.enum(['high', 'medium', 'low']).describe('Updated urgency level'),
  temperature: z.enum(['hot', 'warm', 'cold']).describe('Updated lead temperature'),
  priorityScore: z.number().min(0).max(100).describe('Updated priority score 0-100'),
  direction: z.enum(['increased', 'unchanged', 'decreased']).describe('Whether qualification changed'),
  scoreChange: z.number().describe('Numeric change in score (positive or negative)'),
  newRequirements: z.array(z.string()).describe('Requirements discovered in conversation'),
  newObjections: z.array(z.string()).describe('New objections or concerns raised'),
  buyingSignals: z.array(z.string()).describe('Positive buying signals detected'),
  informationDiscovered: z.array(z.string()).describe('New information revealed by customer'),
  missingInformation: z.array(z.string()).describe('Information still unknown'),
  recommendedNextAction: z.string().describe('What the salesperson should do next'),
  suggestedResponse: z.string().describe('Recommended draft response message for salesperson to send next'),
  matchedPropertyId: z.number().nullable().optional().describe('The ID of the best matching property chosen from the AVAILABLE PROPERTY INVENTORY list'),
  reasoning: z.string().describe('Brief explanation of why score/tag changed'),
});

export type SimulationReanalysis = z.infer<typeof simulationReanalysisSchema>;
