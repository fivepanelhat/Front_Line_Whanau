from aether_summit.agents.base_agent import BaseAgent

class TeAkaAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Te Aka Translator",
            role_description="Māori language curation and translation guide. Ensures all te reo Māori translations are accurate and culturally respectful, with proper macron usage."
        )
