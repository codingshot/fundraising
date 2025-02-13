
import { CuratedSubmission } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchCuratedSubmissions(): Promise<CuratedSubmission[]> {
  try {
    console.log("Starting to fetch processed fundraises from database");
    const { data, error } = await supabase
      .from('processed_fundraises')
      .select('*')
      .order('tweet_timestamp', { ascending: false })
      .limit(100); // Limit to most recent 100 entries
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No data found in the database");
      return [];
    }
    
    console.log("Raw data from database:", data);
    
    // Transform to match CuratedSubmission type
    const transformedData = data.map(item => {
      console.log("Processing item:", item);
      return {
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
        moderationResponseTweetId: item.original_submission_id,
        amount_raised: item.amount_raised,
        round_type: item.round_type,
        lead_investor: item.lead_investor,
        investors: item.investors
      };
    });
    
    console.log("Transformed data length:", transformedData.length);
    console.log("First transformed item:", transformedData[0]);
    return transformedData;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}
