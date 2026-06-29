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
  const lowerContent = content.toLowerCase();

  // === 1. Crisis / Self-harm Detection (Highest Priority) ===
  const crisisKeywords = [
    'suicide',
    'kill myself',
    'end my life',
    'self-harm',
    'hurt myself',
    'want to die',
    'no reason to live',
  ];

  if (crisisKeywords.some((kw) => lowerContent.includes(kw))) {
    return {
      passed: false,
      modifiedResponse:
        "I'm very concerned about what you've shared. Please reach out for immediate support:\n\n" +
        '• Call or text 1737 (free, 24/7 in NZ)\n' +
        '• Lifeline: 0800 543 354\n' +
        '• Your midwife, GP, or hospital social worker',
      showUrgentHelp: true,
      reason: 'Crisis language detected',
    };
  }

  // === 2. Medical Advice Guard (Very Conservative) ===
  const medicalAdvicePatterns = [
    'should i',
    'is it safe',
    'will my baby',
    'how much oxygen',
    'is this normal',
    'what does it mean',
    'can i give',
    'should we',
  ];

  const medicalTopics = [
    'breathing',
    'oxygen',
    'cpap',
    'ventilator',
    'heart',
    'infection',
    'jaundice',
    'weight',
    'feeding tube',
    'discharge',
    'apnea',
  ];

  const isAskingMedicalAdvice =
    medicalAdvicePatterns.some((p) => lowerContent.includes(p)) &&
    medicalTopics.some((t) => lowerContent.includes(t));

  if (isAskingMedicalAdvice) {
    return {
      passed: false,
      modifiedResponse:
        "I cannot give medical advice about your baby. Please speak directly with your neonatal team, midwife, or doctor. " +
        'They know your baby’s specific situation and can give you accurate guidance.',
      showUrgentHelp: false,
      reason: 'Medical advice request detected',
    };
  }

  // === 3. Financial / Eligibility Advice Guard ===
  const financialPatterns = [
    'how much will i get',
    'am i eligible',
    'will i qualify',
    'how much money',
    'can i get',
    'what am i entitled to',
  ];

  if (financialPatterns.some((p) => lowerContent.includes(p))) {
    return {
      passed: false,
      modifiedResponse:
        'I cannot determine your eligibility or calculate exact amounts. ' +
        'Please contact Work and Income (WINZ), your midwife, or a support worker who can assess your specific situation. ' +
        'Rules and amounts can vary significantly between families.',
      showUrgentHelp: false,
      reason: 'Financial eligibility advice request detected',
    };
  }

  // === 4. High-Risk Agent + Sensitive Topic Combination ===
  const highRiskAgents = ['sovereign_executor', 'funding_eligibility_checker'];
  if (highRiskAgents.includes(agentUsed) && lowerContent.length > 300) {
    return {
      passed: false,
      showUrgentHelp: false,
      reason: 'High-risk agent producing long response',
    };
  }

  // === Default: Pass with light sanitization ===
  return {
    passed: true,
    showUrgentHelp: false,
  };
}
