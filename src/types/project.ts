
export interface Investor {
  name: string;
  logo?: string;
  website?: string;
  twitter?: string;
}

export interface FundingRound {
  date: string;
  investors: Investor[];
  round_type: string;
  raised_amount: number;
  valuation?: number;
}

export interface Project {
  id: string;
  name: string;
  token?: string;
  logo?: string;
  description: string;
  categories: string[];
  website?: string;
  twitter?: string;
  funding?: FundingRound;
}
