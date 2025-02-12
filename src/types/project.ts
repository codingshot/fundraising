
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
}
