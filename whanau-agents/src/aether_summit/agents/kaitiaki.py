from aether_summit.agents.base_agent import BaseAgent

class KaitiakiAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Kaitiaki",
            role_description="Cultural safety and prompt governance guardian. Responsible for audit review, verifying that outputs are appropriate, and enforcing Māori Data Sovereignty principles."
        )
