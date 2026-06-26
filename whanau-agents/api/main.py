# -*- coding: utf-8 -*-
"""
Aether Summit FastAPI Service.
Provides a REST API to trigger LangGraph agent workflows.
"""
import sys
import io

# Ensure stdout/stderr handle Unicode (Maori macrons etc.) on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from aether_summit.orchestrator import build_graph

app = FastAPI(title="Aether Summit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    task: str
    thread_id: str | None = None

@app.post("/run")
async def run_agent(request: TaskRequest):
    try:
        graph = build_graph()
        config = {"configurable": {"thread_id": request.thread_id or "default"}}
        result = graph.invoke({"messages": [request.task]}, config=config)
        messages = result.get("messages", [])
        last = messages[-1] if messages else None
        # Safely serialise — LangGraph messages may be objects
        if hasattr(last, "content"):
            last = last.content
        return {"result": last, "thread_id": request.thread_id}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e).encode("utf-8", errors="replace").decode("utf-8")
        )

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "aether-summit"}
