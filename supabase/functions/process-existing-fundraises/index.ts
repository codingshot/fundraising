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
        const prompt = `${entry.description || ''}\n${entry.curator_notes || ''}`;
        console.log(`Processing entry ${entry.id} with prompt: ${prompt}`);

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
                content: `Extract fundraising details from the tweet. Pay special attention to the amount raised - look for numbers with M, MM, million, B, billion, or USD indicators. Return a JSON object with:
                - amount_raised: string (preserve the exact amount as mentioned, including M/B indicators, e.g., "10M", "1.5B", "500K", etc. For ranges use the higher number)
                - investors: array of strings (list of all investors mentioned)
                - lead_investor: string (the lead investor if specified, null if not mentioned)
                - round_type: string (e.g., Seed, Series A, Pre-seed, etc., null if not mentioned)
                - token: string (token symbol if mentioned, null if not mentioned)
                
                Example outputs for amount_raised:
                "10M" for "$10M", "10 million", "10MM"
                "1.5B" for "$1.5B", "1.5 billion"
                "500K" for "$500K", "500,000"
                For ranges like "$8-10M" use "10M"`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1, // Lower temperature for more consistent extraction
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`OpenAI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        console.log('OpenAI response:', aiData);

        let extractedInfo;
        try {
          extractedInfo = JSON.parse(aiData.choices[0].message.content);

          // Clean amount_raised using the helper function
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
            token: null
          };
        }

        // Update database entry
        const { error: updateError } = await supabase
          .from('processed_fundraises')
          .update({
            amount_raised: extractedInfo.amount_raised,
            investors: extractedInfo.investors,
            lead_investor: extractedInfo.lead_investor,
            round_type: extractedInfo.round_type,
            token: extractedInfo.token,
            ai_processed: true,
            ai_processing_attempts: entry.ai_processing_attempts + 1,
            processed_at: new Date().toISOString()
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
