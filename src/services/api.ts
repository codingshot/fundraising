
import { CuratedSubmission } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchCuratedSubmissions(): Promise<CuratedSubmission[]> {
  try {
    console.log("Starting to fetch processed fundraises from database");
    const { data, error } = await supabase
      .from('processed_fundraises')
      .select('*')
      .order('tweet_timestamp', { ascending: false });
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    // Transform to match CuratedSubmission type
    const transformedData = data.map(item => ({
      id: item.id,
      tweet_url: item.twitter_url,
      status: 'approved',
      created_at: item.tweet_timestamp || item.created_at,
      tweet_data: {
        text: item.description,
        author_username: item.announcement_username,
        author_name: item.announcement_username,
      },
      tweetId: item.original_submission_id,
      username: item.announcement_username,
      content: item.description,
      curatorNotes: `${item.round_type ? `Round: ${item.round_type}\n` : ''}${
        item.amount_raised ? `Raised: $${item.amount_raised.toLocaleString()}` : 'Amount: Undisclosed'
      }\n${
        item.lead_investor ? `Lead: ${item.lead_investor}\n` : ''
      }${
        item.investors?.length ? `Investors: ${item.investors.join(', ')}` : ''
      }${item.token ? `\nToken: ${item.token}` : ''}`,
      // Required fields for CuratedSubmission type
      userId: "system",
      curatorId: "system",
      curatorUsername: "CryptoFundraises",
      curatorTweetId: item.original_submission_id,
      submittedAt: item.tweet_timestamp || item.created_at,
      moderationHistory: [{
        tweetId: item.original_submission_id,
        feedId: "cryptofundraises",
        adminId: "system",
        action: "approve",
        note: null,
        timestamp: item.processed_at,
        moderationResponseTweetId: item.original_submission_id
      }],
      moderationResponseTweetId: item.original_submission_id
    }));
    
    console.log("Transformed data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}
