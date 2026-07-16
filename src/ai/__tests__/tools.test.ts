import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
 createSafeTool,
 knowledgeDatabaseLookupTool,
 documentSearchTool,
 searchDirectoryTool,
 getCulturalResourcesTool,
 getFundingInfoTool,
 getPretermCareInfoTool,
 getEmotionalSupportResourcesTool,
 findLocalFacilitiesTool,
 getRegionalSupportTool,
 webSearchTool,
 clinicalTriageTool,
 getHospitalSocialWorkerInfoTool,
 getHospitalFacilitiesInfoTool
} from '../tools';
import { TavilySearch } from '@langchain/tavily';
import { z } from 'zod';
import * as rag from '../rag';
import * as knowledgeDb from '../knowledge-db';

vi.mock('../rag', () => ({
 retrieveRelevantContext: vi.fn()
}));

vi.mock('../knowledge-db', () => ({
 lookupKnowledgeContext: vi.fn()
}));

vi.mock('../logger', () => ({
 agentLogger: () => ({
 error: vi.fn(),
 info: vi.fn(),
 })
}));

vi.mock('@langchain/tavily', () => {
 return {
 TavilySearch: class {
 invoke = vi.fn().mockImplementation(async ({ query }) => {
 if (query.includes('error')) throw new Error('API failed');
 return 'Tavily mock result';
 });
 }
 };
});

describe('Tools', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 });

 describe('createSafeTool', () => {
 it('wraps successful function calls', async () => {
 const tool = createSafeTool(
 { name: 'test', description: 'desc', schema: z.object({ arg: z.string() }) },
 async ({ arg }) => `Success: ${arg}`
 );

 const result = await tool.invoke({ arg: '123' });
 expect(result).toBe('Success: 123');
 });

 it('stringifies object returns', async () => {
 const tool = createSafeTool(
 { name: 'test', description: 'desc', schema: z.object({ arg: z.string() }) },
 async ({ arg }) => ({ ok: true, arg })
 );

 const result = await tool.invoke({ arg: '456' });
 expect(result).toBe(JSON.stringify({ ok: true, arg: '456' }));
 });

 it('catches and formats errors', async () => {
 const tool = createSafeTool(
 { name: 'test', description: 'desc', schema: z.object({ arg: z.string() }) },
 async () => { throw new Error('Boom'); }
 );

 const result = await tool.invoke({ arg: 'err' });
 expect(result).toContain('Tool execution failed: Boom');
 });
 });

 describe('Individual Tools', () => {
 it('knowledgeDatabaseLookupTool invokes knowledge context', async () => {
 (knowledgeDb.lookupKnowledgeContext as any).mockResolvedValue({
 context: 'Mock context',
 sources: ['doc1'],
 retrievalMode: 'semantic'
 });

 const resStr = await knowledgeDatabaseLookupTool.invoke({ query: 'test query', domain: 'funding' });
 const res = JSON.parse(resStr);
 expect(res.content).toBe('Mock context');
 expect(res.query).toBe('funding test query');
 });

 it('documentSearchTool invokes RAG', async () => {
 (rag.retrieveRelevantContext as any).mockResolvedValue('RAG mock result');
 const resStr = await documentSearchTool.invoke({ query: 'search test' });
 expect(resStr).toBe('RAG mock result');
 });

 it('searchDirectoryTool invokes RAG with prefix', async () => {
 (rag.retrieveRelevantContext as any).mockResolvedValue('RAG mock dir result');
 const resStr = await searchDirectoryTool.invoke({ query: 'dir search' });
 expect(resStr).toBe('RAG mock dir result');
 expect(rag.retrieveRelevantContext).toHaveBeenCalledWith('service directory lookup: dir search');
 });

 it('getCulturalResourcesTool invokes RAG with prefix', async () => {
 (rag.retrieveRelevantContext as any).mockResolvedValue('cultural result');
 const resStr = await getCulturalResourcesTool.invoke({ query: 'iwi' });
 expect(resStr).toBe('cultural result');
 expect(rag.retrieveRelevantContext).toHaveBeenCalledWith('maori cultural resource lookup: iwi');
 });

 it('getFundingInfoTool invokes RAG with prefix', async () => {
 (rag.retrieveRelevantContext as any).mockResolvedValue('funding result');
 const resStr = await getFundingInfoTool.invoke({ query: 'payment' });
 expect(resStr).toBe('funding result');
 expect(rag.retrieveRelevantContext).toHaveBeenCalledWith('nz funding eligibility lookup: payment');
 });

 it('getPretermCareInfoTool provides safe fallback for feeding', async () => {
 (knowledgeDb.lookupKnowledgeContext as any).mockResolvedValue({
 context: 'KDB preterm mock',
 sources: [],
 retrievalMode: 'semantic'
 });
 const resStr = await getPretermCareInfoTool.invoke({ topic: 'feeding' });
 const res = JSON.parse(resStr);
 expect(res.content).toContain('often need support with feeding');
 expect(res.disclaimer).toContain('general information only');
 });

 it('getEmotionalSupportResourcesTool returns safe support options', async () => {
 (knowledgeDb.lookupKnowledgeContext as any).mockResolvedValue({
 context: 'KDB mock',
 sources: [],
 retrievalMode: 'semantic'
 });
 const resStr = await getEmotionalSupportResourcesTool.invoke({ focus: 'grief' });
 const res = JSON.parse(resStr);
 expect(res.focus).toBe('grief');
 expect(res.resources).toHaveLength(5);
 
 const resStr2 = await getEmotionalSupportResourcesTool.invoke({});
 const res2 = JSON.parse(resStr2);
 expect(res2.focus).toBe('general');
 });

 it('findLocalFacilitiesTool uses Tavily and caching', async () => {
 const resStr = await findLocalFacilitiesTool.invoke({ query: 'doctor', location: 'wellington' });
 const res = JSON.parse(resStr);
 expect(res.results).toBe('Tavily mock result');
 expect(res.disclaimer).toContain('live web results');
 });

 it('findLocalFacilitiesTool handles Tavily errors', async () => {
 const resStr = await findLocalFacilitiesTool.invoke({ query: 'error', location: 'wellington' });
 const res = JSON.parse(resStr);
 expect(res.error).toContain('Could not retrieve');
 });

 it('getRegionalSupportTool returns region specifics', async () => {
 (knowledgeDb.lookupKnowledgeContext as any).mockResolvedValue({
 context: 'KDB mock',
 sources: [],
 retrievalMode: 'semantic'
 });
 const resStr = await getRegionalSupportTool.invoke({ region: 'Auckland' });
 const res = JSON.parse(resStr);
 expect(res.services[0]).toContain('Auckland');

 const resStr2 = await getRegionalSupportTool.invoke({});
 const res2 = JSON.parse(resStr2);
 expect(res2.services[0]).toContain('Your region');
 });

 it('webSearchTool searches tavily directly', async () => {
 const resStr = await webSearchTool.invoke({ query: 'test search' });
 expect(resStr).toBe('Tavily mock result'); // Note tavily wrapper usually just returns array of docs, but we mocked return as string
 });

 it('clinicalTriageTool handles severities', async () => {
 expect(await clinicalTriageTool.invoke({ symptom: 'chest', severity: 'EMERGENCY' })).toContain('WARNING');
 expect(await clinicalTriageTool.invoke({ symptom: 'fever', severity: 'URGENT' })).toContain('Healthline');
 expect(await clinicalTriageTool.invoke({ symptom: 'rash', severity: 'INFO' })).toContain('For general questions');
 });

 it('getHospitalSocialWorkerInfoTool returns topics and general info', async () => {
 let res = JSON.parse(await getHospitalSocialWorkerInfoTool.invoke({ topic: 'contact' }));
 expect(res.detail).toContain('availability may vary');
 
 res = JSON.parse(await getHospitalSocialWorkerInfoTool.invoke({}));
 expect(res.howToRequest).toContain('any time');
 });

 it('getHospitalFacilitiesInfoTool returns topics and general info', async () => {
 let res = JSON.parse(await getHospitalFacilitiesInfoTool.invoke({ topic: 'showers' }));
 expect(res.facilityDetail).toContain('Whanau showers');
 
 res = JSON.parse(await getHospitalFacilitiesInfoTool.invoke({}));
 expect(res.facilities).toBeDefined();
 expect(res.facilities.cafeteria).toBeDefined();
 });
 });
});
