from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from pydantic import BaseModel, Field
from .safety import tool_safety

class WebSearchInput(BaseModel):
    query: str = Field(..., description="Search query. Be specific and culturally appropriate.")
    max_results: int = Field(5, description="Number of results to return")

@tool("web_search", args_schema=WebSearchInput)
@tool_safety("web_search")
def web_search(query: str, max_results: int = 5) -> str:
    """Search the web for current information. Always cite sources."""
    search = DuckDuckGoSearchRun()
    results = search.run(query)
    return f"Search results for: {query}\n\n{results}\n\n[Note: Always verify information and cite sources in final output]"
