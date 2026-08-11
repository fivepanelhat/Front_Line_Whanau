from langchain_core.tools import tool
from pydantic import BaseModel, Field
from .safety import tool_safety
import subprocess
import shlex

class RunCommandInput(BaseModel):
    command: str = Field(..., description="Shell command to run (use with extreme caution)")

@tool("run_terminal_command", args_schema=RunCommandInput)
@tool_safety("run_terminal_command")
def run_terminal_command(command: str) -> str:
    """
    Execute a terminal command safely without shell injection vulnerabilities.
    
    SECURITY: Commands are parsed safely using shlex.split() and passed as argument
    lists to subprocess.run(), eliminating shell injection (B602) vectors.
    
    HIGH RISK — requires HITL approval in production.
    """
    try:
        # Parse command string safely into argument list (no shell=True)
        args = shlex.split(command)
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=30
        )
        return f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    except ValueError as e:
        # shlex.split raises ValueError on unclosed quotes
        return f"Error parsing command: {str(e)} (malformed shell syntax)"
    except subprocess.TimeoutExpired:
        return "Error: Command execution timed out (30 seconds)"
    except FileNotFoundError as e:
        return f"Error: Command not found: {str(e)}"
    except Exception as e:
        return f"Error executing command: {str(e)}"
