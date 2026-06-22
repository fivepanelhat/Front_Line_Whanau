# AI Architecture Recommendation (LangGraph + RAG)

After reviewing the current setup, here’s what suits **Front_Line_Whanau** best:

## Recommended Stack

| Component | Recommendation | Reason |
| :--- | :--- | :--- |
| **Orchestration** | LangGraph | Best for complex, stateful, hierarchical agents with HITL |
| **Agent Framework** | LangGraph (primary) | More powerful than CrewAI for your needs |
| **RAG** | Supabase + pgvector | Already in your stack, great for NZ-specific knowledge |
| **LLM** | Mix of local + cloud | Sovereignty-first (local when possible) |
| **Tool Use** | LangGraph Tools | Better control than CrewAI |

## Proposed Agent Structure

We’ll keep the existing concept but formalise it:

- **Aether Summit** → Main Orchestrator (LangGraph StateGraph)
- **Specialist Agents**:
  - **Kaitiaki Crawler** – Web research & data ingestion
  - **Rangahau Hauora** – Medical evidence synthesis
  - **Aroha Tohunga** – Clinical translation
  - **Mana Āwhina** – Cultural safety & equity review
  - **Tautoko Kaiwhina** – Services directory maintenance
  - **Māmā & Pāpā Reo** – Lived experience integration

## Next Steps for Full Kitout

We recommend performing the following in order:

1. **Formalise the LangGraph setup** (create proper agent classes + state)
2. **Build the RAG pipeline** (Supabase + pgvector + document loading)
3. **Implement the first 4–5 core agents**
4. **Add Human-in-the-Loop (HITL) gates** for sensitive content
5. **Create a clean agent interface** so new agents can be added easily
