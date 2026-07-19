import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock('@langchain/langgraph/prebuilt', () => ({
  createReactAgent: vi.fn(() => ({ invoke: mockInvoke })),
}));

vi.mock('../llm', () => ({
  createAgentLLM: vi.fn(() => ({})),
}));

vi.mock('../tools', () => ({
  webSearchTool: { name: 'web_search' },
}));

import { WhanauPathwayArchitect } from '../pathway-architect';

describe('WhanauPathwayArchitect', () => {
  const agent = new WhanauPathwayArchitect();

  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('returns the final message content as a string', async () => {
    mockInvoke.mockResolvedValue({
      messages: [
        { content: 'intermediate tool call' },
        { content: 'Step 1: Call WINZ on 0800 559 009.' },
      ],
    });

    const res = await agent.process('how do I apply for the preterm baby payment?');
    expect(res.content).toBe('Step 1: Call WINZ on 0800 559 009.');
    expect(res.agentUsed).toBe('Whānau Pathway Architect');
    expect(res.requiresHumanReview).toBe(false);
  });

  it('flattens structured content blocks', async () => {
    mockInvoke.mockResolvedValue({
      messages: [{ content: [{ text: 'Step 1.' }, { type: 'other', data: 1 }] }],
    });

    const res = await agent.process('steps please');
    expect(res.content).toContain('Step 1.');
    expect(res.content).toContain('"data":1');
  });

  it('stringifies non-string, non-array content', async () => {
    mockInvoke.mockResolvedValue({ messages: [{ content: 42 }] });
    const res = await agent.process('odd payload');
    expect(res.content).toBe('42');
  });
});
