
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { submission } = await req.json();

    // Check if this tweet is already processed
    const { data: existing } = await supabase
      .from('crypto_fundraising')
      .select('id')
      .eq('associated_tweet_id', submission.tweetId)
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
            content: 'Extract fundraising details from the tweet. Return a JSON object with: amount_raised (number), investors (array of strings), description (string), and token (string if mentioned).'
          },
          {
            role: 'user',
            content: submission.content + (submission.curatorNotes ? `\nCurator Notes: ${submission.curatorNotes}` : '')
          }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const extractedInfo = JSON.parse(aiData.choices[0].message.content);

    // Insert into database
    const { data: insertedData, error } = await supabase
      .from('crypto_fundraising')
      .insert({
        name: submission.username,
        description: extractedInfo.description,
        funding: { amount: extractedInfo.amount_raised, investors: extractedInfo.investors },
        token: extractedInfo.token,
        associated_tweet_id: submission.tweetId,
        announcement_username: submission.username,
        tweet_url: `https://twitter.com/${submission.username}/status/${submission.tweetId}`,
        ai_generated_summary: aiData.choices[0].message.content,
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
