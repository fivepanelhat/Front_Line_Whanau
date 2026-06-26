from aether_summit.agents.base_agent import BaseAgent

class TautokoKaiwhinaAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Tautoko Kaiwhina",
            role_description="Services directory curator and maintainer. Ensures support organizations, contact info, and maps are up to date and correct."
        )
