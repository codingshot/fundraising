
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting manual fetch and import");
    
    // Initialize Supabase client
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all submissions from the API
    const response = await fetch(
      'https://curatedotfun-floral-sun-1539.fly.dev/api/submissions/cryptofundraise?status=approved',
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const submissions = await response.json();
    console.log(`Fetched ${submissions.length} submissions`);

    for (const submission of submissions) {
      try {
        // Skip if already exists
        const { data: existing } = await supabase
          .from('processed_fundraises')
          .select('id')
          .eq('original_submission_id', submission.tweetId)
          .maybeSingle();

        if (existing) {
          console.log(`Skipping ${submission.tweetId} - already exists`);
          continue;
        }

        // Process with OpenAI
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `Extract fundraising details from the tweet. Return a JSON object with:
                - amount_raised (number or null): The fundraising amount in USD (convert to number, remove any $ or other currency symbols)
                - investors (array of strings): List of investors, empty array if none mentioned
                - description (string): A clean description of the fundraising
                - token (string or null): Token symbol if mentioned
                - lead_investor (string or null): The lead investor if specified
                - round_type (string or null): The type of round (e.g., Seed, Series A, etc.)`
              },
              {
                role: 'user',
                content: `${submission.content}\n${submission.curatorNotes || ''}`
              }
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (!aiResponse.ok) {
          console.error(`OpenAI API error for ${submission.tweetId}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        console.log(`OpenAI processed ${submission.tweetId}:`, aiData);

        const extractedInfo = JSON.parse(aiData.choices[0].message.content);
        
        // Clean amount_raised
        let amount_raised = null;
        if (extractedInfo.amount_raised) {
          const cleanedAmount = String(extractedInfo.amount_raised)
            .replace(/[^0-9.]/g, '')
            .replace(/\.(?=.*\.)/g, ''); // Remove all but last decimal point
          const numericAmount = parseFloat(cleanedAmount);
          amount_raised = !isNaN(numericAmount) ? numericAmount : null;
        }

        // Insert into database
        const { error: insertError } = await supabase
          .from('processed_fundraises')
          .insert({
            original_submission_id: submission.tweetId,
            name: submission.username,
            description: extractedInfo.description || submission.content,
            amount_raised: amount_raised,
            investors: Array.isArray(extractedInfo.investors) ? extractedInfo.investors : [],
            token: extractedInfo.token,
            lead_investor: extractedInfo.lead_investor,
            round_type: extractedInfo.round_type,
            twitter_url: `https://twitter.com/${submission.username}/status/${submission.tweetId}`,
            announcement_username: submission.username,
            tweet_timestamp: new Date(submission.submittedAt).toISOString(),
            processed_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Insert error for ${submission.tweetId}:`, insertError);
          continue;
        }

        console.log(`Successfully imported ${submission.tweetId}`);
        
        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing submission ${submission.tweetId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: `Processed ${submissions.length} submissions`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
