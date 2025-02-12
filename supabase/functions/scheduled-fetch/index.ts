
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
    console.log("Starting scheduled fetch of submissions");
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
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    for (const submission of submissions) {
      // Check if we've already processed this submission
      const { data: existing } = await supabase
        .from('processed_fundraises')
        .select('id')
        .eq('original_submission_id', submission.tweetId)
        .single();

      if (existing) {
        console.log(`Submission ${submission.tweetId} already processed, skipping`);
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
      const { error: insertError } = await supabase
        .from('processed_fundraises')
        .insert({
          original_submission_id: submission.tweetId,
          name: submission.username,
          description: extractedInfo.description,
          amount_raised: extractedInfo.amount_raised,
          investors: extractedInfo.investors,
          token: extractedInfo.token,
          twitter_url: `https://twitter.com/${submission.username}/status/${submission.tweetId}`,
          announcement_username: submission.username,
        });

      if (insertError) {
        console.error('Error inserting processed fundraise:', insertError);
      }
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scheduled fetch:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
