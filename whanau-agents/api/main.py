# -*- coding: utf-8 -*-
"""
Aether Summit FastAPI Service.
Provides a REST API to trigger LangGraph agent workflows.
"""
import sys
import io

# Ensure stdout/stderr handle Unicode (Māori macrons etc.) on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if sys.stderr.encoding != "utf-8":
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from aether_summit.orchestrator import build_graph

app = FastAPI(
    title="Aether Summit API",
    description="Multi-agent system for Whānau Preterm Support Hub NZ",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------

class ReviewRequest(BaseModel):
    file_path: str = Field(..., description="Path to the file or component to review")
    focus_areas: Optional[List[str]] = Field(
        default=["accessibility", "cultural_safety", "testability", "code_quality"],
        description="Areas to focus the review on",
    )
    thread_id: Optional[str] = None


class GeneralTaskRequest(BaseModel):
    task: str
    thread_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Response Models
# ---------------------------------------------------------------------------

class ReviewResponse(BaseModel):
    summary: str
    findings: List[str]
    recommendations: List[str]
    cultural_safety_notes: str
    next_steps: List[str]
    thread_id: str


class AgentResponse(BaseModel):
    result: str
    thread_id: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_str(obj) -> str:
    """Safely serialise a LangGraph message object or plain value to str."""
    if hasattr(obj, "content"):
        return obj.content
    return str(obj)


def _last_message(result: dict) -> str:
    messages = result.get("messages", [])
    last = messages[-1] if messages else "No response."
    return _safe_str(last)


def _safe_error(e: Exception) -> str:
    return str(e).encode("utf-8", errors="replace").decode("utf-8")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/review", response_model=ReviewResponse)
async def review_component(request: ReviewRequest):
    """
    Review a component or file with focus on accessibility,
    cultural safety, and testability.
    """
    try:
        graph = build_graph()
        config = {"configurable": {"thread_id": request.thread_id or "review-session"}}

        focus = ", ".join(request.focus_areas)
        task = (
            f"Please review the file at '{request.file_path}' with focus on: {focus}.\n\n"
            "Return your response in a structured way with:\n"
            "- Summary\n"
            "- Key findings\n"
            "- Recommendations\n"
            "- Cultural safety considerations\n"
            "- Suggested next steps\n"
        )

        result = graph.invoke({"messages": [task]}, config=config)
        final_output = _last_message(result)

        # TODO: parse structured fields from agent output in a future iteration.
        return ReviewResponse(
            summary=final_output[:500] + ("..." if len(final_output) > 500 else ""),
            findings=["See full response for details"],
            recommendations=["See full response for details"],
            cultural_safety_notes="See full response for details",
            next_steps=["See full response for details"],
            thread_id=request.thread_id or "review-session",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=_safe_error(e))


@app.post("/run", response_model=AgentResponse)
async def run_general_task(request: GeneralTaskRequest):
    """General purpose endpoint for any agent task."""
    try:
        graph = build_graph()
        config = {"configurable": {"thread_id": request.thread_id or "default"}}

        result = graph.invoke({"messages": [request.task]}, config=config)
        final_message = _last_message(result)

        return AgentResponse(
            result=final_message,
            thread_id=request.thread_id or "default",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=_safe_error(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "aether-summit", "version": "0.2.0"}
