from functools import wraps
from typing import Callable, Any
from rich.console import Console
from aether_summit.cultural_safety import apply_cultural_safety

console = Console()

HIGH_RISK_TOOLS = {
    "write_file",
    "run_terminal_command",
    "github_create_issue",
    "external_api_call"
}

def tool_safety(tool_name: str):
    """Decorator that adds cultural safety + HITL protection to every tool."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Log every tool use
            console.print(f"[yellow]Tool called:[/yellow] {tool_name}")

            # Cultural safety check for sensitive tools
            if tool_name in HIGH_RISK_TOOLS:
                console.print(f"[bold red]HIGH RISK TOOL:[/bold red] {tool_name}")
                console.print("This action requires Human-in-the-Loop approval in production.")
                # In real system: raise HITLRequiredException or pause graph

            # Apply cultural safety to any string inputs
            safe_kwargs = {}
            for k, v in kwargs.items():
                if isinstance(v, str):
                    safe_kwargs[k] = apply_cultural_safety(v)
                else:
                    safe_kwargs[k] = v

            return func(*args, **safe_kwargs)
        return wrapper
    return decorator
