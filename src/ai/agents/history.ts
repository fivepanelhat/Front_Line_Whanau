import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';

const LOCALE_DIRECTIVES: Record<string, string> = {
 mi: "CRITICAL: The user has selected 'mi' (Te Reo Maori). You MUST respond entirely in Te Reo Maori.",
 sm: "CRITICAL: The user has selected 'sm' (Gagana Samoa). You MUST respond entirely in Gagana Samoa.",
 to: "CRITICAL: The user has selected 'to' (Lea Faka-Tonga). You MUST respond entirely in Lea Faka-Tonga.",
};

/**
 * Conversation messages for a specialist agent call.
 *
 * Every agent used to send ONLY the isolated query to its model, so
 * follow-up questions ("how much is it per week?") lost all context and
 * agents asked the user to start over. Graph state already carries the
 * trimmed history (the API route builds [...previous, query]) - use it.
 * Falls back to just the query for callers without history.
 */
export function buildAgentMessages(query: string, state: unknown): BaseMessage[] {
 const s = state as { locale?: string; messages?: BaseMessage[] } | undefined;
 const messages: BaseMessage[] = [];

 const directive = s?.locale ? LOCALE_DIRECTIVES[s.locale] : undefined;
 if (directive) messages.push(new SystemMessage(directive));

 const history = Array.isArray(s?.messages) ? s.messages : [];
 if (history.length > 0) {
 messages.push(...history);
 } else {
 messages.push(new HumanMessage(query));
 }

 return messages;
}
