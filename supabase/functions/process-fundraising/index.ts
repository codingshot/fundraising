import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Helper function to extract and normalize amount
function normalizeAmount(amount: string | number | null): number | null {
  if (!amount) return null;

  let amountStr = String(amount).toLowerCase();
  
  // Handle million/billion abbreviations
  if (amountStr.includes('m')) {
    amountStr = amountStr.replace(/m/g, '');
    const num = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
    return num ? num * 1000000 : null;
  }
  if (amountStr.includes('b')) {
    amountStr = amountStr.replace(/b/g, '');
    const num = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
    return num ? num * 1000000000 : null;
  }

  // Remove currency symbols and other non-numeric characters except dots
  amountStr = amountStr.replace(/[^0-9.]/g, '');
  
  // Handle multiple dots (keep only the first one)
  const parts = amountStr.split('.');
  if (parts.length > 2) {
    amountStr = parts[0] + '.' + parts.slice(1).join('');
  }

  const amount_num = parseFloat(amountStr);
  return isNaN(amount_num) ? null : amount_num;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { submission } = await req.json();

    // Check if this tweet is already processed
    const { data: existing } = await supabase
      .from('processed_fundraises')
      .select('id')
      .eq('original_submission_id', submission.tweetId)
      .single();

    if (existing) {
      console.log('Tweet already processed:', submission.tweetId);
      return new Response(JSON.stringify({ status: 'already_exists' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate AI summary
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Extract fundraising details from the tweet. Pay special attention to the amount raised - look for numbers with M, MM, million, B, billion, or USD indicators. Return a JSON object with:
            - amount_raised: string (preserve the exact amount as mentioned, including M/B indicators, e.g., "10M", "1.5B", "500K", etc. For ranges use the higher number)
            - investors: array of strings (list of all investors mentioned)
            - lead_investor: string (the lead investor if specified, null if not mentioned)
            - round_type: string (e.g., Seed, Series A, Pre-seed, etc., null if not mentioned)
            - token: string (token symbol if mentioned, null if not mentioned)
            - description: string (a clean description of the fundraising)
            
            Example outputs for amount_raised:
            "10M" for "$10M", "10 million", "10MM"
            "1.5B" for "$1.5B", "1.5 billion"
            "500K" for "$500K", "500,000"
            For ranges like "$8-10M" use "10M"`
          },
          {
            role: 'user',
            content: `Tweet: ${submission.content}\n${submission.curatorNotes ? `Curator Notes: ${submission.curatorNotes}` : ''}`
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent extraction
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    console.log('OpenAI Response:', aiData);

    let extractedInfo;
    try {
      extractedInfo = JSON.parse(aiData.choices[0].message.content);
      
      // Clean and validate amount_raised using the helper function
      if (extractedInfo.amount_raised) {
        const normalizedAmount = normalizeAmount(extractedInfo.amount_raised);
        extractedInfo.amount_raised = normalizedAmount;
        console.log('Normalized amount:', normalizedAmount);
      }

      // Ensure arrays are arrays
      extractedInfo.investors = Array.isArray(extractedInfo.investors) ? extractedInfo.investors : [];
      
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      extractedInfo = {
        amount_raised: null,
        investors: [],
        lead_investor: null,
        round_type: null,
        token: null,
        description: submission.content,
      };
    }

    // Insert into database
    const { data: insertedData, error } = await supabase
      .from('processed_fundraises')
      .insert({
        original_submission_id: submission.tweetId,
        description: extractedInfo.description,
        amount_raised: extractedInfo.amount_raised,
        investors: extractedInfo.investors,
        lead_investor: extractedInfo.lead_investor,
        round_type: extractedInfo.round_type,
        token: extractedInfo.token,
        announcement_username: submission.username,
        twitter_url: submission.tweet_url || `https://twitter.com/${submission.username}/status/${submission.tweetId}`,
        tweet_timestamp: submission.submittedAt,
        processed_at: new Date().toISOString(),
        ai_processed: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ status: 'success', data: insertedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
