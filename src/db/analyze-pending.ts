import 'dotenv/config';
import { db } from './index';
import { leads, leadAnalyses } from './schema';
import { analyzeLead } from '../lib/ai/analyze-lead';
import { isNull, eq } from 'drizzle-orm';

async function analyzePending() {
  console.log('Checking for unanalyzed leads...');
  const allLeads = await db
    .select({
      lead: leads,
      analysis: leadAnalyses,
    })
    .from(leads)
    .leftJoin(leadAnalyses, eq(leads.id, leadAnalyses.leadId));

  const pending = allLeads.filter(r => !r.analysis);
  console.log(`Found ${pending.length} unanalyzed leads.`);

  for (const { lead } of pending) {
    console.log(`Analyzing lead #${lead.id} (${lead.name})...`);
    try {
      const analysis = await analyzeLead(lead);
      await db.insert(leadAnalyses).values({
        leadId: lead.id,
        summary: analysis.summary,
        intent: analysis.intent,
        keyRequirements: analysis.keyRequirements,
        objectionsAndConcerns: analysis.objectionsAndConcerns,
        recommendedNextAction: analysis.recommendedNextAction,
        suggestedResponse: analysis.suggestedResponse,
        score: analysis.score,
        tag: analysis.tag,
        reasoning: analysis.reasoning,
        callPrepQuestions: analysis.callPrepQuestions,
      });
      console.log(`✓ Lead #${lead.id} analyzed as [${analysis.tag.toUpperCase()}] with score ${analysis.score}`);
    } catch (err: any) {
      console.error(`Failed to analyze lead #${lead.id}:`, err?.message || err);
    }
  }
  console.log('Done!');
}

analyzePending()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
