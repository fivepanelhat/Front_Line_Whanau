"""
Base Agent factory for Aether Summit.
Dynamically creates LangChain runnables with tool bindings and cultural safety.
"""
from typing import Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from aether_summit.config import settings
from aether_summit.cultural_safety import apply_cultural_safety

def create_agent(system_prompt: str, name: str, tools: list = None):
 llm = ChatGoogleGenerativeAI(
 model="gemini-2.5-flash",
 temperature=0.1,
 max_output_tokens=1024,
 )
 prompt = ChatPromptTemplate.from_messages([
 ("system", apply_cultural_safety(system_prompt)),
 ("placeholder", "{messages}"),
 ])
 
 if tools:
 return prompt | llm.bind_tools(tools)
 return prompt | llm

def create_agent_with_tools(system_prompt: str, name: str, tools: list = None):
 runnable = create_agent(system_prompt, name, tools)
 
 def invoke(state: dict[str, Any]) -> dict[str, Any]:
 messages = state.get("messages", [])
 if not messages:
 messages = ["No task provided."]
 
 # Invoke the LangChain runnable with the current messages
 response = runnable.invoke({"messages": messages})
 
 new_audit = list(state.get("audit_log", [])) + [f"Agent {name} executed successfully with LLM."]
 
 return {
 "messages": [response],
 "audit_log": new_audit,
 "current_agent": name
 }
 
 return invoke

class BaseAgent:
 def __init__(self, name: str, role_description: str):
 self.name = name
 self.role_description = role_description
 self.agent_runnable = create_agent(role_description, name)

 def invoke(self, state: dict[str, Any]) -> dict[str, Any]:
 messages = state.get("messages", [])
 if not messages:
 messages = ["No task provided."]
 
 # Invoke the LangChain runnable with the current messages
 response = self.agent_runnable.invoke({"messages": messages})
 
 new_messages = list(state.get("messages", [])) + [response.content]
 new_audit = list(state.get("audit_log", [])) + [f"Agent {self.name} executed successfully with LLM."]
 
 return {
 "messages": new_messages,
 "audit_log": new_audit,
 "current_agent": self.name
 }
