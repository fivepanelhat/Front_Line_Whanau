interface GuardrailInput {
  content: string;
  agentUsed: string;
}

interface GuardrailResult {
  passed: boolean;
  modifiedResponse?: string;
  showUrgentHelp: boolean;
  reason?: string;
}

export function checkGuardrails(input: GuardrailInput): GuardrailResult {
  const { content, agentUsed } = input;
  const lower = content.toLowerCase();

  // Crisis / Self-harm (highest priority)
  if (lower.includes('suicide') || lower.includes('kill myself') || lower.includes('end my life')) {
    return {
      passed: false,
      modifiedResponse: 
        "I'm concerned about what you've shared. Please reach out for immediate support:\n\n" +
        "• Call or text 1737 (free, 24/7)\n" +
        "• Lifeline: 0800 543 354\n" +
        "• Talk to your midwife, GP, or hospital social worker",
      showUrgentHelp: true,
      reason: 'Crisis language detected',
    };
  }

  // Medical advice requests (very conservative)
  const medicalTriggers = ['should i', 'is it safe', 'will my baby', 'can i give', 'is this normal'];
  const medicalTopics = ['breathing', 'oxygen', 'feeding tube', 'heart rate', 'infection', 'discharge'];

  if (medicalTriggers.some(t => lower.includes(t)) && medicalTopics.some(t => lower.includes(t))) {
    return {
      passed: false,
      modifiedResponse: 
        "I cannot provide medical advice about your baby. Please speak directly with your neonatal team or midwife.",
      showUrgentHelp: false,
      reason: 'Medical advice request detected',
    };
  }

  // Financial / Eligibility advice
  if ((lower.includes('how much') || lower.includes('am i eligible') || lower.includes('will i get')) &&
      (lower.includes('funding') || lower.includes('allowance') || lower.includes('winz'))) {
    return {
      passed: false,
      modifiedResponse: 
        "I cannot determine your exact eligibility or payment amounts. Please contact Work and Income or a support worker for personalized advice.",
      showUrgentHelp: false,
      reason: 'Financial eligibility advice request detected',
    };
  }

  // Cultural safety (especially from ReAct agents)
  if ((agentUsed === 'cultural_safety_guardian' || lower.includes('cultural')) && 
      lower.length > 400) {
    return {
      passed: false,
      showUrgentHelp: false,
      reason: 'Long cultural response from specialist agent — recommend human review',
    };
  }

  return { passed: true, showUrgentHelp: false };
}
