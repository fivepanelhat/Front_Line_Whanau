async function classifyAndRoute(query: string) {
  const q = query.toLowerCase().trim();

  // 1. Funding / Financial / Best Start / WINZ
  if (
    q.includes('funding') ||
    q.includes('financial') ||
    q.includes('best start') ||
    q.includes('winz') ||
    q.includes('allowance') ||
    q.includes('payment')
  ) {
    return { intent: 'EXECUTION', agent: 'funding_eligibility_checker' };
  }

  // 2. Cultural Safety (Māori / Iwi)
  if (
    q.includes('cultural') ||
    q.includes('marae') ||
    q.includes('iwi') ||
    q.includes('kaumātua') ||
    q.includes('whakapapa') ||
    q.includes('māori')
  ) {
    return { intent: 'RESEARCH', agent: 'cultural_safety_guardian' };
  }

  // 3. Emotional / Trauma / Overwhelm
  if (
    q.includes('overwhelm') ||
    q.includes('emotional') ||
    q.includes('scared') ||
    q.includes('anxious') ||
    q.includes('grief') ||
    q.includes('feeling')
  ) {
    return { intent: 'PLANNING', agent: 'trauma_informed_companion' };
  }

  // 4. Regional / Local Support Services
  if (
    (q.includes('support') || q.includes('service')) &&
    (q.includes('taranaki') || q.includes('region') || q.includes('local') || q.includes('near'))
  ) {
    return { intent: 'RESEARCH', agent: 'resource_navigator' };
  }

  // 5. Preterm Care Topics
  if (
    q.includes('skin to skin') ||
    q.includes('skin-to-skin') ||
    q.includes('kangaroo care') ||
    q.includes('feeding') ||
    q.includes('breastfeed') ||
    q.includes('breathing') ||
    q.includes('discharge') ||
    q.includes('preterm care')
  ) {
    return { intent: 'RESEARCH', agent: 'knowledge_weaver' };
  }

  // 6. General Service / Directory queries
  if (
    q.includes('support service') ||
    q.includes('where can i') ||
    q.includes('find support') ||
    q.includes('directory')
  ) {
    return { intent: 'RESEARCH', agent: 'resource_navigator' };
  }

  // === Fallback ===
  if (q.includes('how do i') || q.includes('what is') || q.includes('apply')) {
    return { intent: 'EXECUTION', agent: 'knowledge_weaver' };
  }

  return { intent: 'COMPLEX', agent: 'knowledge_weaver' };
}

async function testRouting(query: string) {
  const { intent, agent } = await classifyAndRoute(query);
  console.log(`\nQuery: "${query}"`);
  console.log(`→ Intent: ${intent}`);
  console.log(`→ Routed to: ${agent}`);
}

const testQueries = [
  'What financial support is available for parents of preterm twins?',
  "I'm looking for culturally safe support in Taranaki",
  'How do I apply for Best Start payments?',
  "My baby was born at 28 weeks. I'm feeling overwhelmed.",
  'How do I do skin-to-skin with my 32-week baby?',
  'What support services are available in Taranaki for preterm families?',
];

async function run() {
  console.log('🧪 Offline Routing Test (Synced with Production)\n');
  for (const q of testQueries) {
    await testRouting(q);
  }
  console.log('\n✅ Done');
}

run();
