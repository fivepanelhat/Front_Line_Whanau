import type { AgentResponse } from './types';

export function checkGuardrails(input: { content: string; agentUsed: string } | AgentResponse) {
  const content = input.content;
  const agentUsed = input.agentUsed ?? '';
  let passed = true;
  let modifiedResponse = content;
  let showUrgentHelp = false;

  // Example safety rules (expand as needed)
  if (content.toLowerCase().includes('suicide') || content.toLowerCase().includes('self-harm')) {
    passed = false;
    showUrgentHelp = true;
    modifiedResponse = "I'm concerned about what you've shared. Please reach out to a support service immediately.";
  }

  if (agentUsed.toLowerCase().includes('executor') && !content.toLowerCase().includes('official source')) {
    passed = false;
  }

  return { passed, modifiedResponse, showUrgentHelp };
}

export function checkUserContentForChildSafety(content: string): {
  triggered: boolean;
  resources: string | null;
} {
  const lowered = content.toLowerCase();
  const triggered = lowered.includes('suicide') || lowered.includes('self-harm');
  return {
    triggered,
    resources: triggered ? 'Need to talk? Call or text 1737 (NZ) for immediate support.' : null,
  };
}
