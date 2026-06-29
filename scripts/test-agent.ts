import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Allow CLI execution of modules that import `server-only`.
try {
  const serverOnlyPath = require.resolve('server-only');
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
    children: [],
    path: '',
    paths: [],
  } as unknown as NodeModule;
} catch {
  // no-op
}

interface TestCase {
  query: string;
  description?: string;
}

const testCases: TestCase[] = [
  { query: 'What financial support is available for parents of preterm twins?', description: 'Funding query' },
  { query: "I'm looking for culturally safe support in Taranaki", description: 'Cultural query' },
  { query: 'How do I apply for Best Start payments?', description: 'Planning query' },
  { query: "My baby was born at 28 weeks. I'm feeling overwhelmed.", description: 'Emotional support query' },
  { query: 'How do I do skin-to-skin with my 32-week baby?', description: 'Preterm care topic' },
  {
    query: 'What support services are available in Taranaki for preterm families?',
    description: 'Regional services',
  },
];

async function runRoutingOnlyTest(testCase: TestCase) {
  console.log('\n' + '='.repeat(90));
  console.log(`🧪 TEST: ${testCase.description}`);
  console.log(`Query: "${testCase.query}"`);
  console.log('='.repeat(90));

  try {
    // Dynamically import to avoid top-level await issues
    const { agentGraph } = await import('../src/ai/graph');

    const result = await agentGraph.invoke({
      query: testCase.query,
      consentGiven: true,
    });

    console.log(`\n📍 Routed To: ${result.currentAgent}`);
    console.log(`📍 Intent: ${result.intent}`);
    console.log(`📍 Requires Human Review: ${result.requiresHumanReview}`);
    console.log(`📍 Show Urgent Help: ${result.showUrgentHelp}`);

    if (result.finalResponse) {
      console.log(`\n📝 Final Response (truncated):\n${result.finalResponse.substring(0, 300)}...`);
    } else {
      console.log('\n📝 Final Response: (No final content generated — likely tool/LLM step)');
    }
  } catch (error: any) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n🚀 Running Routing-Only Test Harness (No LLM calls)\n');

  for (const testCase of testCases) {
    await runRoutingOnlyTest(testCase);
  }

  console.log('\n' + '='.repeat(90));
  console.log('✅ Routing-only test run complete');
  console.log('='.repeat(90) + '\n');
}

runAllTests();
