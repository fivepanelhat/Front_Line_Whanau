/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { 
 classifyIntent, 
 supervisorNode, 
 guardrailNode, 
 humanReviewNode,
 AgentStateType 
} from '../graph';
import { checkGuardrails } from '../guardrails';
import { Riroriro, riroriroReactAgent } from '../agents/riroriro';

// Mock the core LLM component globally so we don't make real API calls
vi.mock('@langchain/google-genai', () => {
 return {
 ChatGoogleGenerativeAI: class {
 async invoke(messages: any[]) {
 const lastMsg = messages[messages.length - 1];
 const content = lastMsg?.content || lastMsg?.text || JSON.stringify(lastMsg);
 
 // Simple mock router for intent classification
 if (content.includes('financial support')) return { content: 'RESEARCH' };
 if (content.includes('apply for')) return { content: 'EXECUTION' };
 if (content.includes('cultural') || content.includes('iwi')) return { content: 'RESEARCH' }; // Routed to cultural safety later
 
 return { content: 'COMPLEX' };
 }
 }
 };
});

vi.mock('server-only', () => ({})); // Mock server-only to avoid errors in JSDOM / general test env

vi.mock('../checkpointer', () => ({
 createCheckpointSaver: vi.fn().mockResolvedValue(null)
}));

vi.mock('@langchain/tavily', () => {
 return {
 TavilySearch: class {
 invoke() {
 return Promise.resolve('Mocked search results');
 }
 }
 };
});

// Mock the react agent invoke for the Knowledge Weaver
vi.mock('@langchain/langgraph/prebuilt', () => ({
 createReactAgent: vi.fn().mockReturnValue({
 invoke: vi.fn()
 })
}));

describe('Agent Harness: Routing & Workflows', () => {

 describe('Supervisor Node (Routing)', () => {
 it('routes financial questions to RESEARCH -> knowledge_weaver', async () => {
 const state: AgentStateType = {
 query: 'What financial support is available?',
 consentGiven: true, locale: 'en-NZ',
 messages: [],
 userRole: 'parent',
 intent: null,
 currentAgent: '',
 context: {},
 humanApproved: null,
 requiresHumanReview: false,
 finalResponse: null,
 sources: [],
 showUrgentHelp: false,
 culturalSafetyScore: 0
 };

 const result = await supervisorNode(state);
 expect(result.intent).toBe('RESEARCH');
 expect(result.currentAgent).toBe('riroriro');
 });

 it('routes cultural questions to RESEARCH -> cultural_safety_guardian', async () => {
 const state: AgentStateType = {
 query: 'How do I find cultural support from my iwi?',
 consentGiven: true, locale: 'en-NZ',
 messages: [],
 userRole: 'parent',
 intent: null,
 currentAgent: '',
 context: {},
 humanApproved: null,
 requiresHumanReview: false,
 finalResponse: null,
 sources: [],
 showUrgentHelp: false,
 culturalSafetyScore: 0
 };

 const result = await supervisorNode(state);
 expect(result.intent).toBe('RESEARCH');
 expect(result.currentAgent).toBe('tuatara');
 });

 it('routes application questions to EXECUTION -> funding_eligibility_checker', async () => {
 const state: AgentStateType = {
 query: 'How do I apply for the Best Start payment?',
 consentGiven: true, locale: 'en-NZ',
 messages: [],
 userRole: 'parent',
 intent: null,
 currentAgent: '',
 context: {},
 humanApproved: null,
 requiresHumanReview: false,
 finalResponse: null,
 sources: [],
 showUrgentHelp: false,
 culturalSafetyScore: 0
 };

 const result = await supervisorNode(state);
 expect(result.intent).toBe('EXECUTION');
 expect(result.currentAgent).toBe('kea');
 });

 it('falls back to RESEARCH -> knowledge_weaver if no consent is given', async () => {
 const state: AgentStateType = {
 query: 'apply for funding',
 consentGiven: false, locale: 'en-NZ',
 messages: [],
 userRole: 'parent',
 intent: null,
 currentAgent: '',
 context: {},
 humanApproved: null,
 requiresHumanReview: false,
 finalResponse: null,
 sources: [],
 showUrgentHelp: false,
 culturalSafetyScore: 0
 };

 const result = await supervisorNode(state);
 expect(result.intent).toBe('RESEARCH');
 expect(result.currentAgent).toBe('riroriro');
 });
 });

 describe('Citation Quality (Knowledge Weaver)', () => {
 let weaver: Riroriro;

 beforeEach(() => {
 weaver = new Riroriro();
 });

 it('formats tool outputs into strict [1] inline citations and Sources block', async () => {
 // We mock the inner agent to return a response WITHOUT sources,
 // forcing our custom process method to append the formatted tool_outputs.
 (riroriroReactAgent.invoke as any).mockResolvedValue({
 messages: [
 new ToolMessage({
 content: JSON.stringify([
 { title: 'Health NZ Guide', url: 'https://health.govt.nz/preterm' },
 { title: 'Plunket Support', url: 'https://plunket.org.nz/support' }
 ]),
 tool_call_id: 'call_123',
 name: 'webSearchTool'
 }),
 new AIMessage('Here is some information about preterm babies.')
 ]
 });

 const result = await weaver.process('Tell me about preterm babies', {});

 // Assert the fallback appended the sources correctly
 expect(result.content).toContain('Sources:');
 expect(result.content).toContain('1. Health NZ Guide - https://health.govt.nz/preterm');
 expect(result.content).toContain('2. Plunket Support - https://plunket.org.nz/support');
 });

 it('does not double-append sources if LLM already provided them', async () => {
 (riroriroReactAgent.invoke as any).mockResolvedValue({
 messages: [
 new ToolMessage({
 content: JSON.stringify([
 { title: 'Health NZ Guide', url: 'https://health.govt.nz/preterm' }
 ]),
 tool_call_id: 'call_124',
 name: 'webSearchTool'
 }),
 new AIMessage('Information [1].\n\nSources:\n1. Health NZ - https://health.govt.nz')
 ]
 });

 const result = await weaver.process('Tell me about preterm babies', {});
 
 // We shouldn't see it appended twice
 const sourceCount = (result.content.match(/Sources:/g) || []).length;
 expect(sourceCount).toBe(1);
 });
 });

 describe('Guardrails', () => {
 it('flags crisis responses and enforces human review', () => {
 const gate = checkGuardrails({
 content: 'It sounds like you may be thinking about how to end my life.',
 agentUsed: 'funding_eligibility_checker'
 });

 expect(gate.passed).toBe(false);
 expect(gate.reason).toContain('Crisis');
 });

 it('allows benign responses through', () => {
 const gate = checkGuardrails({
 content: 'You may be eligible to apply for standard parental leave through IRD.',
 agentUsed: 'knowledge_weaver'
 });

 expect(gate.passed).toBe(true);
 });

 it('guardrail node correctly modifies state on crisis content', async () => {
 const state: AgentStateType = {
 query: 'I am struggling',
 consentGiven: true, locale: 'en-NZ',
 messages: [],
 userRole: 'parent',
 intent: 'COMPLEX',
 currentAgent: 'kiwi',
 context: {},
 humanApproved: null,
 requiresHumanReview: false,
 finalResponse: 'any thoughts of suicide should be taken seriously - support is available',
 sources: [],
 showUrgentHelp: false,
 culturalSafetyScore: 0
 };

 const result = await guardrailNode(state);
 expect(result.requiresHumanReview).toBe(true);
 expect(result.showUrgentHelp).toBe(true);
 });
 });

});
