import { describe, it, expect, beforeAll } from 'vitest';
import { Ruru } from '../agents/ruru';

beforeAll(() => {
  process.env.TAVILY_API_KEY = 'test_key';
});

describe('ClinicalTriageCompanion', () => {
  // We mock out the actual Chat model to return specific tool calls so we don't have to hit the real Gemini API for unit tests,
  // or we can test the tool logic directly. For this test, we'll just test the tool directly to ensure the logic works.
  
  it('correctly formats an EMERGENCY symptom', async () => {
    // Import the tool directly
    const { clinicalTriageTool } = await import('../tools');
    
    // @ts-ignore - bypassing the wrapper to test the inner function
    const result = await clinicalTriageTool.func({
      symptom: 'severe chest pain',
      severity: 'EMERGENCY'
    });

    expect(result).toContain('111');
    expect(result).toContain('life-threatening');
    expect(result).toContain('severe chest pain');
  });

  it('correctly formats an URGENT symptom', async () => {
    const { clinicalTriageTool } = await import('../tools');
    
    // @ts-ignore
    const result = await clinicalTriageTool.func({
      symptom: 'high fever',
      severity: 'URGENT'
    });

    expect(result).toContain('0800 611 116');
    expect(result).toContain('Healthline');
    expect(result).not.toContain('immediately call 111 for an ambulance');
  });

  it('correctly formats an INFO symptom', async () => {
    const { clinicalTriageTool } = await import('../tools');
    
    // @ts-ignore
    const result = await clinicalTriageTool.func({
      symptom: 'mild rash',
      severity: 'INFO'
    });

    expect(result).toContain('GP or healthcare provider');
    expect(result).toContain('mild rash');
    expect(result).not.toContain('111');
  });
});
