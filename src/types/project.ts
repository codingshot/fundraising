
export interface CuratedSubmission {
  id: string;
  tweet_url: string;
  curator_notes?: string;
  status: string;
  created_at: string;
  tweet_data?: {
    text: string;
    author_username?: string;
    author_name?: string;
    author_profile_image_url?: string;
  };
}
