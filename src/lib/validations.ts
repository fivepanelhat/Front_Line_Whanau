import { z } from 'zod';

export const ReviewSchema = z.object({
 threadId: z.string().min(1).max(200),
 approved: z.boolean(),
 modifiedResponse: z.string().max(10000).optional(),
});

export const FeedbackSchema = z.object({
 threadId: z.string().min(1).max(200),
 messageContent: z.string().max(5000).optional(),
 rating: z.union([z.literal(1), z.literal(-1)]),
 comment: z.string().max(2000).optional(),
 agent: z.string().max(100).optional(),
});

export const PractitionerNotesSchema = z.object({
 patient_reference: z.string().max(200).optional(),
 encrypted_content: z.string().min(1).max(50000),
});

const HistoryMessageSchema = z.object({
 role: z.enum(['user', 'assistant']),
 content: z.string().max(5000),
});

export const AgentQuerySchema = z.object({
 query: z.string().min(1).max(5000),
 consentGiven: z.boolean().optional(),
 threadId: z.string().max(200).optional(),
 history: z.array(HistoryMessageSchema).max(50).optional(),
});

export const SummitQuerySchema = z.object({
 query: z.string().min(1).max(5000),
 scopes: z.array(z.string().max(100)).max(10).optional(),
 locale: z.string().max(20).optional(),
});

export const AnalyticsEventSchema = z.object({
 event_type: z.string().min(1).max(100),
 path: z.string().min(1).max(500),
 metadata: z.record(z.string(), z.unknown()).optional(),
});
