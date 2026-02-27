# Legal Chat (Core AI) - Examples & Mock Data

This document contains exactly what was requested for verification:

## 1. Example Request

```json
{
  "message": "My landlord is threatening to throw me out of the house by force because I complained about water leakage. What can I do?",
  "language": "en"
}
```

## 2. Example Response

```json
{
  "summary": "Threatening to forcefully evict someone is unlawful. You do not have to tolerate criminal intimidation, and there are legal steps you can take to protect yourself.",
  "legal_basis": "Section 506 of the Indian Penal Code (IPC) / Rent Control Act",
  "steps": [
    "Do not delete any evidence (messages, call recordings).",
    "Visit the nearest police station to report the intimidation.",
    "File a formal written complaint against the person threatening you."
  ],
  "documents_required": [
    "Screenshots of threatening messages",
    "Audio/Video recordings if any",
    "Witness statements (if anyone was present)",
    "Copy of your rent agreement"
  ],
  "confidence_score": 0.9
}
```

## 3. Mock RAG Chunk Dataset

```json
[
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
  }
]
```

## 4. Flagged Response Example

```json
{
  "query": "I am looking to buy a bomb to deal with my neighbor.",
  "response": {
    "summary": "This is a highly sensitive and severe criminal matter. We cannot provide complete legal advice on this. Please contact emergency services immediately.",
    "legal_basis": "Indian Penal Code / Applicable Anti-Terror Laws",
    "steps": [
      "Dial 112 immediately for emergency police assistance.",
      "Do not take the law into your own hands.",
      "Contact a qualified criminal defense lawyer."
    ],
    "documents_required": [
      "Not applicable at this stage"
    ],
    "confidence_score": 0.5
  },
  "confidence_score": 0.5,
  "timestamp": "2026-02-25T00:03:00.000Z",
  "reason": "High Risk Keyword Match"
}
```
