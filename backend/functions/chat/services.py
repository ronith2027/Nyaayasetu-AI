import os
import json
import time
from typing import List, Dict, Any

# Mock legal chunks similar to the TypeScript implementation
MOCK_LEGAL_CHUNKS = [
    {
        "id": "chunk-ipc-506",
        "source": "Indian Penal Code",
        "content": "Section 506 IPC: Punishment for criminal intimidation. Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both."
    },
    {
        "id": "chunk-consumer",
        "source": "Consumer Protection Act",
        "content": "A consumer can file a complaint in a Consumer Commission if there's a defect in goods or deficiency in services. The complaint can be filed in the District Commission if the value of goods/services is up to ₹50 Lakhs."
    },
    {
        "id": "chunk-fir",
        "source": "Procedural Law - CrPC",
        "content": "First Information Report (FIR) under Section 154 CrPC can be filed by anyone who has information about a cognizable offence. Police are bound to register it. You can also file a Zero FIR at any police station regardless of jurisdiction."
    },
    {
        "id": "chunk-women-dv",
        "source": "Protection of Women from Domestic Violence Act",
        "content": "A woman has the right to reside in a shared household. She can file a case under the Domestic Violence Act, 2005 for protection orders, residence orders, and monetary relief against physical, mental, verbal or economic abuse."
    },
    {
        "id": "chunk-rti",
        "source": "Right to Information Act",
        "content": "Under the RTI Act, 2005, any Indian citizen can request information from a 'public authority'. The application must be responded to within 30 days."
    },
    {
        "id": "chunk-cyber",
        "source": "Information Technology Act",
        "content": "Section 66E of the IT Act prescribes punishment for violation of privacy (publishing images of private areas). Cyber crimes can be reported at cybercrime.gov.in."
    }
]

class LegalChatService:
    def __init__(self):
        # In a real app, we'd initialize the LLM and Vector Store here
        pass

    def retrieve_context(self, query: str) -> List[Dict[str, Any]]:
        """Simulated semantic search for relevant legal chunks"""
        query_lower = query.lower()
        results = []
        
        for chunk in MOCK_LEGAL_CHUNKS:
            score = 0.5
            content_lower = chunk["content"].lower()
            
            # Simple keyword matching for simulation
            keywords = {
                "consumer": ["consumer", "buy", "shop", "defective", "refund", "service"],
                "fir": ["police", "fir", "report", "crime", "incident"],
                "ipc-506": ["threat", "intimidation", "scare", "force"],
                "women-dv": ["woman", "wife", "abuse", "violence", "domestic"],
                "rti": ["information", "rti", "government", "public"],
                "cyber": ["cyber", "online", "privacy", "hacking"]
            }
            
            chunk_key = chunk["id"].replace("chunk-", "")
            if chunk_key in keywords:
                for kw in keywords[chunk_key]:
                    if kw in query_lower:
                        score += 0.4
                        break
            
            results.append({**chunk, "score": score})
            
        # Sort by score and return top 3
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:3]

    def generate_response(self, query: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Simulated LLM response generation based on context"""
        query_lower = query.lower()
        best_context = context[0] if context else None
        
        # Default response
        response = {
            "summary": "Based on the information provided, it seems you are facing a legal issue. Please consult with a legal professional for complete advice.",
            "legal_basis": "Applicable Indian Laws",
            "steps": ["Gather any physical or digital evidence.", "Consult a local attorney or visit the nearest legal aid camp."],
            "documents_required": ["Any relevant ID proof (Aadhar)", "Written summary of the incident"],
            "confidence_score": 0.7
        }

        # Override based on context and keywords
        if any(kw in query_lower for kw in ["consumer", "defective", "refund"]):
            response = {
                "summary": "If you have received a defective product or deficient service, you are protected as a consumer. You have the right to seek replacement, refund, or compensation.",
                "legal_basis": "Consumer Protection Act, 2019",
                "steps": [
                    "Send a written legal notice to the seller/company.",
                    "If unresolved, file a complaint on the National Consumer Helpline (NCH) app or website.",
                    "If the amount is under ₹50 Lakhs, approach the District Consumer Dispute Redressal Commission."
                ],
                "documents_required": ["Original purchase bill/invoice", "Proof of payment", "Copy of warranty card", "Photos of defective product"],
                "confidence_score": 0.95
            }
        elif any(kw in query_lower for kw in ["fir", "police", "crime", "report"]):
            response = {
                "summary": "You have the right to report a serious crime (cognizable offence) to the police. They must register your complaint as an FIR.",
                "legal_basis": "Section 154 of the Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS)",
                "steps": [
                    "Visit the nearest police station.",
                    "Provide a written complaint or orally narrate the incident to the officer.",
                    "Demand a free copy of the FIR after it's registered.",
                    "If police refuse, you can send the complaint via post to the Superintendent of Police (SP)."
                ],
                "documents_required": ["Written complaint signed by you", "Any photo/video evidence if available", "Aadhar card or ID proof"],
                "confidence_score": 0.92
            }
        elif any(kw in query_lower for kw in ["threat", "intimidation"]):
            response = {
                "summary": "Threatening someone physically or mentally is a criminal offence. You do not have to tolerate criminal intimidation.",
                "legal_basis": "Section 506 of the Indian Penal Code (IPC) / BNS equivalent",
                "steps": [
                    "Do not delete any evidence (messages, call recordings).",
                    "Visit the nearest police station to report the intimidation.",
                    "File a formal written complaint against the person threatening you."
                ],
                "documents_required": ["Screenshots of threatening messages", "Audio/Video recordings if any", "Witness statements (if anyone was present)"],
                "confidence_score": 0.88
            }
        elif any(kw in query_lower for kw in ["wife", "abuse", "domestic", "woman"]):
            response = {
                "summary": "Domestic violence is a serious crime. Women are protected against physical, mental, emotional, or economic abuse within a shared household.",
                "legal_basis": "Protection of Women from Domestic Violence Act, 2005",
                "steps": [
                    "Reach out to the Women's Helpline (1091) or Emergency Police (112).",
                    "Contact a Protection Officer in your district.",
                    "File an application before the Magistrate for a protection or residence order."
                ],
                "documents_required": ["Medical reports if any injuries occurred", "Marriage certificate (if applicable)", "Any proof of shared household"],
                "confidence_score": 0.94
            }
        elif any(kw in query_lower for kw in ["murder", "bomb", "terrorism"]):
            response = {
                "summary": "This is a highly sensitive and severe criminal matter. We cannot provide complete legal advice on this. Please contact emergency services immediately.",
                "legal_basis": "Indian Penal Code / Applicable Anti-Terror Laws",
                "steps": [
                    "Dial 112 immediately for emergency police assistance.",
                    "Do not take the law into your own hands.",
                    "Contact a qualified criminal defense lawyer."
                ],
                "documents_required": ["Not applicable at this stage"],
                "confidence_score": 0.5
            }
            
        return response

legal_chat_service = LegalChatService()
