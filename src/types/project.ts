
export interface Project {
  id: string;
  name: string;
  token?: string;
  logo?: string;
  description: string;
  categories: string[];
  website?: string;
  twitter?: string;
  funding?: {
    date: string;
    round_type: string;
    raised_amount: number;
  };
  tweet_url?: string;
}

interface FundingData {
  date: string;
  round_type: string;
  raised_amount: number;
}
