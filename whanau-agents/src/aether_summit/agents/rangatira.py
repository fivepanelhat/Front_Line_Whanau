from aether_summit.agents.base_agent import BaseAgent

class RangatiraAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Rangatira",
            role_description="Lead governance and supervisor agent. Responsible for coordinating other agents, planning support paths, and ensuring all tasks align with the platform's overarching objectives for whānau."
        )
