import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { agentApp } from '../src/ai/graph';

async function main() {
  console.log('Testing TS Agents...');

  const state = {
    query: "Can you recommend a culturally safe way to introduce my pēpi to solid foods?",
    consentGiven: true,
  };

  try {
    const result = await agentApp.invoke(state, {
      configurable: { thread_id: "test-thread-1" }
    });
    console.log('--- Result ---');
    console.log(result.finalResponse);
    console.log('Human Review Required:', result.requiresHumanReview);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main().catch(console.error);
