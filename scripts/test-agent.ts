import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Allow running graph code in a CLI harness where server-only would otherwise throw.
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

// Ensure model constructors can initialize in local harness mode.
if (!process.env.GOOGLE_API_KEY) {
  process.env.GOOGLE_API_KEY = 'test-key';
}

let agentGraph: Awaited<ReturnType<typeof loadGraph>>['agentGraph'];

async function loadGraph() {
  const mod = await import('../src/ai/graph');
  return { agentGraph: mod.agentGraph };
}

interface TestCase {
  query: string;
  description?: string;
  expectHumanReview?: boolean;
}

const additionalTestCases: TestCase[] = [
  {
    query: 'How do I do skin-to-skin with my 32-week baby?',
    description: 'Preterm care topic',
  },
  {
    query: "I'm feeling really anxious and overwhelmed since my baby was born early",
    description: 'Emotional support',
  },
  {
    query: 'What support services are available in Taranaki for preterm families?',
    description: 'Regional services',
  },
];

const testCases: TestCase[] = [
  {
    query: 'What financial support is available for parents of preterm twins in New Zealand?',
    description: 'Funding query - should route to FundingEligibilityChecker with tools',
    expectHumanReview: true,
  },
  {
    query: "I'm looking for culturally safe support services for our whanau in Taranaki",
    description: 'Cultural + resource query - should use ResourceNavigator + tools',
  },
  {
    query: 'How do I apply for Best Start payments?',
    description: 'Planning + execution query',
  },
  {
    query: "My baby was born at 28 weeks. I'm feeling overwhelmed and don't know where to start.",
    description: 'High emotional load - trauma-informed path expected',
  },
  ...additionalTestCases,
];

async function runTest(testCase: TestCase) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST: ${testCase.description || testCase.query}`);
  console.log(`Query: "${testCase.query}"`);
  console.log('='.repeat(80));

  try {
    const result = await agentGraph.invoke({
      query: testCase.query,
      consentGiven: true,
    }, {
      configurable: {
        thread_id: `test-harness-${Date.now()}`,
      },
    });

    console.log('\nRouting & Agent:');
    console.log(`   Current Agent: ${result.currentAgent}`);
    console.log(`   Intent: ${result.intent}`);

    console.log('\nFinal Response:');
    console.log(result.finalResponse || '(No final response generated)');

    console.log('\nMetadata:');
    console.log(`   Requires Human Review: ${result.requiresHumanReview}`);
    console.log(`   Show Urgent Help: ${result.showUrgentHelp}`);
    console.log(`   Sources: ${result.sources?.length || 0} source(s)`);

    if (testCase.expectHumanReview !== undefined) {
      const status = result.requiresHumanReview === testCase.expectHumanReview ? 'PASS' : 'FAIL';
      console.log(`\n${status} Expected requiresHumanReview: ${testCase.expectHumanReview}`);
    }
  } catch (error) {
    console.error('\nERROR:', error);
  }
}

async function runAllTests() {
  ({ agentGraph } = await loadGraph());

  console.log('Starting Agent Testing Harness\n');

  for (const testCase of testCases) {
    await runTest(testCase);
  }

  console.log('\n' + '='.repeat(80));
  console.log('Testing complete');
  console.log('='.repeat(80) + '\n');
}

runAllTests();
