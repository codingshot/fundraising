
import { CuratedSubmission } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchCuratedSubmissions(): Promise<CuratedSubmission[]> {
  try {
    console.log("Starting to fetch fundraising data from database");
    const { data, error } = await supabase
      .from('fundraising_data')
      .select('*')
      .order('date', { ascending: false }); 
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No data found in the database");
      return [];
    }
    
    console.log(`Found ${data.length} fundraises in the database`);
    console.log("Sample entries:", data.slice(0, 3).map(item => ({
      project: item.project_name,
      date: item.date,
      amount: item.amount,
      round: item.round_type
    })));
    
    // Transform to match CuratedSubmission type
    const transformedData = data.map(item => ({
      id: item.id,
      tweet_url: null,
      status: 'approved',
      created_at: item.created_at,
      tweet_data: {
        text: item.description,
        author_name: item.project_name,
      },
      tweetId: null,
      username: null,
      content: item.description,
      curatorNotes: `Round: ${item.round_type || 'Undisclosed'}\n` +
                    `Amount: $${item.amount ? item.amount.toLocaleString() : 'Undisclosed'}\n` +
                    `Lead: ${item.lead_investor || 'Undisclosed'}\n` +
                    `Investors: ${item.other_investors ? item.other_investors.join(', ') : 'Undisclosed'}`,
      userId: "system",
      curatorId: "system",
      curatorUsername: "CryptoFundraises",
      curatorTweetId: null,
      submittedAt: item.date,
      moderationHistory: [{
        tweetId: null,
        feedId: "cryptofundraises",
        adminId: "system",
        action: "approve",
        note: null,
        timestamp: item.created_at,
        moderationResponseTweetId: null
      }],
      moderationResponseTweetId: null,
      amount_raised: item.amount,
      round_type: item.round_type,
      lead_investor: item.lead_investor,
      investors: item.other_investors || [],
      Project: item.project_name,
      Round: item.round_type,
      Website: item.website,
      Date: item.date,
      Amount: item.amount,
      Description: item.description,
      Tags: [],
      slug: item.project_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));
    
    console.log("Data transformation completed");
    console.log(`Transformed ${transformedData.length} entries`);
    return transformedData;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}

export async function importCsvData() {
  try {
    const { data, error } = await supabase.functions.invoke('direct-import');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
