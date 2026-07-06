import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(function () {
    return { invoke: mockInvoke };
  }),
}));

import { classifyIntent } from '../classifier';

describe('classifyIntent', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('returns the model intent when valid', async () => {
    mockInvoke.mockResolvedValue({ content: 'RESEARCH' });
    expect(await classifyIntent('what is best start?')).toBe('RESEARCH');
  });

  it('normalises whitespace and case', async () => {
    mockInvoke.mockResolvedValue({ content: '  planning \n' });
    expect(await classifyIntent('how do I apply?')).toBe('PLANNING');
  });

  it('falls back to COMPLEX for unknown labels', async () => {
    mockInvoke.mockResolvedValue({ content: 'BANANA' });
    expect(await classifyIntent('gibberish')).toBe('COMPLEX');
  });

  it('includes recent history as context for follow-ups', async () => {
    mockInvoke.mockResolvedValue({ content: 'EXECUTION' });
    const history = [
      new HumanMessage('can I get the preterm baby payment?'),
      new AIMessage('Yes — you may be eligible.'),
      new AIMessage({ content: [{ type: 'text', text: 'structured reply' }] }),
      new HumanMessage('how much is it per week?'),
    ];

    expect(await classifyIntent('how much is it per week?', history)).toBe('EXECUTION');

    const [, human] = mockInvoke.mock.calls[0][0];
    expect(human.content).toContain('Recent conversation:');
    expect(human.content).toContain('User: can I get the preterm baby payment?');
    // Non-string message content is JSON-stringified, not dropped
    expect(human.content).toContain('structured reply');
    expect(human.content).toContain('Current query to classify: how much is it per week?');
  });

  it('sends the bare query when history is empty', async () => {
    mockInvoke.mockResolvedValue({ content: 'CLINICAL' });
    await classifyIntent('baby has a fever', []);
    const [, human] = mockInvoke.mock.calls[0][0];
    expect(human.content).toBe('baby has a fever');
  });
});
