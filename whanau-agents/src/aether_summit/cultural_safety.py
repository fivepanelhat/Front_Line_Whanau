from typing import Any
from rich.console import Console

console = Console()

import os
from pathlib import Path

# Resolve path to the prompts directory relative to the project root
# (assuming this file is at src/aether_summit/cultural_safety.py, project root is two levels up)
PROJECT_ROOT = Path(__file__).parent.parent.parent
PROMPTS_DIR = PROJECT_ROOT / "prompts"

try:
 with open(PROMPTS_DIR / "cultural_principles.md", "r", encoding="utf-8") as f:
 CULTURAL_PRINCIPLES = f.read().strip()
except FileNotFoundError:
 CULTURAL_PRINCIPLES = "Cultural principles file missing."

def apply_cultural_safety(prompt: str) -> str:
 return f"{CULTURAL_PRINCIPLES}\n\nUser request: {prompt}"
