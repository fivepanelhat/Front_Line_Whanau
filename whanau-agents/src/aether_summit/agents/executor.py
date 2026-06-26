from aether_summit.agents.base_agent import BaseAgent

class ExecutorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Aether Summit Executor",
            role_description="Action-taking agent. Generates document drafts, prepares form pre-fills, and schedules task reminders for whānau."
        )
