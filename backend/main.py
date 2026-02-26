import json
import os
import random
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
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
    gender: str

class SchemeResponse(BaseModel):
    scheme_name: str
    benefit: str
    why_eligible: str
    documents_required: List[str]
    apply_link: str

class ComplaintRequest(BaseModel):
    complainant: dict
    oppositeParty: dict
    facts: str

class ComplaintResponseData(BaseModel):
    complaint_text: str
    sections_referenced: List[str]
    download_url: str

class ComplaintResponse(BaseModel):
    success: bool
    data: Optional[ComplaintResponseData]
    error: Optional[str]

# --- Helpers ---

def get_schemes():
    path = os.path.join(os.path.dirname(__file__), "functions/scheme/schemes.json")
    with open(path, "r") as f:
        return json.load(f)

# --- Endpoints ---

from functions.chat.services import legal_chat_service
from functions.complaint.services import complaint_service

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    context = legal_chat_service.retrieve_context(request.message)
    response_data = legal_chat_service.generate_response(request.message, context)
    return response_data

@app.post("/schemes", response_model=List[SchemeResponse])
async def schemes(request: SchemeRequest):
    schemes_data = get_schemes()
    matched = []
    
    for s in schemes_data:
        # Income check
        if s["income_limit"] != 0 and request.annualIncome > s["income_limit"]:
            continue
        
        # State check
        if s["state"] != "All" and request.state and s["state"].lower() != request.state.lower():
            continue
        
        # Category check
        if s["category"] != "All" and request.category and request.category not in s["category"].split('/'):
            continue
            
        # Gender check
        if s["gender"] != "All" and request.gender and s["gender"].lower() != request.gender.lower():
            continue
            
        # Occupation check
        if s["occupation"] != "All" and request.occupation and s["occupation"].lower() != request.occupation.lower():
            continue
            
        matched.append({
            "scheme_name": s["scheme_name"],
            "benefit": s["benefit"],
            "why_eligible": f"Matched based on your { 'income, ' if s['income_limit'] > 0 else '' }{ 'gender, ' if s['gender'] != 'All' else '' }and { 'occupation' if s['occupation'] != 'All' else 'profile' }.",
            "documents_required": s["documents_required"],
            "apply_link": s["apply_link"]
        })
        
    return matched

@app.post("/complaint", response_model=ComplaintResponse)
async def complaint(request: ComplaintRequest):
    return complaint_service.generate_complaint(request.dict())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
