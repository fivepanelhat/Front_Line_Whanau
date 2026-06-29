import { documentSearchTool } from './tools';

export type ToolName = 'document_search' | 'benefit_pathway_lookup' | 'crisis_support_lookup';

export interface ToolCall {
  tool: ToolName;
  input: string;
}

export interface ToolCallResult {
  tool: ToolName;
  input: string;
  output: string;
  sources: string[];
  confidence: number;
}

export interface ToolLayerResult {
  calls: ToolCallResult[];
  sources: string[];
  requiresHumanReview: boolean;
}

export function detectToolCalls(query: string): ToolCall[] {
  const q = query.toLowerCase();
  const calls: ToolCall[] = [];

  if (
    q.includes('preterm') ||
    q.includes('eligibility') ||
    q.includes('best start') ||
    q.includes('winz') ||
    q.includes('support')
  ) {
    calls.push({ tool: 'document_search', input: query });
  }

  if (
    q.includes('benefit') ||
    q.includes('allowance') ||
    q.includes('payment') ||
    q.includes('apply')
  ) {
    calls.push({ tool: 'benefit_pathway_lookup', input: query });
  }

  if (
    q.includes('urgent') ||
    q.includes('crisis') ||
    q.includes('help now') ||
    q.includes('unsafe')
  ) {
    calls.push({ tool: 'crisis_support_lookup', input: query });
  }

  return calls;
}

export async function runToolLayer(query: string): Promise<ToolLayerResult> {
  const calls = detectToolCalls(query);
  if (!calls.length) {
    return { calls: [], sources: [], requiresHumanReview: false };
  }

  const results = await Promise.all(calls.map((call) => invokeTool(call)));

  return {
    calls: results,
    sources: unique(results.flatMap((r) => r.sources)),
    requiresHumanReview: results.some((r) => r.tool !== 'document_search'),
  };
}

async function invokeTool(call: ToolCall): Promise<ToolCallResult> {
  if (call.tool === 'document_search') {
    const raw = await documentSearchTool.invoke(call.input);
    const output = toText(raw);
    const sources = extractSources(output);
    return {
      tool: call.tool,
      input: call.input,
      output,
      sources,
      confidence: 0.82,
    };
  }

  if (call.tool === 'benefit_pathway_lookup') {
    const output =
      'Benefit pathway lookup suggests checking Best Start, Disability Allowance, and WINZ home help eligibility with official channels.';
    return {
      tool: call.tool,
      input: call.input,
      output,
      sources: ['Work and Income NZ', 'Inland Revenue NZ'],
      confidence: 0.7,
    };
  }

  const output =
    'Crisis support lookup: If immediate safety concerns exist, use emergency services (111) and 24/7 support line 1737.';
  return {
    tool: call.tool,
    input: call.input,
    output,
    sources: ['1737 Need to Talk', 'NZ Emergency Services'],
    confidence: 0.95,
  };
}

function extractSources(rawOutput: string): string[] {
  try {
    const parsed: unknown = JSON.parse(rawOutput);
    if (!Array.isArray(parsed)) return [];

    const mapped = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const candidate = item as Record<string, unknown>;
        const source = candidate.source ?? candidate.title ?? candidate.url;
        return typeof source === 'string' ? source : null;
      })
      .filter((v): v is string => Boolean(v));

    return unique(mapped);
  } catch {
    return [];
  }
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
