from aether_summit.agents.base_agent import BaseAgent

class PathwayPlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Pathway Planner",
            role_description="Personalized support pathways generator. Designs specific checklists and step-by-step guidance pathways for preterm twin journeys."
        )
