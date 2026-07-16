import { SystemMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { createAgentLLM } from './llm';

/**
 * Shared intent classifier.
 *
 * Single source of truth for routing - previously graph.ts and
 * aether-summit.ts each ran their own classifier with prompts that had
 * drifted apart (9-way vs 4-way), so the same question could route
 * differently depending on the API entry point.
 */

export type Intent =
 | 'RESEARCH'
 | 'PLANNING'
 | 'EXECUTION'
 | 'CLINICAL'
 | 'ADVOCACY'
 | 'TRANSLATE'
 | 'NUTRITION'
 | 'CULTURAL'
 | 'LOCAL_SERVICES'
 | 'COMPLEX';

const INTENTS: Intent[] = [
 'RESEARCH', 'PLANNING', 'EXECUTION', 'CLINICAL', 'ADVOCACY',
 'TRANSLATE', 'NUTRITION', 'CULTURAL', 'LOCAL_SERVICES', 'COMPLEX',
];

const intentClassifier = createAgentLLM({
 model: 'gemini-2.5-flash',
 temperature: 0,
 maxOutputTokens: 1024,
});

const SYSTEM_PROMPT = `You are an intent classifier for a preterm whanau support system in Aotearoa New Zealand.

Classify the user's query into exactly one of these categories:
- RESEARCH: Questions about information, eligibility, definitions, or facts.
- PLANNING: Questions about steps, pathways, advice, or "how do I".
- EXECUTION: Requests to check eligibility, apply for payments/support, or take a concrete financial action. NOT email/letter drafting - that is ADVOCACY.
- CLINICAL: Questions about medical symptoms, diagnosis, sickness, or medical advice.
- ADVOCACY: Requests to draft emails, challenge decisions, or learn about legal/hospital rights.
- TRANSLATE: Requests to explain or translate complex medical jargon or reports into simple English.
- NUTRITION: Questions specifically about feeding, tube feeding, breastfeeding, breastmilk, expressing, or solids.
- CULTURAL: Questions specifically about tikanga, karakia, marae, iwi, whenua, or Maori cultural practices.
- LOCAL_SERVICES: Requests to find services, clinics, organisations, or support groups in a specific place or near the user (e.g. "services in Taranaki", "support groups near me").
- COMPLEX: Queries that combine multiple intents or are emotionally heavy.

Respond with ONLY one word: RESEARCH, PLANNING, EXECUTION, CLINICAL, ADVOCACY, TRANSLATE, NUTRITION, CULTURAL, LOCAL_SERVICES, or COMPLEX.`;

export async function classifyIntent(query: string, history?: BaseMessage[]): Promise<Intent> {
 // Follow-ups like "how much is it per week?" are unclassifiable in
 // isolation - give the classifier a compact view of the recent turns.
 const recent = (history || [])
 .slice(-4, -1) // last few turns, excluding the current query itself
 .map((m) => {
 const role = m._getType?.() === 'human' ? 'User' : 'Assistant';
 const text = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
 return `${role}: ${text.slice(0, 200)}`;
 })
 .join('\n');

 const userContent = recent
 ? `Recent conversation:\n${recent}\n\nCurrent query to classify: ${query}`
 : query;

 const response = await intentClassifier.invoke([
 new SystemMessage(SYSTEM_PROMPT),
 new HumanMessage(userContent),
 ]);

 const intent = response.content.toString().trim().toUpperCase() as Intent;
 return INTENTS.includes(intent) ? intent : 'COMPLEX';
}
