# Aether Summit — Culturally Compliant Agent System

Enterprise-grade, stateful, Te Tiriti-aligned multi-agent system built with LangGraph for the Whānau Preterm Support Hub NZ.

## 🛠️ Project Structure

```text
whanau-agents/
├── pyproject.toml
├── README.md
└── src/
    └── aether_summit/
        ├── __init__.py
        ├── cli.py                   # Typer CLI commands
        ├── config.py                # Configuration settings
        ├── orchestrator.py          # LangGraph supervisor and state graph
        ├── cultural_safety.py       # Kaitiaki safety wrapper
        └── agents/                  # 11 specialist agents
            ├── __init__.py          # Agent registry
            ├── base_agent.py        # Base Agent structure
            ├── rangatira.py         # Supervisor coordinator
            ├── kaitiaki.py          # Safety reviewer
            └── ... (others)
```

## 🚀 Getting Started

### 1. Installation
Install in editable mode using `uv` (recommended) or `pip`:

```bash
# With uv
uv pip install -e .

# Or standard pip
pip install -e .
```

This registers the `aether` script globally.

### 2. Execution

Run a direct task from your terminal:
```bash
aether run "I need to check details for health support providers"
```

Or run the interactive chat CLI:
```bash
aether chat
```

## 11 Specialist Agents

1. **Rangatira**: Lead Coordinator / Supervisor routing queries.
2. **Kaitiaki**: Cultural Safety and Māori Data Sovereignty guardian.
3. **Rangahau Hauora**: Clinical and Medical Evidence synthesis.
4. **Aroha Tohunga**: Trauma-informed translator for whānau-centered care.
5. **Mana Āwhina**: Social support, grants, and equity navigator.
6. **Tautoko Kaiwhina**: Services directory manager.
7. **Whānau Reo**: Lived experience peer support manager.
8. **Taonga Vault Guardian**: Local-first security and encryption regulator.
9. **Te Aka Translator**: Māori language and macro curation review.
10. **Pathway Planner**: Support path and twin journey scheduler.
11. **Aether Summit Executor**: Action-taking generator.
