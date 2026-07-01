import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Kahu } from '../kahu';
import { Kea } from '../kea';
import { Kiwi } from '../kiwi';
import { Riroriro } from '../riroriro';
import { Ruru } from '../ruru';
import { Takahe } from '../takahe';
import { Tiwaiwaka } from '../tiwaiwaka';
import { Toroa } from '../toroa';
import { Tuatara } from '../tuatara';
import { Tui } from '../tui';

// Shared mock implementation for `invoke`
const { mockInvoke } = vi.hoisted(() => {
  return {
    mockInvoke: vi.fn().mockResolvedValue({
      messages: [{ role: 'ai', content: 'Mocked agent response', _getType: () => 'ai' }]
    })
  };
});

// Mock dependencies
vi.mock('@langchain/langgraph/prebuilt', () => ({
  createReactAgent: vi.fn(() => ({
    invoke: mockInvoke
  }))
}));

vi.mock('../../llm', () => ({
  createAgentLLM: vi.fn(() => ({}))
}));

// We must also mock google-genai because Kiwi and Tiwaiwaka instantiate ChatGoogleGenerativeAI directly
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(function() {
    return { invoke: mockInvoke };
  })
}));

describe('Manu Agents Parametrized Suite', () => {
  const agents = [
    { name: 'kahu', AgentClass: Kahu },
    { name: 'kea', AgentClass: Kea },
    { name: 'kiwi', AgentClass: Kiwi },
    { name: 'riroriro', AgentClass: Riroriro },
    { name: 'ruru', AgentClass: Ruru },
    { name: 'takahe', AgentClass: Takahe },
    { name: 'tiwaiwaka', AgentClass: Tiwaiwaka },
    { name: 'toroa', AgentClass: Toroa },
    { name: 'tuatara', AgentClass: Tuatara },
    { name: 'tui', AgentClass: Tui }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockReset();
    mockInvoke.mockResolvedValue({
      messages: [{ role: 'ai', content: 'Mocked agent response', _getType: () => 'ai' }]
    });
  });

  agents.forEach(({ name, AgentClass }) => {
    describe(`${name} Agent`, () => {
      it(`initializes with correct name '${name}'`, () => {
        const agent = new AgentClass();
        expect(agent.name).toBe(name);
      });

      it(`processes query and returns correct structure`, async () => {
        const agent = new AgentClass();
        
        // Ensure Riroriro's specific mock needs are met
        if (name === 'riroriro') {
          mockInvoke.mockResolvedValueOnce({
            messages: [{ role: 'ai', content: 'Mocked agent response', _getType: () => 'ai' }],
            tool_outputs: []
          });
        }

        const result = await agent.process('Test query', {});
        
        expect(result).toHaveProperty('content', 'Mocked agent response');
        expect(result).toHaveProperty('agentUsed', name);
      });
      
      it(`handles array content correctly`, async () => {
         mockInvoke.mockResolvedValueOnce({
           messages: [{ role: 'ai', content: [{ text: 'Array content response' }], _getType: () => 'ai' }]
         });
         
         if (name === 'riroriro') {
          mockInvoke.mockResolvedValueOnce({
            messages: [{ role: 'ai', content: [{ text: 'Array content response' }], _getType: () => 'ai' }],
            tool_outputs: []
          });
         }

         const agent = new AgentClass();
         const result = await agent.process('Test query', {});
         expect(result.content).toContain('Array content response');
      });

      it(`handles locales`, async () => {
        const agent = new AgentClass();
        const locales = ['mi', 'sm', 'to'];
        for (const locale of locales) {
           mockInvoke.mockResolvedValueOnce({
             messages: [{ role: 'ai', content: 'Mocked agent response', _getType: () => 'ai' }]
           });
           if (name === 'riroriro') {
             mockInvoke.mockResolvedValueOnce({
               messages: [{ role: 'ai', content: 'Mocked agent response', _getType: () => 'ai' }],
               tool_outputs: []
             });
           }
           const result = await agent.process('Test query', { locale });
           expect(result.content).toBe('Mocked agent response');
        }
      });

      it(`can be invoked via BaseAgent signature`, async () => {
        const agent = new AgentClass();
        
        // riroriro doesn't extend BaseAgent in the same way with a standard invoke that we want to test here
        if (name === 'riroriro') return; 

        // We mock llm.invoke which is called inside BaseAgent.invoke
        if ((agent as any).llm) {
          (agent as any).llm.invoke = vi.fn().mockResolvedValue({ role: 'ai', content: 'Base agent invoke', _getType: () => 'ai' });
        }
        
        const state = {
          messages: [],
          query: 'Test query',
          userRole: 'parent' as const,
        };
        
        if (typeof (agent as any).invoke === 'function') {
           const result = await (agent as any).invoke(state);
           expect(result).toHaveProperty('currentAgent', name);
           expect(result.messages[0].content).toBe('Base agent invoke');
        }
      });
    });
  });
});
