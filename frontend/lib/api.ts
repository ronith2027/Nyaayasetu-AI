
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
            id: "SCH-001",
            name: "PM-Kisan Samman Nidhi",
            description: "Financial assistance to small and marginal farmers.",
            eligibility: "Land-holding farmers with cultivable land.",
            benefit: "₹6,000 per year in three installments.",
            reasoning: "Matched based on your income and occupation profiles."
          },
          {
            id: "SCH-002",
            name: "Ayushman Bharat (PM-JAY)",
            description: "Health insurance for low-income families.",
            eligibility: "Families listed in SECC 2011 data.",
            benefit: "₹5 Lakh health cover per family per year.",
            reasoning: "Matched based on your basic profiles."
          }
        ];
        // simple simulation filter
        const filtered = mockData.filter(s => {
          if (body.annualIncome && body.annualIncome > 500000) return false;
          return true;
        });

        return { success: true, data: filtered as unknown as T, error: null };
      }

      if (url === '/complaint') {
        const draftId = `CMP-${Math.floor(Math.random() * 1000000)}`;
        const formattedDraft = `BEFORE THE HONORABLE COURT/AUTHORITY\n\nIN THE MATTER OF:\n${body.complainant?.name || 'Unknown'}\n... COMPLAINANT\n\nVERSUS\n\n${body.oppositeParty?.name || 'Unknown'}\n... OPPOSITE PARTY\n\nFACTS OF THE CASE:\n${body.facts || 'Not provided.'}\n\nLEGAL GROUNDS:\n${body.legalGrounds || "Violations under relevant Indian Laws."}\n\nRELIEF SOUGHT:\n${body.relief || 'Not provided.'}\n\nDECLARATION:\n${body.declaration ? "Verified and declared true." : "Not verified."}`;

        return {
          success: true,
          data: { draftId, formattedDraft, timestamp: new Date().toISOString() } as unknown as T,
          error: null
        };
      }

      return { success: true, data: null, error: "Endpoint not specifically mocked." };
    } catch (err: any) {
      return { success: false, data: null, error: err.message };
    }
  }
};
