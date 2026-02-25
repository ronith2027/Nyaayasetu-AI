
// Minimal API wrapper as per architecture requirements
// Minimal API wrapper as per architecture requirements
export const api = {
  post: async <T>(url: string, body: any): Promise<{ success: boolean, data: T | null, error: string | null }> => {
    try {
      // In a real app, this would use fetch or an apiClient
      console.log(`POST to ${url}`, body);

      // Provide valid mock data structures so array iterators (.map) don't crash
      if (url === '/schemes') {
        const mockData = [
          {
            scheme_name: "PM-Kisan Samman Nidhi",
            benefit: "₹6,000 per year in three installments",
            why_eligible: "Matched based on your occupation as Farmer.",
            documents_required: ["Aadhaar Card", "Land Papers"],
            apply_link: "https://pmkisan.gov.in/"
          },
          {
            scheme_name: "Ayushman Bharat (PM-JAY)",
            benefit: "₹5 Lakh health cover per family per year",
            why_eligible: "Matched based on your income profile.",
            documents_required: ["Aadhaar Card", "Ration Card"],
            apply_link: "https://pmjay.gov.in/"
          }
        ];
        return { success: true, data: mockData as unknown as T, error: null };
      }

      if (url === '/complaint') {
        const complaint_text = `BEFORE THE HONORABLE COURT/AUTHORITY\n\nIN THE MATTER OF:\n${body.complainant?.name || 'Unknown'}\n... COMPLAINANT\n\nVERSUS\n\n${body.oppositeParty?.name || 'Unknown'}\n... OPPOSITE PARTY\n\nFACTS OF THE CASE:\n${body.facts || 'Not provided.'}\n\nLEGAL GROUNDS:\n${body.legalGrounds || "Violations under relevant Indian Laws."}\n\nRELIEF SOUGHT:\n${body.relief || 'Not provided.'}\n\nDECLARATION:\n${body.declaration ? "Verified and declared true." : "Not verified."}`;

        return {
          success: true,
          data: { 
            complaint_text, 
            formattedDraft: complaint_text, // Add fallback for old UI compatibility
            sections_referenced: ["Consumer Protection Act, 2019"], 
            download_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
          } as unknown as T,
          error: null
        };
      }

      if (url === '/chat') {
        const query = (body.message || '').toLowerCase();
        
        // Match logic from backend/functions/chat/bedrockService.ts
        let responseData = {
          summary: "Based on the information provided, it seems you are facing a legal issue. Please consult with a legal professional for complete advice.",
          legal_basis: "Applicable Indian Laws",
          steps: ["Gather any physical or digital evidence.", "Consult a local attorney or visit the nearest legal aid camp."],
          documents_required: ["Any relevant ID proof (Aadhar)", "Written summary of the incident"],
          confidence_score: 0.7
        };

        if (query.includes('consumer') || query.includes('defective') || query.includes('refund')) {
          responseData = {
            summary: "If you have received a defective product or deficient service, you are protected as a consumer. You have the right to seek replacement, refund, or compensation.",
            legal_basis: "Consumer Protection Act, 2019",
            steps: ["Send a written legal notice to the seller/company.", "If unresolved, file a complaint on the National Consumer Helpline (NCH) app or website.", "If the amount is under ₹50 Lakhs, approach the District Consumer Dispute Redressal Commission."],
            documents_required: ["Original purchase bill/invoice", "Proof of payment", "Copy of warranty card", "Photos of defective product"],
            confidence_score: 0.95
          };
        } else if (query.includes('fir') || query.includes('police') || query.includes('crime')) {
          responseData = {
            summary: "You have the right to report a serious crime (cognizable offence) to the police. They must register your complaint as an FIR.",
            legal_basis: "Section 154 of the Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS)",
            steps: ["Visit the nearest police station.", "Provide a written complaint or orally narrate the incident to the officer.", "Demand a free copy of the FIR after it's registered.", "If police refuse, you can send the complaint via post to the Superintendent of Police (SP)."],
            documents_required: ["Written complaint signed by you", "Any photo/video evidence if available", "Aadhar card or ID proof"],
            confidence_score: 0.92
          };
        } else if (query.includes('threat') || query.includes('intimidation')) {
          responseData = {
            summary: "Threatening someone physically or mentally is a criminal offence. You do not have to tolerate criminal intimidation.",
            legal_basis: "Section 506 of the Indian Penal Code (IPC) / BNS equivalent",
            steps: ["Do not delete any evidence (messages, call recordings).", "Visit the nearest police station to report the intimidation.", "File a formal written complaint against the person threatening you."],
            documents_required: ["Screenshots of threatening messages", "Audio/Video recordings if any", "Witness statements (if anyone was present)"],
            confidence_score: 0.88
          };
        } else if (query.includes('wife') || query.includes('abuse') || query.includes('domestic')) {
          responseData = {
            summary: "Domestic violence is a serious crime. Women are protected against physical, mental, emotional, or economic abuse within a shared household.",
            legal_basis: "Protection of Women from Domestic Violence Act, 2005",
            steps: ["Reach out to the Women's Helpline (1091) or Emergency Police (112).", "Contact a Protection Officer in your district.", "File an application before the Magistrate for a protection or residence order."],
            documents_required: ["Medical reports if any injuries occurred", "Marriage certificate (if applicable)", "Any proof of shared household"],
            confidence_score: 0.94
          };
        } else if (query.includes('murder') || query.includes('bomb') || query.includes('terrorism')) {
          responseData = {
            summary: "This is a highly sensitive and severe criminal matter. We cannot provide complete legal advice on this. Please contact emergency services immediately.",
            legal_basis: "Indian Penal Code / Applicable Anti-Terror Laws",
            steps: ["Dial 112 immediately for emergency police assistance.", "Do not take the law into your own hands.", "Contact a qualified criminal defense lawyer."],
            documents_required: ["Not applicable at this stage"],
            confidence_score: 0.5
          };
        }

        return { success: true, data: responseData as unknown as T, error: null };
      }

      return { success: true, data: null, error: "Endpoint not specifically mocked." };
    } catch (err: any) {
      return { success: false, data: null, error: err.message };
    }
  }
};
