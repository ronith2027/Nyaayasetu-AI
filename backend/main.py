import json
import os
import random
from datetime import datetime
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Body, Request, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ----------------------------------------------------------------------
# DynamoDB service imports (relative to the backend package)
# ----------------------------------------------------------------------
from .services.dynamodb_service import (
    DynamoDBServiceError,
    get_chat_history_for_user,
    save_chat_message,
)

load_dotenv()


# --------------------------------------------------------------
# FastAPI app creation
# --------------------------------------------------------------
app = FastAPI(title="NyayaSetu AI Backend")

# --------------------------------------------------------------
# CORS middleware – allow only the required origins
# --------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nyayasetu-test-frontend.s3-website-us-east-1.amazonaws.com",
        "http://localhost:3000",
        "http://192.168.31.86:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],   # all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, …)
    allow_headers=["*"],   # all request headers
)

# --------------------------------------------------------------
# Router imports (relative)
# --------------------------------------------------------------
from .auth_router import router as auth_router
from .user_data_router import router as user_data_router
from .search_router import router as search_router

app.include_router(auth_router)
app.include_router(user_data_router)
app.include_router(search_router)

# --------------------------------------------------------------
# Pydantic models used by the API
# --------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    summary: str
    legal_basis: str
    steps: List[str]
    documents_required: List[str]
    confidence_score: float


class ChatHistoryItem(BaseModel):
    user_id: str
    timestamp: int
    user_message: str
    ai_response: str


class SchemeRequest(BaseModel):
    age: int
    state: str
    category: str
    annualIncome: int
    occupation: str
    gender: Optional[str] = "All"


class SchemeResponse(BaseModel):
    id: str
    name: str
    description: str
    eligibility: str
    benefit: str
    reasoning: str


class ComplaintRequest(BaseModel):
    complainant: dict
    oppositeParty: dict
    facts: str
    legalGrounds: Optional[str] = None
    relief: Optional[str] = None
    declaration: Optional[bool] = False


class ComplaintResponseData(BaseModel):
    complaint_text: Optional[str] = None
    formattedDraft: Optional[str] = None
    draftId: Optional[str] = None
    sections_referenced: Optional[List[str]] = None
    download_url: Optional[str] = None


class ComplaintResponse(BaseModel):
    success: bool
    data: Optional[ComplaintResponseData]
    error: Optional[str]


class LocateRequest(BaseModel):
    pincode: Optional[str] = None
    state: Optional[str] = None


class AdminReviewRequest(BaseModel):
    id: str
    action: str


# --------------------------------------------------------------
# Service imports (relative)
# --------------------------------------------------------------
from backend.functions.chat.services import legal_chat_service
from backend.functions.complaint.services import complaint_service
from backend.functions.scheme.services import scheme_service
from backend.functions.locator.services import locator_service


# --------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------
@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: Request,
    message: str = Form(...),
    language: str = Form("en-IN"),
    file: Optional[UploadFile] = File(None),
):
    pdf_bytes = None
    if file:
        pdf_bytes = await file.read()

    context = legal_chat_service.retrieve_context(message)
    response_data = legal_chat_service.generate_response(
        message, language, context, pdf_bytes
    )

    # Best‑effort persistence of chat interaction to DynamoDB
    user_id = request.headers.get("x-user-id") or "anonymous"
    try:
        save_chat_message(
            user_id=str(user_id),
            user_message=message,
            ai_response=json.dumps(response_data, ensure_ascii=False),
        )
    except DynamoDBServiceError as e:
        print(f"Warning: Failed to store chat message in DynamoDB: {e}")

    return response_data


@app.get("/chat/history", response_model=List[ChatHistoryItem])
async def chat_history(user_id: str, limit: int = 50):
    """Retrieve recent chat history for a given user from DynamoDB."""
    try:
        items = get_chat_history_for_user(user_id=user_id, limit=limit)
    except DynamoDBServiceError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {e}")

    # Normalize items to the expected schema
    return [
        ChatHistoryItem(
            user_id=str(item.get("user_id", "")),
            timestamp=int(item.get("timestamp", 0)),
            user_message=str(item.get("user_message", "")),
            ai_response=str(item.get("ai_response", "")),
        )
        for item in items
    ]


@app.post("/schemes", response_model=List[SchemeResponse])
async def schemes(request: SchemeRequest):
    return scheme_service.get_matched_schemes(request.dict())


@app.post("/complaint", response_model=ComplaintResponse)
async def complaint(request: ComplaintRequest):
    # Merge both logic: calculate sections and also provide formattedDraft
    result = complaint_service.generate_complaint(request.dict())

    # Add fields from TS version for frontend compatibility
    draft_id = f"CMP-{random.randint(100000, 999999)}"
    result["data"]["draftId"] = draft_id
    result["data"]["formattedDraft"] = result["data"]["complaint_text"]

    return result


@app.post("/locate")
async def locate(request: LocateRequest):
    return locator_service.locate_centers(request.dict())


@app.api_route("/admin/flagged", methods=["GET", "POST"])
async def admin_flagged(request: Request):
    return _get_mock_flagged()


def _get_mock_flagged():
    mock_flagged = [
        {
            "id": f"R-{random.randint(1000, 9999)}",
            "query": "My landlord is evicting me without notice. What can I do?",
            "response": "You should immediately seek an injunction from the local civil court.",
            "confidenceScore": 0.45,
            "timestamp": datetime.now().isoformat(),
            "status": "pending",
        },
        {
            "id": f"R-{random.randint(1000, 9999)}",
            "query": "How to apply for widow pension in Karnataka?",
            "response": "Provide death certificate of husband and income certificate.",
            "confidenceScore": 0.58,
            "timestamp": datetime.now().isoformat(),
            "status": "pending",
        },
    ]
    return {"success": True, "data": mock_flagged, "error": None}


@app.post("/admin/review")
async def admin_review(request: AdminReviewRequest):
    return {"success": True, "data": {"id": request.id, "status": request.action}, "error": None}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
