
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
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch unprocessed entries
    const { data: unprocessedEntries, error: fetchError } = await supabase
      .from('processed_fundraises')
      .select('*')
      .eq('ai_processed', false)
      .lt('ai_processing_attempts', 3)
      .limit(10); // Process in batches

    if (fetchError) throw fetchError;

    console.log(`Found ${unprocessedEntries?.length || 0} unprocessed entries`);

    let processedCount = 0;
    let errorCount = 0;

    for (const entry of unprocessedEntries || []) {
      try {
        console.log(`Processing entry ${entry.id}`);

        const prompt = `${entry.description}\n${entry.curatorNotes || ''}`;

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
                content: `Extract fundraising details from the tweet. Return a JSON object with:
                - amount_raised (number or null): The fundraising amount in USD (convert to number, remove any $ or other currency symbols)
                - investors (array of strings): List of investors, empty array if none mentioned
                - token (string or null): Token symbol if mentioned
                - lead_investor (string or null): The lead investor if specified
                - round_type (string or null): The type of round (e.g., Seed, Series A, etc.)`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`OpenAI API error: ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const extractedInfo = JSON.parse(aiData.choices[0].message.content);

        // Clean amount_raised
        let amount_raised = null;
        if (extractedInfo.amount_raised) {
          const cleanedAmount = String(extractedInfo.amount_raised)
            .replace(/[^0-9.]/g, '')
            .replace(/\.(?=.*\.)/g, '');
          amount_raised = parseFloat(cleanedAmount) || null;
        }

        // Update database entry
        const { error: updateError } = await supabase
          .from('processed_fundraises')
          .update({
            amount_raised: amount_raised,
            investors: Array.isArray(extractedInfo.investors) ? extractedInfo.investors : [],
            token: extractedInfo.token,
            lead_investor: extractedInfo.lead_investor,
            round_type: extractedInfo.round_type,
            ai_processed: true,
            ai_processing_attempts: entry.ai_processing_attempts + 1
          })
          .eq('id', entry.id);

        if (updateError) throw updateError;

        processedCount++;
        console.log(`Successfully processed ${entry.id}`);
        
        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing entry ${entry.id}:`, error);
        // Update attempt count even if processing failed
        await supabase
          .from('processed_fundraises')
          .update({
            ai_processing_attempts: entry.ai_processing_attempts + 1
          })
          .eq('id', entry.id);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: `Processed ${processedCount} entries with ${errorCount} errors`,
        totalProcessed: processedCount,
        totalErrors: errorCount
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
