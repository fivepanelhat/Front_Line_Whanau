# Developer Onboarding Guide

Welcome to the Front Line Whānau platform! This document outlines the core architecture of our AI systems and how to contribute effectively.

## Core Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL with `pgvector`)
- **AI Orchestration**: LangGraph + LangChain (`@langchain/langgraph`)
- **Model**: Google Gemini 1.5 Flash (`@langchain/google-genai`)
- **Search**: Tavily API

## AI Architecture (LangGraph)

Our agents are built using **LangGraph**, which allows us to define stateful, multi-actor workflows. 

### The Graph (`src/ai/graph.ts`)
The orchestrator uses a router node to classify the user's intent and direct the conversation to specific specialist agents:
1. `ResourceNavigator`: Finds local facilities and support directories.
2. `KnowledgeWeaver`: Retrieves domain-specific knowledge from our curated vector database.

### The State
We use `@langchain/langgraph/prebuilt` and `MemorySaver` (with Supabase fallback) to persist conversation threads so users can resume chats indefinitely.

## Human-in-the-Loop (HITL)

We have strict Guardrails (`src/ai/guardrails.ts`) that intercept sensitive queries. If a guardrail is triggered:
1. A `NodeInterrupt` is thrown inside the LangGraph execution.
2. The orchestrator catches this and inserts a `pending` row into the `ai_reviews` Supabase table.
3. The frontend displays a "Review Required" modal to the user.
4. A practitioner reviews the message at `/practitioner/moderation/ai-review`.
5. Once approved, the orchestrator resumes the thread.

## How to Add a New Tool

1. Open `src/ai/tools.ts`.
2. Use the `createSafeTool` wrapper to define your tool schema (using Zod) and execution logic.
3. Example:
 ```typescript
 export const myNewTool = createSafeTool({
 name: "my_new_tool",
 description: "Does something awesome",
 schema: z.object({ input: z.string() })
 }, async ({ input }) => {
 return "Result";
 });
 ```
4. Add the tool to the appropriate agent in `src/ai/agents/`.

## Observability & Tracing

We use **LangSmith** for deep tracing of agent reasoning and tool usage. 
Ensure your `.env.local` contains a valid `LANGCHAIN_API_KEY`.
We also use `pino` for structured logging. Check `src/lib/logger.ts`.

## Running Locally

1. `npm install`
2. Ensure Docker is running (for local Supabase).
3. `npx supabase start`
4. `npm run dev`

Welcome to the team!
