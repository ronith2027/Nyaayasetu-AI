import os
import json
import google.generativeai as genai
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class LegalChatService:
    def __init__(self):
        try:
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception as e:
            print(f"Warning: Failed to initialize Gemini model: {e}")
            self.model = None

    def retrieve_context(self, query: str) -> List[Dict[str, Any]]:
        """
        In a real app, this would do vector search.
        For now, we just pass the query directly to Gemini, so no mock chunks are needed.
        """
        return []

    def generate_response(self, query: str, language: str, context: List[Dict[str, Any]], pdf_bytes: bytes = None) -> Dict[str, Any]:
        if not self.model:
            return self._fallback_response()
            
        system_instruction = f"""
        You are NyayaSetu AI, an expert virtual legal assistant for Indian Law.
        Provide accurate, helpful, and concise legal guidance based on the user's query and any optional document text they provided.
        IMPORTANT: You MUST respond in the EXACT same language matching the locale '{language}'.
        For example:
        If locale is 'hi-IN', reply entirely in Hindi (Devanagari script).
        If locale is 'ta-IN', reply entirely in Tamil script.
        If locale is 'te-IN', reply entirely in Telugu script.
        If locale is 'kn-IN', reply entirely in Kannada script.

        Your response MUST be a valid JSON object matching the following structure exactly:
        {{
          "summary": "A clear, plain-language summary of the legal situation and advice translated to {language}.",
          "legal_basis": "The specific Indian laws, acts, or sections that apply.",
          "steps": ["Step 1", "Step 2", "Step 3"],
          "documents_required": ["Doc 1", "Doc 2"],
          "confidence_score": 0.95
        }}
        
        Do not include markdown formatting blocks backticks. Just output the raw JSON object.
        """
        
        prompt_parts = [system_instruction, f"User Query: {query}\n"]
        if pdf_bytes:
            prompt_parts.append({
                "mime_type": "application/pdf",
                "data": pdf_bytes
            })
            prompt_parts.append("\nPlease review the attached document and provide your legal analysis in the specified JSON format.")
        else:
            prompt_parts.append("\nPlease provide your legal analysis in the specified JSON format.")

        try:
            response = self.model.generate_content(
                prompt_parts,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            
            result_json = response.text
            return json.loads(result_json)
        except Exception as e:
            import traceback
            print(f"Error fetching chat from Gemini: {e}")
            traceback.print_exc()
            return self._fallback_response()
            
    def _fallback_response(self):
        return {
            "summary": "Based on the information provided, it seems you are facing a legal issue. Please consult with a legal professional for complete advice.",
            "legal_basis": "Applicable Indian Laws",
            "steps": ["Gather any physical or digital evidence.", "Consult a local attorney or visit the nearest legal aid camp."],
            "documents_required": ["Any relevant ID proof (Aadhar)", "Written summary of the incident"],
            "confidence_score": 0.5
        }

legal_chat_service = LegalChatService()
