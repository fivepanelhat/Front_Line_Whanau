# -*- coding: utf-8 -*-
"""
Aether Summit FastAPI Service.
Provides a REST API to trigger LangGraph agent workflows.
"""
import sys
import io
import re
import asyncio
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage
from aether_summit.orchestrator import build_graph
from aether_summit.agents import get_agent

PROJECT_ROOT = Path(__file__).parent.parent
PROMPTS_DIR = PROJECT_ROOT / "prompts"
REVIEW_TIMEOUT_SECONDS = 60

# Ensure stdout/stderr handle Unicode (Māori macrons etc.) on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if sys.stderr.encoding != "utf-8":
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

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
    cultural_safety_notes: List[str]
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


def _sanitize_review_text(output: str) -> str:
    """Remove tool-call artifacts and fenced code that pollute structured review output."""
    cleaned = re.sub(r"```[\s\S]*?```", "", output)
    cleaned = re.sub(r"^\s*\{\s*\"name\"\s*:\s*\"[^\"]+\"[\s\S]*?\}\s*$", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned


def _extract_bullets(text: str) -> List[str]:
    """Extract bullet/numbered items from a section, with paragraph fallback."""
    items: List[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        line = re.sub(r"^[-*]\s+", "", line)
        line = re.sub(r"^\d+\.\s+", "", line)
        if line:
            items.append(line)

    if items:
        return items

    fallback = [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]
    return fallback[:1]


def _parse_review_output(output: str) -> dict:
    """Parse structured markdown review output into API response fields."""
    output = _sanitize_review_text(output)
    heading_pattern = re.compile(
        r"(?is)(?:\*\*)?(Summary|Key Findings|Recommendations|Cultural Safety Notes|Next Steps)(?:\*\*)?\s*:?")

    matches = list(heading_pattern.finditer(output))
    sections: dict[str, str] = {}

    for i, match in enumerate(matches):
        heading = match.group(1)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(output)
        sections[heading] = output[start:end].strip()

    summary = sections.get("Summary", "").strip()
    if not summary:
        summary = output.strip()

    findings = _extract_bullets(sections.get("Key Findings", ""))
    recommendations = _extract_bullets(sections.get("Recommendations", ""))
    cultural_notes = _extract_bullets(sections.get("Cultural Safety Notes", ""))
    next_steps = _extract_bullets(sections.get("Next Steps", ""))

    # Fallbacks if the model returns partially structured content.
    if not findings:
        findings = ["No findings section parsed; see summary."]
    if not recommendations:
        recommendations = ["No recommendations section parsed; see summary."]
    if not cultural_notes:
        cultural_notes = ["No cultural safety notes parsed; see summary."]
    if not next_steps:
        next_steps = ["No next steps parsed; see summary."]

    return {
        "summary": summary,
        "findings": findings,
        "recommendations": recommendations,
        "cultural_safety_notes": cultural_notes,
        "next_steps": next_steps,
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/review", response_model=ReviewResponse)
async def review_component(request: ReviewRequest):
    """
    Structured code/component review with cultural safety focus.
    Automatically reads the file content before sending to agents.
    """
    try:
        # Security: Restrict file access to the current project directory
        project_root = Path.cwd()
        file_path = Path(request.file_path)

        # Prevent path traversal attacks
        if not str(file_path.resolve()).startswith(str(project_root.resolve())):
            raise HTTPException(status_code=400, detail="Invalid file path")

        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")

        # Read the file content
        file_content = file_path.read_text(encoding="utf-8")

        # Load the structured review prompt
        with open("prompts/code_reviewer.md", "r", encoding="utf-8") as f:
            reviewer_prompt = f.read()

        focus = ", ".join(request.focus_areas or [])

        # Build the full task with file content
        task = f"""{reviewer_prompt}

Please review the following file: `{request.file_path}`

Focus areas: {focus}

--- FILE CONTENT ---
{file_content}
--- END OF FILE ---

Return your response using the exact structure defined in the instructions above.
Do not include tool-call JSON, pseudo-code blocks, or markdown fenced code blocks.
Do not suggest executing tools; provide review text only.
"""

        # Invoke reviewer agent directly to avoid supervisor HITL interruption for review prompts.
        reviewer_agent = get_agent("forge")
        result = await asyncio.wait_for(
            asyncio.to_thread(
                reviewer_agent,
                {
                    "messages": [HumanMessage(content=task)],
                    "audit_log": [],
                    "current_agent": "forge",
                },
            ),
            timeout=REVIEW_TIMEOUT_SECONDS,
        )
        output = _last_message(result)
        parsed = _parse_review_output(output)

        return ReviewResponse(
            summary=parsed["summary"],
            findings=parsed["findings"],
            recommendations=parsed["recommendations"],
            cultural_safety_notes=parsed["cultural_safety_notes"],
            next_steps=parsed["next_steps"],
            thread_id=request.thread_id or "review-session"
        )

    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Review request timed out after {REVIEW_TIMEOUT_SECONDS} seconds",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")


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
