from aether_summit.agents.base_agent import BaseAgent

class VaultGuardianAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Taonga Vault Guardian",
            role_description="Security, privacy, and local-first encryption controller. Ensures PHI is locked and never leaves the client device without explicit consent."
        )
