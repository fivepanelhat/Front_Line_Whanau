from langchain_core.tools import tool
from pydantic import BaseModel, Field
from pathlib import Path
from .safety import tool_safety

# Dynamically set PROJECT_ROOT to a workspace directory in the user's project
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent / "workspace"

class ReadFileInput(BaseModel):
    path: str = Field(..., description="Relative path inside the allowed project directory")

@tool("read_file", args_schema=ReadFileInput)
@tool_safety("read_file")
def read_file(path: str) -> str:
    """Read a file from the project (restricted directory)."""
    full_path = PROJECT_ROOT / path
    if not str(full_path.resolve()).startswith(str(PROJECT_ROOT.resolve())):
        return "Error: Access denied outside allowed directory."
    if not full_path.exists():
        return f"File not found: {path}"
    return full_path.read_text(encoding="utf-8")


class WriteFileInput(BaseModel):
    path: str = Field(...)
    content: str = Field(...)

@tool("write_file", args_schema=WriteFileInput)
@tool_safety("write_file")
def write_file(path: str, content: str) -> str:
    """Write content to a file. HIGH RISK — requires human approval in production."""
    full_path = PROJECT_ROOT / path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content, encoding="utf-8")
    return f"File written successfully: {path}"
