
// Minimal API wrapper as per architecture requirements
import { locatorHandler } from '../../backend/functions/locator/locatorHandler';
import { adminFlaggedHandler, adminReviewHandler } from '../../backend/functions/admin/adminHandler';

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

      if (url === '/locator') {
        const result = await locatorHandler(body);
        return result as unknown as { success: boolean, data: T | null, error: string | null };
      }

      if (url === '/admin/flagged') {
        const result = await adminFlaggedHandler();
        return result as unknown as { success: boolean, data: T | null, error: string | null };
      }

      if (url === '/admin/review') {
        const result = await adminReviewHandler(body);
        return result as unknown as { success: boolean, data: T | null, error: string | null };
      }

      return { success: true, data: null, error: "Endpoint not specifically mocked." };
    } catch (err: any) {
      return { success: false, data: null, error: err.message };
    }
  }
};
