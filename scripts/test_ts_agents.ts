import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { agentApp } from '../src/ai/graph';

async function main() {
  console.log('Testing TS Agents...');

  const testCases = [
    {
      id: "CULTURAL_FEEDING",
      query: "Can you recommend a culturally safe way to introduce my pēpi to solid foods?",
    },
    {
      id: "CLINICAL_RED_FLAG",
      query: "My baby's temperature is 39 degrees C and they are very lethargic. What should I do?",
    },
    {
      id: "NICU_TUBE_FEEDING",
      query: "How do I transition my baby from an NG tube to breastfeeding?",
    },
    {
      id: "EMOTIONAL_DISTRESS",
      query: "I can't stop crying today. I feel like a terrible mother because I'm not allowed to hold my baby yet.",
    },
    {
      id: "CULTURAL_TIKANGA",
      query: "What is the proper tikanga for taking the whenua (placenta) home from the hospital?",
    },
    {
      id: "SOCIAL_WORKER_WELLNESS",
      query: "I need help with WINZ forms and also want to find a naturopath near Starship hospital.",
    },
    {
      id: "HOSPITAL_FACILITIES",
      query: "Where is the cafeteria and how do I book a room at the hospital?",
    },
    {
      id: "LOCAL_DIRECTORY_SEARCH",
      query: "Can you find the Citizens Advice Bureau and a local taxi company near Wellington Hospital?",
    },
    {
      id: "LIVE_WEB_SEARCH",
      query: "What are the latest guidelines for RSV immunization for infants in New Zealand this year?",
    },
    {
      id: "RESOURCE_NAVIGATION",
      query: "I am struggling to pay for parking at Starship Hospital every day while my baby is in the NICU. Is there any financial support available for parents?",
    },
    {
      id: "TE_REO_MAORI",
      query: "How do I apply for the Preterm Baby Payment? I am in Wellington.",
      locale: "mi"
    }
  ];

  for (const tc of testCases) {
    console.log(`\n=================================================`);
    console.log(`🧪 RUNNING TEST CASE: ${tc.id}`);
    console.log(`💬 Query: "${tc.query}"`);
    console.log(`=================================================\n`);
    
    const state = {
      query: tc.query,
      consentGiven: true,
      chatHistory: [],
      locale: tc.locale
    };

    try {
      const result = await agentApp.invoke(state, {
        configurable: { thread_id: `test-thread-${tc.id}` }
      });
      
      console.log('✅ TEST COMPLETED');
      console.log(`📌 Primary Intent:    ${result.intent || 'UNKNOWN'}`);
      console.log(`🧑‍⚕️ Human Review:     ${result.requiresHumanReview ? 'YES 🛑' : 'NO ✅'}`);
      console.log(`\n🤖 Final Response Preview (First 200 chars):\n${result.finalResponse?.substring(0, 200)}...\n`);
    } catch (error) {
      console.error(`❌ TEST FAILED:`, error);
    }
  }
}

main().catch(console.error);
