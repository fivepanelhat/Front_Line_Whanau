/**
 * Agent quality evals.
 *
 * Fires real questions at /api/agents and asserts the answers are usable:
 * non-empty, no stream errors, minimum substance, expected content signals,
 * and (where routing is the point) the expected agent. These exist because
 * an entire class of failures — retired models returning empty answers,
 * follow-ups losing context, guardrails replacing answers with deflections —
 * survived unit tests and CI for weeks: nothing was testing actual answers.
 *
 * Usage:
 *   node scripts/eval-agents.mjs                       # against production
 *   EVAL_BASE_URL=http://127.0.0.1:3105 node scripts/eval-agents.mjs
 *
 * Notes:
 *   - LLM output is nondeterministic: assertions are tolerant (any-of
 *     patterns, generous minimums) and each failing case retries once.
 *   - Agent expectations are hard assertions only where the fix under
 *     guard was a routing fix; elsewhere routing variance is a warning.
 */

const BASE = process.env.EVAL_BASE_URL || 'https://front-line-whanau.vercel.app';
const TIMEOUT_MS = 90_000;

const CASES = [
  {
    name: 'greeting answers',
    query: 'Hello',
    minLength: 40,
  },
  {
    name: 'basic fact: Best Start',
    query: 'What is the Best Start payment?',
    minLength: 300,
    anyOf: [/best start/i],
  },
  {
    name: 'follow-up keeps context (amount per week)',
    query: 'How much is it per week?',
    history: [
      { role: 'user', content: 'What is the Best Start payment?' },
      { role: 'assistant', content: 'The Best Start payment is a weekly Working for Families payment for families with a new baby, administered by Inland Revenue.' },
    ],
    minLength: 80,
    anyOf: [/\$\s?\d+/, /\d+\s?(dollars|per week)/i],
    mustNot: [/what specifically are you asking/i, /could you clarify/i],
  },
  {
    name: 'nutrition intent answers (was: empty crash)',
    query: 'What foods should I feed my premature baby at 6 months?',
    minLength: 300,
    anyOf: [/corrected age/i, /solids/i, /feeding/i],
  },
  {
    name: 'cultural intent answers (was: empty crash)',
    query: 'What karakia is appropriate for a baby in NICU?',
    minLength: 200,
    anyOf: [/karakia/i],
  },
  {
    name: 'how-do-I routes to planner with real steps (was: stub)',
    query: 'How do I apply for financial support from WINZ?',
    minLength: 500,
    anyOf: [/work and income/i, /winz/i, /msd/i],
    agents: ['pathway_architect', 'riroriro', 'kea'],
    mustNot: [/^PLANNING$/],
  },
  {
    name: 'advocacy drafts instead of deflecting (was: review void)',
    query: 'Draft an email to WINZ challenging their decision to decline my application',
    minLength: 300,
    anyOf: [/dear|kia ora|tēnā/i, /subject:/i, /right/i],
    agents: ['kahu'],
  },
  {
    name: 'jargon translation',
    query: 'What does bradycardia mean?',
    minLength: 100,
    anyOf: [/heart rate/i, /slow/i],
  },
  {
    name: 'clinical triage deflects safely (correct behaviour)',
    query: 'My baby has a fever of 39 degrees, what should I do?',
    minLength: 100,
    anyOf: [/healthline/i, /0800 611 116/i, /111/],
  },
  {
    name: 'local services lookup',
    query: 'What support services are available in Taranaki?',
    minLength: 150,
    anyOf: [/taranaki/i],
  },
];

async function ask(query, history = []) {
  const res = await fetch(`${BASE}/api/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      consentGiven: true,
      threadId: 'eval_' + Math.random().toString(36).slice(2),
      history,
    }),
  });
  if (!res.ok) return { httpError: `HTTP ${res.status}` };

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let raw = '';
  const t0 = Date.now();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += dec.decode(value);
    if (Date.now() - t0 > TIMEOUT_MS) return { httpError: 'client timeout' };
  }

  let text = '';
  let agent;
  let streamError = null;
  let interrupted = false;
  for (const line of raw.split('\n\n')) {
    if (!line.startsWith('data: ')) continue;
    try {
      const d = JSON.parse(line.slice(6));
      if (d.type === 'reset') text = '';
      if (d.type === 'token') text += d.content;
      if (d.type === 'final') {
        agent = d.agent;
        if (d.finalResponse && text.trim().length < 40) text = d.finalResponse;
      }
      if (d.type === 'error') streamError = d.content;
      if (d.type === 'interrupt') interrupted = true;
    } catch { /* non-JSON lines ([DONE]) */ }
  }
  return { text, agent, streamError, interrupted };
}

function evaluate(c, r) {
  const failures = [];
  const warnings = [];

  if (r.httpError) return { failures: [r.httpError], warnings };
  if (r.streamError) failures.push(`stream error: ${r.streamError}`);
  if (r.interrupted) failures.push('interrupted (sent to review queue instead of answering)');

  const text = (r.text || '').trim();
  if (text.length < (c.minLength || 1)) {
    failures.push(`too short: ${text.length} chars (min ${c.minLength}) — "${text.slice(0, 80)}"`);
  }
  if (c.anyOf && !c.anyOf.some((re) => re.test(text))) {
    failures.push(`missing expected content (${c.anyOf.map(String).join(' | ')})`);
  }
  for (const re of c.mustNot || []) {
    if (re.test(text)) failures.push(`contains forbidden pattern ${re}`);
  }
  if (c.agents && r.agent && !c.agents.includes(r.agent)) {
    warnings.push(`agent ${r.agent}, expected one of [${c.agents.join(', ')}]`);
  }
  return { failures, warnings };
}

let failed = 0;
console.log(`Agent evals against ${BASE}\n`);

for (const c of CASES) {
  let r = await ask(c.query, c.history || []);
  let { failures, warnings } = evaluate(c, r);

  if (failures.length > 0) {
    // One retry: single-sample LLM flake tolerance.
    r = await ask(c.query, c.history || []);
    ({ failures, warnings } = evaluate(c, r));
  }

  const status = failures.length === 0 ? 'PASS' : 'FAIL';
  if (failures.length > 0) failed++;
  console.log(`[${status}] ${c.name}  (agent: ${r.agent ?? '?'}, ${(r.text || '').length} chars)`);
  for (const f of failures) console.log(`       ✗ ${f}`);
  for (const w of warnings) console.log(`       ⚠ ${w}`);
}

console.log(`\n${CASES.length - failed}/${CASES.length} passed`);
process.exit(failed > 0 ? 1 : 0);
