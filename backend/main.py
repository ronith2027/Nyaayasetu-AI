import json
import os
import random
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="NyayaSetu AI Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    summary: str
    legal_basis: str
    steps: List[str]
    documents_required: List[str]
    confidence_score: float

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

# --- Endpoints ---

from functions.chat.services import legal_chat_service
from functions.complaint.services import complaint_service
from functions.scheme.services import scheme_service
from functions.locator.services import locator_service

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    context = legal_chat_service.retrieve_context(request.message)
    response_data = legal_chat_service.generate_response(request.message, context)
    return response_data

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
async def admin_flagged():
    mock_flagged = [
        {
            "id": f"R-{random.randint(1000, 9999)}",
            "query": "My landlord is evicting me without notice. What can I do?",
            "response": "You should immediately seek an injunction from the local civil court.",
            "confidenceScore": 0.45,
            "timestamp": datetime.now().isoformat(),
            "status": "pending"
        },
        {
            "id": f"R-{random.randint(1000, 9999)}",
            "query": "How to apply for widow pension in Karnataka?",
            "response": "Provide death certificate of husband and income certificate.",
            "confidenceScore": 0.58,
            "timestamp": datetime.now().isoformat(),
            "status": "pending"
        }
    ]
    return {"success": True, "data": mock_flagged, "error": None}

@app.post("/admin/review")
async def admin_review(request: AdminReviewRequest):
    return {"success": True, "data": {"id": request.id, "status": request.action}, "error": None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
