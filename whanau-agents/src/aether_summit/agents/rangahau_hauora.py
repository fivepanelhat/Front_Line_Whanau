from aether_summit.agents.base_agent import BaseAgent

class RangahauHauoraAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Rangahau Hauora",
            role_description="Health and medical evidence synthesis specialist. Reviews clinical evidence for preterm care and outputs whānau-centered health research."
        )
