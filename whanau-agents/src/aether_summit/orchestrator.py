from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Any
from aether_summit.agents import get_agent

class AgentState(TypedDict):
    messages: list[str]
    current_agent: str
    hitl_required: bool
    audit_log: list[str]

def supervisor_node(state: AgentState) -> dict[str, Any]:
    """Orchestrates flow and logs entry points."""
    return {
        "current_agent": "supervisor",
        "audit_log": list(state.get("audit_log", [])) + ["Supervisor initiated routing."]
    }

def route_next_agent(state: AgentState) -> str:
    """Dynamic routing logic based on task content."""
    messages_str = str(state.get("messages", [])).lower()
    
    if "data" in messages_str or "privacy" in messages_str:
        return "kaitiaki"
    elif "health" in messages_str or "medical" in messages_str:
        return "rangahau_hauora"
    elif "translate" in messages_str or "reo" in messages_str:
        return "te_aka"
    elif "plan" in messages_str or "checklist" in messages_str:
        return "pathway_planner"
    elif "action" in messages_str or "remind" in messages_str:
        return "executor"
    elif "support" in messages_str or "iwi" in messages_str:
        return "mana_awhina"
    
    return END

def build_graph():
    # Construct stategraph
    graph = StateGraph(AgentState)
    
    # Add all 11 nodes
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("rangatira", get_agent("rangatira"))
    graph.add_node("kaitiaki", get_agent("kaitiaki"))
    graph.add_node("rangahau_hauora", get_agent("rangahau_hauora"))
    graph.add_node("aroha_tohunga", get_agent("aroha_tohunga"))
    graph.add_node("mana_awhina", get_agent("mana_awhina"))
    graph.add_node("tautoko_kaiwhina", get_agent("tautoko_kaiwhina"))
    graph.add_node("whanau_reo", get_agent("whanau_reo"))
    graph.add_node("vault_guardian", get_agent("vault_guardian"))
    graph.add_node("te_aka", get_agent("te_aka"))
    graph.add_node("executor", get_agent("executor"))
    graph.add_node("pathway_planner", get_agent("pathway_planner"))

    # Define edges
    graph.set_entry_point("supervisor")
    graph.add_edge("supervisor", "rangatira")
    
    # Route from Rangatira dynamically
    graph.add_conditional_edges(
        "rangatira",
        route_next_agent,
        {
            "kaitiaki": "kaitiaki",
            "rangahau_hauora": "rangahau_hauora",
            "te_aka": "te_aka",
            "pathway_planner": "pathway_planner",
            "executor": "executor",
            "mana_awhina": "mana_awhina",
            END: END
        }
    )
    
    # Connect leaf agents back to Kaitiaki for final cultural review before END
    graph.add_edge("kaitiaki", END)
    graph.add_edge("rangahau_hauora", "kaitiaki")
    graph.add_edge("te_aka", "kaitiaki")
    graph.add_edge("pathway_planner", "kaitiaki")
    graph.add_edge("executor", "kaitiaki")
    graph.add_edge("mana_awhina", "kaitiaki")

    # Add memory checkpointing
    memory = MemorySaver()
    return graph.compile(checkpointer=memory)
