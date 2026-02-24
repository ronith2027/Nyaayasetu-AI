
export const handler = async (event: any) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { age, state, category, annualIncome, occupation } = body;

    // Mock data for schemes
    const mockSchemes = [
      {
        id: "SCH-001",
        name: "PM-Kisan Samman Nidhi",
        description: "Financial assistance to small and marginal farmers.",
        eligibility: "Land-holding farmers with cultivable land.",
        benefit: "₹6,000 per year in three installments.",
        criteria: (data: any) => data.occupation === 'farmer' && data.annualIncome < 200000
      },
      {
        id: "SCH-002",
        name: "Ayushman Bharat (PM-JAY)",
        description: "Health insurance for low-income families.",
        eligibility: "Families listed in SECC 2011 data.",
        benefit: "₹5 Lakh health cover per family per year.",
        criteria: (data: any) => data.annualIncome < 150000
      },
      {
        id: "SCH-003",
        name: "Sukanya Samriddhi Yojana",
        description: "Savings scheme for the girl child.",
        eligibility: "Parents of girl child below 10 years.",
        benefit: "High interest rate and tax benefits.",
        criteria: (data: any) => data.age < 10
      }
    ];

    const matchedSchemes = mockSchemes
      .filter(scheme => scheme.criteria(body))
      .map(({ criteria, ...rest }) => ({
        ...rest,
        reasoning: "Matched based on your income and occupation profiles."
      }));

    return {
      success: true,
      data: matchedSchemes,
      error: null
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err.message || "Internal Server Error"
    };
  }
};
