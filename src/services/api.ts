
import { CuratedSubmission } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchCuratedSubmissions(): Promise<CuratedSubmission[]> {
  try {
    console.log("Starting to fetch processed fundraises from database");
    const { data, error } = await supabase
      .from('processed_fundraises')
      .select('*')
      .order('Date', { ascending: false }); 
    
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
        created_at: item.created_at,
        tweet_data: {
          text: item.Description || item.description,
          author_username: item.announcement_username,
          author_name: item.Project || item.name,
        },
        tweetId: item.original_submission_id,
        username: item.announcement_username,
        content: item.Description || item.description,
        curatorNotes: `${item.Round ? `Round: ${item.Round}\n` : ''}${
          item.Amount ? `Amount: $${item.Amount.toLocaleString()}` : 'Amount: Undisclosed'
        }\n${
          item.Lead_Investors ? `Lead: ${item.Lead_Investors}\n` : ''
        }${
          item.Other_Investors?.length ? `Investors: ${item.Other_Investors.join(', ')}` : ''
        }${item.token ? `\nToken: ${item.token}` : ''}`,
        userId: "system",
        curatorId: "system",
        curatorUsername: "CryptoFundraises",
        curatorTweetId: item.original_submission_id,
        submittedAt: item.Date || item.created_at,
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
        amount_raised: item.Amount || item.amount_raised,
        round_type: item.Round || item.round_type,
        lead_investor: item.Lead_Investors || item.lead_investor,
        investors: item.Other_Investors || item.investors || [],
        Project: item.Project || item.name,
        Round: item.Round,
        Website: item.Website,
        Date: item.Date,
        Amount: item.Amount,
        Valuation: item.Valuation,
        Category: item.Category,
        Tags: item.Tags,
        Lead_Investors: item.Lead_Investors,
        Other_Investors: item.Other_Investors,
        Description: item.Description || item.description,
        Announcement_Link: item.Announcement_Link,
        Social_Links: item.Social_Links,
        slug: item.slug
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

export async function importCsvData() {
  try {
    const response = await fetch(
      'https://zryhlwfkovkxtqiwzhai.supabase.co/functions/v1/import-csv',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Import result:', result);
    return result;
  } catch (error) {
    console.error('Error importing CSV:', error);
    throw error;
  }
}
