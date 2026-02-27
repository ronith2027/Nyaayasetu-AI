import os
import json
import google.generativeai as genai
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class SchemeService:
    def __init__(self):
        # We'll use the Gemini 2.5 Flash model for fast responses
        try:
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception as e:
            print(f"Warning: Failed to initialize Gemini model: {e}")
            self.model = None

    def get_matched_schemes(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.model:
            return []
            
        system_instruction = """
        You are an AI assistant for NyayaSetu that recommends Indian government schemes to citizens based on their profile.
        Given the user profile data, identify 2-4 highly relevant government welfare schemes, subsidies, or programs they are eligible for.
        
        You must respond with a JSON array where each object has the following keys exactly:
        - "id": A unique string ID (e.g., "SCH-101")
        - "name": Official name of the scheme
        - "description": A concise description of the scheme
        - "eligibility": The core eligibility criteria
        - "benefit": The main financial or material benefit provided
        - "reasoning": Why this scheme was matched based on their specific profile data
        
        Output valid JSON only without markdown formatting blocks.
        """
        
        prompt = f"""
        User Profile:
        Age: {data.get("age")}
        State: {data.get("state")}
        Category: {data.get("category")}
        Annual Income (INR): {data.get("annualIncome")}
        Occupation: {data.get("occupation")}
        Gender: {data.get("gender", "Not specified")}
        """
        
        try:
            response = self.model.generate_content(
                system_instruction + "\n" + prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            
            result_json = response.text
            schemes = json.loads(result_json)
            
            if not isinstance(schemes, list):
                if isinstance(schemes, dict) and "schemes" in schemes:
                    schemes = schemes["schemes"]
                else:
                    schemes = [schemes]
                    
            return schemes
        except Exception as e:
            print(f"Error fetching schemes from Gemini: {e}")
            return []

scheme_service = SchemeService()
