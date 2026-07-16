from langchain_core.tools import tool
from pydantic import BaseModel, Field
from .safety import tool_safety
import subprocess

class RunCommandInput(BaseModel):
 command: str = Field(..., description="Shell command to run (use with extreme caution)")

@tool("run_terminal_command", args_schema=RunCommandInput)
@tool_safety("run_terminal_command")
def run_terminal_command(command: str) -> str:
 """Execute a terminal command. HIGH RISK - only use for safe operations."""
 try:
 result = subprocess.run(
 command,
 shell=True,
 capture_output=True,
 text=True,
 timeout=30
 )
 return f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
 except Exception as e:
 return f"Error executing command: {str(e)}"
