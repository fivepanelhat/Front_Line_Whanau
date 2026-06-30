import { z } from 'zod';

export const ReviewSchema = z.object({
  threadId: z.string().min(1),
  approved: z.boolean(),
  modifiedResponse: z.string().optional(),
});

export const FeedbackSchema = z.object({
  threadId: z.string().min(1),
  messageContent: z.string().optional(),
  rating: z.number(),
  comment: z.string().optional(),
});

export const PractitionerNotesSchema = z.object({
  patient_reference: z.string().optional(),
  encrypted_content: z.string().min(1),
});

export const AgentQuerySchema = z.object({
  query: z.string().min(1),
  consentGiven: z.boolean().optional(),
  threadId: z.string().optional(),
  history: z.array(z.any()).optional(),
});
