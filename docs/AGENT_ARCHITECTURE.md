## Whānau Preterm Support Hub – Agent System (v0.3)

### Core Architecture
- **Supervisor**: `AetherSummit` + `supervisorNode` (keyword-first + LLM fallback)
- **Graph**: LangGraph `StateGraph` with HITL and Guardrails
- **Checkpointing**: Postgres (`PostgresSaver`)
- **Tools**: 6+ domain-specific tools (directory, funding, cultural, preterm care, emotional support, regional)
- **Agents**: 8 specialist agents (some tool-enabled via `createReactAgent`)

### Agent List
| Agent                        | Primary Role                     | Tools Enabled      | Requires Human Review |
|-----------------------------|----------------------------------|--------------------|-----------------------|
| knowledge_weaver            | Research & Information           | Yes                | Sometimes             |
| pathway_architect           | Planning & Pathways              | No                 | Sometimes             |
| sovereign_executor          | Templates & Actions              | No                 | Yes                   |
| funding_eligibility_checker | Financial Support Guidance       | Yes                | Yes                   |
| cultural_safety_guardian    | Cultural Safety                  | No                 | Yes                   |
| resource_navigator          | Service Directory                | Yes                | No                    |
| trauma_informed_companion   | Emotional Support                | Yes                | No                    |
| -                           | -                                | -                  | -                     |

### Security
- Input validation (`zod`)
- Output sanitization
- Audit logging
- Consent enforcement
- Guardrails node on every path

### Streaming
- SSE endpoint at `/api/agents`
- Supports real-time token streaming + final structured output
