
export interface CuratedSubmission {
  id?: string;
  tweet_url?: string;
  curator_notes?: string;
  status: string;
  created_at: string;
  tweet_data?: {
    text: string;
    author_username?: string;
    author_name?: string;
    author_profile_image_url?: string;
  };
  Project?: string;
  Round?: string;
  Website?: string;
  Date?: string;
  Amount?: number;
  Valuation?: number;
  Category?: string;
  Tags?: string[];
  Lead_Investors?: string;
  Other_Investors?: string[];
  Description?: string;
  Announcement_Link?: string;
  Social_Links?: string;
  amount_raised?: number;
  investors?: string[];
  token?: string;
  lead_investor?: string;
  round_type?: string;
  tweetId: string;
  userId: string;
  username: string;
  content: string;
  curatorNotes: string | null;
  curatorId: string;
  curatorUsername: string;
  curatorTweetId: string;
  submittedAt: string;
  moderationHistory: Array<{
    tweetId: string;
    feedId: string;
    adminId: string;
    action: string;
    note: string | null;
    timestamp: string;
    moderationResponseTweetId: string;
  }>;
  moderationResponseTweetId: string;
  slug?: string;
}
