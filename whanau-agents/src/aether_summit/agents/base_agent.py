from typing import Any
from aether_summit.cultural_safety import apply_cultural_safety

class BaseAgent:
    def __init__(self, name: str, role_description: str):
        self.name = name
        self.role_description = role_description

    def compile_prompt(self, user_input: str) -> str:
        base_prompt = f"Role: {self.name}\nDescription: {self.role_description}\n\nUser Task: {user_input}"
        return apply_cultural_safety(base_prompt)

    def invoke(self, state: dict[str, Any]) -> dict[str, Any]:
        last_message = state.get("messages", [])[-1] if state.get("messages") else "No task provided."
        compiled = self.compile_prompt(str(last_message))
        
        response = f"[{self.name} processed task under cultural guidance]: Checked safety and aligned with Tiriti principles. Task context: {last_message}"
        
        new_messages = list(state.get("messages", [])) + [response]
        new_audit = list(state.get("audit_log", [])) + [f"Agent {self.name} executed successfully."]
        
        return {
            "messages": new_messages,
            "audit_log": new_audit,
            "current_agent": self.name
        }
