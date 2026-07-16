"""
Agent Registry for Aether Summit.
Loads agent prompts from the filesystem and maps tools to specific agents.
"""
from pathlib import Path
from .base_agent import create_agent_with_tools
from aether_summit.tools import web_search, read_file, write_file, run_terminal_command, github_search

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
PROMPTS_DIR = PROJECT_ROOT / "prompts"

AGENT_NAMES = [
 "aether_summit", "rangatira", "kaitiaki", "whanau_voice", "hauora_safety", 
 "forge", "korero", "edge_sovereign", "tikanga_ture", "kounga", "manaaki",
 "feeding_navigator", "discharge_companion", "whanau_wellbeing_companion",
 "cultural_navigator", "wellbeing_companion", "peer_connector"
]

AGENT_PROMPTS = {}
for name in AGENT_NAMES:
 try:
 with open(PROMPTS_DIR / f"{name}.md", "r", encoding="utf-8") as f:
 AGENT_PROMPTS[name] = f.read().strip()
 except FileNotFoundError:
 # Fallback to an empty prompt if not yet generated
 AGENT_PROMPTS[name] = f"You are {name}."

def get_agent(name: str):
 if name not in AGENT_PROMPTS:
 raise ValueError(f"Unknown agent: {name}")
 
 # Map agents to their specific tools
 tools = [web_search] # Default: web_search only for "Others"
 
 if name == "forge":
 tools = [read_file, write_file, run_terminal_command]
 elif name == "kounga":
 tools = [read_file, web_search]
 elif name == "korero":
 tools = [web_search]
 elif name == "edge_sovereign":
 tools = [read_file, run_terminal_command]
 elif name == "aether_summit":
 tools = [web_search, read_file, write_file, run_terminal_command, github_search]
 
 return create_agent_with_tools(AGENT_PROMPTS[name], name, tools=tools)
