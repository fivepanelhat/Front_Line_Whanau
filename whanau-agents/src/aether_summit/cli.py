import sys
import typer
from rich.console import Console
from aether_summit.orchestrator import build_graph

# Reconfigure console streams to support Māori macrons on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

app = typer.Typer(help="Aether Summit — Culturally Compliant Agent System")
console = Console()

@app.command()
def run(task: str):
    """Run a task through the full agent swarm with cultural safety."""
    console.print("[bold green]Aether Summit v0.2.0[/bold green] — Whānau Preterm Support Hub")
    graph = build_graph()
    
    # Checkpoint configuration required by SqliteSaver
    config = {"configurable": {"thread_id": "cli_run"}}
    
    try:
        result = graph.invoke(
            {"messages": [task], "audit_log": [], "current_agent": "init", "hitl_required": False}, 
            config=config
        )
        console.print("\n[bold cyan]Resulting State Graph Messages:[/bold cyan]")
        for msg in result["messages"]:
            console.print(f"- {msg}")
        console.print("\n[bold yellow]Audit Logs:[/bold yellow]")
        for log in result["audit_log"]:
            console.print(f"- {log}")
    except Exception as e:
        console.print(f"[bold red]Error running task:[/bold red] {e}")

@app.command()
def chat():
    """Interactive chat mode with checkpoint memory."""
    console.print("[bold green]Aether Summit Chat Mode[/bold green]")
    console.print("Entering interactive mode. Type 'exit' or 'quit' to exit.\n")
    
    graph = build_graph()
    config = {"configurable": {"thread_id": "cli_chat"}}
    messages: list[str] = []
    audit_log: list[str] = []
    
    while True:
        try:
            task = typer.prompt("Whānau Assist")
            if task.strip().lower() in ["exit", "quit"]:
                console.print("Goodbye.")
                break
            if not task.strip():
                continue
            messages.append(task)
            
            result = graph.invoke(
                {"messages": messages, "audit_log": audit_log, "current_agent": "init", "hitl_required": False}, 
                config=config
            )
            
            messages = result["messages"]
            audit_log = result["audit_log"]
            
            last_response = messages[-1]
            console.print(f"\n[bold cyan]Response:[/bold cyan]\n{last_response}\n")
            console.print(f"[dim]Latest Audit Log: {audit_log[-1]}[/dim]\n")
        except KeyboardInterrupt:
            console.print("\nGoodbye.")
            break
        except Exception as e:
            console.print(f"[bold red]Error:[/bold red] {e}")

if __name__ == "__main__":
    app()
