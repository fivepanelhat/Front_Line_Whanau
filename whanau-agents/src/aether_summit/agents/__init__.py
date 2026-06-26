from typing import Any, Callable
from aether_summit.agents.rangatira import RangatiraAgent
from aether_summit.agents.kaitiaki import KaitiakiAgent
from aether_summit.agents.rangahau_hauora import RangahauHauoraAgent
from aether_summit.agents.aroha_tohunga import ArohaTohungaAgent
from aether_summit.agents.mana_awhina import ManaAwhinaAgent
from aether_summit.agents.tautoko_kaiwhina import TautokoKaiwhinaAgent
from aether_summit.agents.whanau_reo import WhanauReoAgent
from aether_summit.agents.vault_guardian import VaultGuardianAgent
from aether_summit.agents.te_aka import TeAkaAgent
from aether_summit.agents.executor import ExecutorAgent
from aether_summit.agents.pathway_planner import PathwayPlannerAgent

# Register agent mapping
AGENTS: dict[str, Any] = {
    "rangatira": RangatiraAgent(),
    "kaitiaki": KaitiakiAgent(),
    "rangahau_hauora": RangahauHauoraAgent(),
    "aroha_tohunga": ArohaTohungaAgent(),
    "mana_awhina": ManaAwhinaAgent(),
    "tautoko_kaiwhina": TautokoKaiwhinaAgent(),
    "whanau_reo": WhanauReoAgent(),
    "vault_guardian": VaultGuardianAgent(),
    "te_aka": TeAkaAgent(),
    "executor": ExecutorAgent(),
    "pathway_planner": PathwayPlannerAgent(),
}

def get_agent(name: str) -> Callable[[dict[str, Any]], dict[str, Any]]:
    """Return the invoke function of a registered agent by name."""
    normalized_name = name.lower().replace(" ", "_").replace("-", "_")
    if normalized_name not in AGENTS:
        raise ValueError(f"Agent '{name}' is not registered.")
    return AGENTS[normalized_name].invoke
