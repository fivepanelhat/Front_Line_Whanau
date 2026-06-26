"""
Aether Summit FastAPI Service.
Provides a REST API to trigger LangGraph agent workflows.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from aether_summit.orchestrator import build_graph

app = FastAPI(title="Aether Summit API")

class TaskRequest(BaseModel):
    task: str
    thread_id: str | None = None

@app.post("/run")
async def run_agent(request: TaskRequest):
    try:
        graph = build_graph()
        config = {"configurable": {"thread_id": request.thread_id or "default"}}
        result = graph.invoke({"messages": [request.task]}, config=config)
        return {"result": result.get("messages", [])[-1], "thread_id": request.thread_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "aether-summit"}
