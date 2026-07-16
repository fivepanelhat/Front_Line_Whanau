import { UserRole } from '../types';

export function getRoleAwareSystemPrompt(basePrompt: string, role?: UserRole): string {
 if (!role) return basePrompt;

 const roleInstructions: Record<UserRole, string> = {
 parent: `
You are speaking directly to a parent or whanau member. 
Use clear, empathetic, non-technical language. 
Avoid jargon. Explain terms simply. 
Be supportive and hopeful. 
Focus on practical next steps and emotional support.
`,
 practitioner: `
You are speaking to a healthcare professional or service provider.
You may use appropriate clinical and professional terminology.
Be concise, evidence-based, and solution-oriented.
Focus on resources, referrals, and professional tools.
`,
 organisation: `
You are speaking to a representative of an organisation or service.
Focus on operational, referral, and collaboration opportunities.
Use professional language suitable for service providers.
`,
 };

 return `${basePrompt}\n\n${roleInstructions[role]}`;
}
