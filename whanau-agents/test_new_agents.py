import asyncio
import sys
import io
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path("../.env.local"))
os.environ["LANGCHAIN_TRACING_V2"] = "false"

from langchain_core.messages import HumanMessage
from aether_summit.agents import get_agent

# Ensure stdout/stderr handle Unicode (Māori macrons etc.) on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

async def test_agent(agent_name: str, query: str):
    print(f"\n{'='*50}\nTesting {agent_name}...\nQuery: {query}\n{'-'*50}")
    
    agent = get_agent(agent_name)
    
    result = await asyncio.wait_for(
        asyncio.to_thread(
            agent,
            {
                "messages": [HumanMessage(content=query)],
                "audit_log": [],
                "current_agent": agent_name,
            },
        ),
        timeout=30,
    )
    
    messages = result.get("messages", [])
    output = messages[-1].content if messages else "No response."
    print(f"Response:\n{output}\n{'='*50}\n")

async def main():
    tests = [
        ("feeding_navigator", "My premature baby was born at 32 weeks and is currently on an NG tube. When can we start trying to breastfeed?"),
        ("discharge_companion", "We are finally going home next week! What do I need to prepare for the rooming-in phase?"),
        ("whanau_wellbeing_companion", "I feel like I'm neglecting my 4-year-old while spending all day at the NICU. How do I explain this to him?"),
        ("cultural_navigator", "We are a Māori whānau and want to know how to handle our baby's whenua (placenta) respectfully while in the hospital environment."),
        ("wellbeing_companion", "I feel guilty that my baby was born so early. The monitors are constantly beeping and I feel so overwhelmed."),
        ("peer_connector", "Are there any support groups in New Zealand for parents of preemie twins?")
    ]
    
    for agent_name, query in tests:
        try:
            await test_agent(agent_name, query)
        except Exception as e:
            print(f"Failed to test {agent_name}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
