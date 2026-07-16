import { agentLogger } from '@/lib/logger';

const guardLogger = agentLogger('Guardrails');

interface GuardrailInput {
 content: string;
 agentUsed: string;
}

interface GuardrailResult {
 passed: boolean;
 modifiedResponse?: string;
 showUrgentHelp: boolean;
 reason?: string;
}

export function checkGuardrails(input: GuardrailInput): GuardrailResult {
 const { content, agentUsed } = input;
 const lower = content.toLowerCase();

 // Crisis / Self-harm (highest priority)
 if (lower.includes('suicide') || lower.includes('kill myself') || lower.includes('end my life')) {
 return {
 passed: false,
 modifiedResponse: 
 "I'm concerned about what you've shared. Please reach out for immediate support:\n\n" +
 "- Call or text 1737 (free, 24/7)\n" +
 "- Lifeline: 0800 543 354\n" +
 "- Talk to your midwife, GP, or hospital social worker",
 showUrgentHelp: true,
 reason: 'Crisis language detected',
 };
 }

 // NOTE: this gate inspects the AGENT'S RESPONSE, not the user's query.
 // It previously also pattern-matched medical/financial/cultural phrasing
 // and REPLACED complete, well-grounded answers with "I cannot help"
 // deflections (any answer containing "eligible" + "WINZ" was discarded;
 // any cultural answer over 400 chars was held for review). Those blanket
 // blocks contradicted the agents' entire purpose - the specialist prompts
 // already handle triage boundaries, and the guardrailNode appends the
 // medical disclaimer. Only the crisis gate remains, plus input-side
 // injection checks in checkInputGuardrails.
 void agentUsed;

 return { passed: true, showUrgentHelp: false };
}

export function checkInputGuardrails(query: string): { passed: boolean; reason?: string } {
 const lower = query.toLowerCase();
 
 // Prompt injection / Jailbreak triggers
 const jailbreakTriggers = [
 'ignore previous',
 'ignore all previous',
 'system prompt',
 'you are now',
 'forget your instructions',
 'bypassing',
 'admin mode',
 'developer mode',
 'ignore above',
 'new persona'
 ];

 if (jailbreakTriggers.some(t => lower.includes(t))) {
 guardLogger.warn({ query }, 'Prompt injection or jailbreak attempt detected');
 return {
 passed: false,
 reason: 'Prompt injection or jailbreak attempt detected.'
 };
 }

 return { passed: true };
}
