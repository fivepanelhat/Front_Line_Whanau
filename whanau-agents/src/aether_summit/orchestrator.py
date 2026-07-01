"""
LangGraph Orchestrator for Aether Summit.
Builds the StateGraph, routes between agents, and enforces HITL logic.
"""
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
from typing import TypedDict, Any, Annotated
from langgraph.graph.message import add_messages
from aether_summit.agents import get_agent
from aether_summit.hitl import hitl_manager

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    current_agent: str
    hitl_required: bool
    hitl_request_id: str | None
    audit_log: list[str]

def supervisor(state: AgentState):
    messages = state.get("messages", [])
    last_message = str(messages[-1]).lower() if messages else ""
    
    # 1. New Specialist Agents
    if any(kw in last_message for kw in ["feeding", "tube", "breastmilk", "breastfeed", "nutrition", "solids", "hungry"]):
        agent = "feeding_navigator"
        hitl = False
    elif any(kw in last_message for kw in ["discharge", "home", "leave hospital", "car seat", "rooming"]):
        agent = "discharge_companion"
        hitl = False
    elif any(kw in last_message for kw in ["sibling", "partner", "grandparent", "family support", "husband", "wife"]):
        agent = "whanau_wellbeing_companion"
        hitl = False
    elif any(kw in last_message for kw in ["tikanga", "karakia", "whenua", "tapu", "noa", "custom"]):
        agent = "cultural_navigator"
        hitl = False
    elif any(kw in last_message for kw in ["mental health", "depression", "anxiety", "guilty", "trauma", "overwhelmed", "ptsd"]):
        agent = "wellbeing_companion"
        hitl = True
    elif any(kw in last_message for kw in ["peer", "support group", "community", "others", "connect"]):
        agent = "peer_connector"
        hitl = False
    # 2. Existing Agents
    elif any(kw in last_message for kw in ["data", "sovereignty", "privacy", "māori"]):
        agent = "kaitiaki"
        hitl = True
    elif any(kw in last_message for kw in ["medical", "clinical", "health advice", "diagnosis", "symptom"]):
        agent = "hauora_safety"
        hitl = True
    elif "write_file" in last_message or "run_terminal" in last_message:
        agent = "forge"
        hitl = True
    elif "strategy" in last_message or "vision" in last_message:
        agent = "rangatira"
        hitl = False
    elif "code" in last_message or "architecture" in last_message or "system" in last_message:
        agent = "forge"
        hitl = False
    else:
        agent = "whanau_voice"
        hitl = False
        
    audit_entry = f"Supervisor routed to {agent} (HITL: {hitl})"
    return {
        "current_agent": agent,
        "hitl_required": hitl,
        "audit_log": list(state.get("audit_log", [])) + [audit_entry]
    }

def human_review_node(state: AgentState):
    """Pause execution and wait for human approval."""
    req_id = hitl_manager.create_request(
        agent=state.get("current_agent", "unknown"),
        action="Review agent output / tool use",
        details=str(state.get("messages", [""])[-1])[:300]
    )
    return {
        "hitl_request_id": req_id,
        "hitl_required": True
    }

from langgraph.prebuilt import ToolNode, tools_condition
from aether_summit.tools import __all__ as all_tool_names
from aether_summit.tools import web_search, read_file, write_file, run_terminal_command, github_search

def route_from_supervisor(state: AgentState) -> str:
    """Helper to dynamically route from supervisor based on the state."""
    if state.get("hitl_required"):
        return "human_review"
    return state.get("current_agent", "whanau_voice")

def route_after_human(state: AgentState) -> str:
    """After human review, continue to the chosen agent."""
    return state.get("current_agent", "whanau_voice")

def route_after_tools(state: AgentState) -> str:
    """Route from ToolNode back to the agent that called the tool."""
    return state.get("current_agent", "whanau_voice")

def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("supervisor", supervisor)
    graph.add_node("human_review", human_review_node)
    
    from aether_summit.agents import AGENT_NAMES
    agents = AGENT_NAMES
              
    for agent_name in agents:
        graph.add_node(agent_name, get_agent(agent_name))
        
    # Setup ToolNode with all tools
    all_tools = [web_search, read_file, write_file, run_terminal_command, github_search]
    tool_node = ToolNode(tools=all_tools)
    graph.add_node("tools", tool_node)
    
    graph.set_entry_point("supervisor")
    
    # Conditional edge from supervisor to human_review or agents
    routes = {agent: agent for agent in agents}
    routes["human_review"] = "human_review"
    
    graph.add_conditional_edges(
        "supervisor", 
        route_from_supervisor,
        routes
    )
    
    # Conditional edge from human_review to agents
    graph.add_conditional_edges(
        "human_review",
        route_after_human,
        {agent: agent for agent in agents}
    )
    
    # Conditional edges from agents to tools or END
    for agent_name in agents:
        graph.add_conditional_edges(
            agent_name,
            tools_condition,
            {"tools": "tools", END: END}
        )
        
    # Edge from tools back to the calling agent
    graph.add_conditional_edges(
        "tools",
        route_after_tools,
        {agent: agent for agent in agents}
    )
    
    import sqlite3
    conn = sqlite3.connect("checkpoints.db", check_same_thread=False)
    memory = SqliteSaver(conn)
    memory.setup()
    return graph.compile(checkpointer=memory, interrupt_after=["human_review"])
