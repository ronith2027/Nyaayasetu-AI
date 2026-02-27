from typing import Dict, Any, List

class ComplaintService:
    def generate_complaint(self, data: Dict[str, Any]) -> Dict[str, Any]:
        complainant = data.get("complainant", {})
        opposite_party = data.get("oppositeParty", {})
        facts = data.get("facts", "")
        
        # Simple AI logic to identify sections
        sections = ["General Civil/Criminal Laws"]
        facts_lower = facts.lower()
        
        if any(kw in facts_lower for kw in ["defective", "refund", "service", "consumer", "product"]):
            sections = ["Consumer Protection Act, 2019", "Sale of Goods Act, 1930"]
        elif any(kw in facts_lower for kw in ["police", "fir", "assault", "theft"]):
            sections = ["Indian Penal Code (IPC)", "Code of Criminal Procedure (CrPC)"]
        elif any(kw in facts_lower for kw in ["tenant", "rent", "landlord", "eviction"]):
            sections = ["Rent Control Act", "Transfer of Property Act, 1882"]
        elif any(kw in facts_lower for kw in ["cyber", "online", "fraud", "hacker"]):
            sections = ["Information Technology Act, 2000"]

        complaint_text = f"""
BEFORE THE HONORABLE AUTHORITY / COMMISSION

IN THE MATTER OF:
{complainant.get('name', '________________')}
S/o, D/o, W/o: {complainant.get('fatherName', '________________')}
Residing at: {complainant.get('address', '________________')}
Email: {complainant.get('email', '________________')}
... COMPLAINANT

VERSUS

{opposite_party.get('name', '________________')}
Address: {opposite_party.get('address', '________________')}
... OPPOSITE PARTY / RESPONDENT

COMPLAINT UNDER {", ".join(sections)}

MOST RESPECTFULLY SHOWETH:

1. That the Complainant is a law-abiding citizen of India.
2. That the Opposite Party is {opposite_party.get('name', 'the respondent')} against whom this complaint is being filed.
3. FACTS OF THE CASE:
   {facts}

4. LEGAL GROUNDS:
   The actions of the Opposite Party are in direct violation of {", ".join(sections)}.

PRAYER:
It is, therefore, most respectfully prayed that this Honorable Authority may be pleased to:
a) Direct the Opposite Party to provide appropriate relief/compensation.
b) Award costs of the proceedings to the Complainant.
c) Pass any other order(s) as may be deemed fit in the interest of justice.

PLACE: ________________
DATE: ________________
(SIGNATURE)
        """.strip()

        return {
            "success": True,
            "data": {
                "complaint_text": complaint_text,
                "sections_referenced": sections,
                "download_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            },
            "error": None
        }

complaint_service = ComplaintService()
