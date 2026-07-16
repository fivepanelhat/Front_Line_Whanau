"""
Human-in-the-Loop (HITL) system for Aether Summit.
Manages interactive safety intercepts before high-risk actions are performed.
"""
from typing import Any
from dataclasses import dataclass, field
from datetime import datetime
from rich.console import Console
from rich.table import Table

console = Console()

@dataclass
class HITLRequest:
 id: str
 agent: str
 action: str
 details: str
 timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
 status: str = "pending" # pending, approved, rejected
 human_notes: str = ""

class HITLManager:
 def __init__(self):
 self.requests: dict[str, HITLRequest] = {}
 self.next_id = 1

 def create_request(self, agent: str, action: str, details: str) -> str:
 req_id = f"hitl-{self.next_id:04d}"
 self.next_id += 1
 
 request = HITLRequest(
 id=req_id,
 agent=agent,
 action=action,
 details=details
 )
 self.requests[req_id] = request
 
 console.print(f"\n[bold red]⚠️ HITL REQUIRED[/bold red]")
 console.print(f"ID: {req_id}")
 console.print(f"Agent: {agent}")
 console.print(f"Action: {action}")
 console.print(f"Details: {details}\n")
 
 return req_id

 def approve(self, req_id: str, notes: str = "") -> bool:
 if req_id not in self.requests:
 return False
 self.requests[req_id].status = "approved"
 self.requests[req_id].human_notes = notes
 console.print(f"[green][OK] Approved:[/green] {req_id}")
 return True

 def reject(self, req_id: str, notes: str = "") -> bool:
 if req_id not in self.requests:
 return False
 self.requests[req_id].status = "rejected"
 self.requests[req_id].human_notes = notes
 console.print(f"[red][X] Rejected:[/red] {req_id}")
 return True

 def list_pending(self):
 pending = [r for r in self.requests.values() if r.status == "pending"]
 if not pending:
 console.print("[green]No pending HITL requests.[/green]")
 return

 table = Table(title="Pending Human-in-the-Loop Requests")
 table.add_column("ID", style="cyan")
 table.add_column("Agent", style="magenta")
 table.add_column("Action")
 table.add_column("Details", overflow="fold")

 for req in pending:
 table.add_row(req.id, req.agent, req.action, req.details[:80] + "...")
 
 console.print(table)

# Global instance
hitl_manager = HITLManager()
