"""
Command Line Interface (CLI) for Aether Summit.
Provides commands to run tasks, chat, and review HITL requests.
"""
import sys
import typer
from rich.console import Console
from langgraph.types import Command
from aether_summit.orchestrator import build_graph
from aether_summit.hitl import hitl_manager

# Reconfigure console streams to support Māori macrons on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

app = typer.Typer(help="Aether Summit v0.2.0 — Culturally Compliant Agent System")
console = Console()

@app.command()
def run(task: str):
    console.print("[bold cyan]Aether Summit[/bold cyan] — Whānau Preterm Support Hub NZ\n")
    graph = build_graph()
    
    # Checkpoint configuration required by SqliteSaver
    config = {"configurable": {"thread_id": "cli_run"}}
    
    try:
        result = graph.invoke({
            "messages": [task],
            "current_agent": "init",
            "hitl_required": False,
            "audit_log": []
        }, config=config)
        last_msg = result["messages"][-1]
        if hasattr(last_msg, "content"):
            if not last_msg.content and hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
                console.print(f"[bold yellow]Tool called:[/bold yellow] {last_msg.tool_calls[0]['name']}")
            else:
                console.print(last_msg.content)
        else:
            console.print(last_msg)
    except Exception as e:
        console.print(f"[bold red]Error running task:[/bold red] {e}")

@app.command()
def review():
    """Review and approve/reject pending HITL requests."""
    hitl_manager.list_pending()
    
    req_id = typer.prompt("Enter HITL ID to review (or 'exit')", default="exit")
    if req_id == "exit":
        return
    
    decision = typer.prompt("Approve or Reject? (a/r)", default="a")
    notes = typer.prompt("Notes (optional)", default="")
    
    if decision.lower().startswith("a"):
        hitl_manager.approve(req_id, notes)
    else:
        hitl_manager.reject(req_id, notes)

@app.command()
def resume(thread_id: str):
    """Resume a paused graph after HITL approval."""
    graph = build_graph()
    
    result = graph.invoke(
        Command(resume={"hitl_approved": True}),
        {"configurable": {"thread_id": thread_id}}
    )
    
    last_msg = result["messages"][-1]
    if hasattr(last_msg, "content"):
        if not last_msg.content and hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
            console.print(f"[bold yellow]Tool called:[/bold yellow] {last_msg.tool_calls[0]['name']}")
        else:
            console.print(last_msg.content)
    else:
        console.print(last_msg)

@app.command()
def chat():
    console.print("Interactive mode. Type 'exit' to quit.")
    # Add conversation loop here if desired

if __name__ == "__main__":
    app()
