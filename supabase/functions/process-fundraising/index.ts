
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
            content: `You are a precise fundraising data extractor. Extract fundraising details from tweets with these rules:

1. For amount_raised:
- Look for numbers followed by M, MM, million, B, billion, or USD
- Convert written numbers to digits (e.g., "ten million" -> "10M")
- For ranges, use the higher number
- Keep original formatting in response (e.g., "10M", "1.5B", "500K")
- Include the amount even if it's mentioned in a thread or quoted
- Examples:
  "$10M" or "10 million" -> "10M"
  "$1.5B" or "1.5 billion" -> "1.5B"
  "$500K" or "500,000" -> "500K"
  "8-10M" -> "10M"
  "raised ten million" -> "10M"

2. For investors:
- Extract ALL mentioned investors
- Remove @ symbols
- Include both lead and participating investors
- Clean up company names (e.g., "XYZ Capital", not "@XYZcap")

3. For lead_investor:
- Look for phrases like "led by", "spearheaded by", "led investment"
- Extract the main investing entity
- Return null if no clear lead is mentioned

4. For round_type:
- Look for specific phrases: Seed, Series A/B/C/D, Pre-seed, Strategic, Private, Public
- Include modifiers like "strategic" or "private"
- Default to null if unclear

Return a JSON object with these fields:
- amount_raised: string (formatted as above)
- investors: string[] (array of investor names)
- lead_investor: string|null
- round_type: string|null
- token: string|null (if a token/ticker is mentioned)
- description: string (clean description of fundraising)`
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
      } else {
        // Secondary check in description for amounts
        const description = extractedInfo.description.toLowerCase();
        const amountMatches = description.match(/(\d+(\.\d+)?)\s*(million|m|b|billion)/i);
        if (amountMatches) {
          const normalizedAmount = normalizeAmount(amountMatches[0]);
          extractedInfo.amount_raised = normalizedAmount;
          console.log('Found amount in description:', normalizedAmount);
        }
      }

      // Ensure arrays are arrays and remove @ symbols from investors
      extractedInfo.investors = Array.isArray(extractedInfo.investors) 
        ? extractedInfo.investors.map(inv => inv.replace(/^@/, ''))
        : [];
      
      // Clean up lead investor
      if (extractedInfo.lead_investor) {
        extractedInfo.lead_investor = extractedInfo.lead_investor.replace(/^@/, '');
      }
      
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
