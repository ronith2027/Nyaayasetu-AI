# Design Specification: NyayaSetu AI

## 1. Introduction

### 1.1 Purpose

NyayaSetu AI is designed to empower Indian citizens—particularly those in rural areas or with low literacy—by providing simplified access to legal rights and government welfare schemes. It converts complex jargon into conversational, multilingual guidance.

### 1.2 Scope

The system covers legal guidance (FIRs, land disputes, women's rights), AI-powered legal drafting, dispute mediation, and a comprehensive discovery engine for Central and State government schemes (e.g., PM Kisan, Ayushman Bharat).

### 1.3 Target Audience

* **Primary:** Rural citizens, farmers, women, and senior citizens.
* **Secondary:** First-time legal aid seekers and students.

---

## 2. System Architecture

### 2.1 Design Goals

* **Accessibility:** Voice-first interaction and support for regional Indian languages.
* **Simplicity:** Plain-language explanations without legal intimidation.
* **Trust:** Neutral, unbiased, and empathetic AI-driven mediation and guidance.
* **Accuracy:** RAG (Retrieval-Augmented Generation) based on the Indian Penal Code (IPC) and official scheme databases.

### 2.2 Architecture Pattern

The system follows a **Modular AI Service Architecture** to allow independent scaling of legal logic and welfare data.

### 2.3 Functional Modules

| Module | Responsibility |
| --- | --- |
| **Legal Guidance** | Explains rights and procedures (FIRs, Consumer Court) in plain language. |
| **AI Drafting** | Generates structured police complaints, legal notices, and grievance letters. |
| **Case Intelligence** | Summarizes judgments and explains court timelines. |
| **AI Mediation** | Facilitates neutral negotiation for family or small financial disputes. |
| **Welfare Assistance** | Profile-based discovery and eligibility checking for government schemes. |

---

## 3. Detailed Design

### 3.1 Knowledge Retrieval (RAG)

To ensure accuracy, the AI does not "hallucinate" law. It retrieves context from:

* **Legal Core:** Indian Penal Code (IPC) and state-specific amendments.
* **Govt Database:** Real-time data on schemes like MGNREGA, PM Awas Yojana, etc.
* **Precedents:** Simplified summaries of landmark court judgments.

### 3.2 User Interaction Flow

1. **Language Detection:** Identify the regional dialect/language (Text or Voice).
2. **Context Retrieval:** Fetch relevant legal or scheme data based on the query.
3. **Reasoned Analysis:** Process the query through the "Citizen-First" filter (removing jargon).
4. **Actionable Output:** Provide a step-by-step guide, a draft document, or a list of required documents for a scheme.

---

## 4. Technical Stack

* **LLM Core:** High-reasoning model (like Gemini) optimized for Indian languages.
* **Voice Processing:** Speech-to-Text (STT) and Text-to-Speech (TTS) for regional dialects.
* **Vector Database:** For storing and retrieving IPC sections and scheme eligibility rules.
* **Frontend:** Lightweight mobile-first web app or WhatsApp/Telegram bot integration for low-bandwidth areas.

---

## 5. Ethics & Constraints

* **Non-Binding:** All outputs are informational; the system explicitly states it is not a replacement for a licensed lawyer.
* **Privacy:** Strict data handling to protect sensitive legal or financial details of the user.
* **Neutrality:** No political persuasion or bias in mediation or scheme recommendations.

---

## 6. Mission Statement

> To bridge the gap between law, government, and citizens by turning complex systems into simple conversations, ensuring justice and welfare reach every Indian.

