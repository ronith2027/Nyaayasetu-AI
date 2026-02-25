// Simulated Bedrock LLM Service for Legal Chat
// Using strict system prompt and JSON enforcement

export const generateLegalResponse = async (query: string, contextChunks: any[]) => {
    const contextString = contextChunks.map((c, i) => `[${i + 1}] ${c.source}: ${c.content}`).join('\n');

    const systemPrompt = `
You are NyayaSetu AI, a legal assistant for Indian citizens.
Rules:
Explain in simple language.
If unsure, say you are not fully certain.
Never fabricate sections of law.
Structure output EXACTLY in this JSON format:
{
  "summary": "...",
  "legal_basis": "...",
  "steps": ["..."],
  "documents_required": ["..."]
}

Guidelines:
summary: Explain issue in plain Hindi-friendly English
legal_basis: Mention relevant Act/Section
steps: Clear actionable steps
documents_required: Realistic required documents
Do not include extra keys.
`;

    const userPrompt = `Query: ${query}\n\nRelevant Law/Context:\n${contextString}`;

    // Simulate Bedrock API Call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Dummy response logic based on whether we provided good context
    const bestScore = Math.max(...contextChunks.map(c => c.score || 0));

    // Return different simulated outputs based on query/context matching
    let responseObj = {
        summary: "Based on the information provided, it seems you are facing a legal issue. Please consult with a legal professional for complete advice.",
        legal_basis: "Applicable Indian Laws",
        steps: ["Gather any physical or digital evidence.", "Consult a local attorney or visit the nearest legal aid camp."],
        documents_required: ["Any relevant ID proof (Aadhar)", "Written summary of the incident"]
    };

    const lowerQuery = query.toLowerCase();

    if (bestScore > 0.8) {
        if (lowerQuery.includes('consumer') || lowerQuery.includes('defective')) {
            responseObj = {
                summary: "If you have received a defective product or deficient service, you are protected as a consumer. You have the right to seek replacement, refund, or compensation.",
                legal_basis: "Consumer Protection Act, 2019",
                steps: ["Send a written legal notice to the seller/company.", "If unresolved, file a complaint on the National Consumer Helpline (NCH) app or website.", "If the amount is under ₹50 Lakhs, approach the District Consumer Dispute Redressal Commission."],
                documents_required: ["Original purchase bill/invoice", "Proof of payment", "Copy of warranty card", "Photos of defective product"]
            };
        } else if (lowerQuery.includes('fir') || lowerQuery.includes('police')) {
            responseObj = {
                summary: "You have the right to report a serious crime (cognizable offence) to the police. They must register your complaint as an FIR.",
                legal_basis: "Section 154 of the Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS)",
                steps: ["Visit the nearest police station.", "Provide a written complaint or orally narrate the incident to the officer.", "Demand a free copy of the FIR after it's registered.", "If police refuse, you can send the complaint via post to the Superintendent of Police (SP)."],
                documents_required: ["Written complaint signed by you", "Any photo/video evidence if available", "Aadhar card or ID proof"]
            };
        } else if (lowerQuery.includes('threat')) {
            responseObj = {
                summary: "Threatening someone physically or mentally is a criminal offence. You do not have to tolerate criminal intimidation.",
                legal_basis: "Section 506 of the Indian Penal Code (IPC) / BNS equivalent",
                steps: ["Do not delete any evidence (messages, call recordings).", "Visit the nearest police station to report the intimidation.", "File a formal written complaint against the person threatening you."],
                documents_required: ["Screenshots of threatening messages", "Audio/Video recordings if any", "Witness statements (if anyone was present)"]
            };
        } else if (lowerQuery.includes('wife') || lowerQuery.includes('abuse')) {
            responseObj = {
                summary: "Domestic violence is a serious crime. Women are protected against physical, mental, emotional, or economic abuse within a shared household.",
                legal_basis: "Protection of Women from Domestic Violence Act, 2005",
                steps: ["Reach out to the Women's Helpline (1091) or Emergency Police (112).", "Contact a Protection Officer in your district.", "File an application before the Magistrate for a protection or residence order."],
                documents_required: ["Medical reports if any injuries occurred", "Marriage certificate (if applicable)", "Any proof of shared household"]
            };
        }
    } else if (lowerQuery.includes('murder') || lowerQuery.includes('bomb') || lowerQuery.includes('terrorism')) {
        // High-risk response
        responseObj = {
            summary: "This is a highly sensitive and severe criminal matter. We cannot provide complete legal advice on this. Please contact emergency services immediately.",
            legal_basis: "Indian Penal Code / Applicable Anti-Terror Laws",
            steps: ["Dial 112 immediately for emergency police assistance.", "Do not take the law into your own hands.", "Contact a qualified criminal defense lawyer."],
            documents_required: ["Not applicable at this stage"]
        };
    }

    return responseObj;
};
