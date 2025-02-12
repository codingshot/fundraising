
import { CuratedSubmission } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchCuratedSubmissions(): Promise<CuratedSubmission[]> {
  try {
    console.log("Starting to fetch processed fundraises from database");
    const { data, error } = await supabase
      .from('processed_fundraises')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    // Transform to match CuratedSubmission type
    const transformedData = data.map(item => ({
      id: item.id,
      tweet_url: item.twitter_url,
      status: 'approved',
      created_at: item.created_at,
      tweet_data: {
        text: item.description,
        author_username: item.announcement_username,
        author_name: item.announcement_username,
      },
      tweetId: item.original_submission_id,
      username: item.announcement_username,
      content: item.description,
      curatorNotes: `Raised: ${item.amount_raised ? `$${item.amount_raised.toLocaleString()}` : 'Undisclosed'}\n${
        item.investors?.length ? `Investors: ${item.investors.join(', ')}` : ''
      }${item.token ? `\nToken: ${item.token}` : ''}`,
    }));
    
    console.log("Transformed data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}
