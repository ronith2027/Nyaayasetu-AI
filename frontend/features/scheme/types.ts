
export interface EligibilityData {
  age: number;
  state: string;
  category: string;
  annualIncome: number;
  occupation: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefit: string;
  reasoning: string;
}
