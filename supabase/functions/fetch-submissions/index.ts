
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Edge function: Starting to fetch submissions");
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

    const data = await response.json();
    console.log("Edge function: Successfully fetched data", data);
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Process new submissions
    for (const submission of data) {
      await fetch(`${supabaseUrl}/functions/v1/process-fundraising`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submission }),
      });
    }

    // Transform curator notes to include clickable X.com links
    const transformedData = data.map((item: any) => {
      let notesWithLinks = item.curatorNotes;
      if (notesWithLinks) {
        const mentions = notesWithLinks.match(/@(\w+)/g) || [];
        mentions.forEach((mention: string) => {
          const username = mention.substring(1);
          notesWithLinks = notesWithLinks.replace(
            mention,
            `<a href="https://x.com/${username}" target="_blank" rel="noopener noreferrer">${mention}</a>`
          );
        });
      }

      return {
        ...item,
        tweet_url: `https://twitter.com/${item.username}/status/${item.tweetId}`,
        tweet_data: {
          text: item.content,
          author_username: item.username,
          author_name: item.username,
        },
        curator_notes: notesWithLinks,
        created_at: item.createdAt
      };
    });
    
    return new Response(JSON.stringify(transformedData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});
