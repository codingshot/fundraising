
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { parse } from 'https://deno.land/std@0.181.0/csv/parse.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch CSV file from public URL
    const csvUrl = `${supabaseUrl}/storage/v1/object/public/public/cryptofundraises_cleaned.csv`;
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = parse(csvText, { skipFirstRow: true });
    console.log(`Parsed ${rows.length} rows from CSV`);

    let processedCount = 0;
    let errorCount = 0;

    // First, clear the temporary table
    await supabase.from('temp_fundraises').delete().neq('Project', 'DUMMY_VALUE');

    for (const row of rows) {
      try {
        const [
          Project,
          Round,
          Website,
          Date,
          Amount,
          Valuation,
          Category,
          Tags,
          Lead_Investors,
          Other_Investors,
          Description,
          Announcement_Link,
          Social_Links
        ] = row;

        // Convert Tags and Other_Investors from string to array
        const tagsArray = Tags ? Tags.split(',').map(t => t.trim()) : [];
        const otherInvestorsArray = Other_Investors ? Other_Investors.split(',').map(i => i.trim()) : [];

        // Insert into temporary table
        const { error: insertError } = await supabase
          .from('temp_fundraises')
          .insert([{
            Project,
            Round,
            Website,
            Date: Date ? new Date(Date).toISOString() : null,
            Amount: Amount ? parseFloat(Amount.replace(/[^0-9.-]+/g, "")) : null,
            Valuation: Valuation ? parseFloat(Valuation.replace(/[^0-9.-]+/g, "")) : null,
            Category,
            Tags: tagsArray,
            Lead_Investors,
            Other_Investors: otherInvestorsArray,
            Description,
            Announcement_Link,
            Social_Links
          }]);

        if (insertError) throw insertError;
        processedCount++;

      } catch (error) {
        console.error('Error processing row:', error);
        errorCount++;
      }
    }

    // After all rows are inserted into temp table, run the migration function
    const { error: migrationError } = await supabase.rpc('migrate_fundraises');
    
    if (migrationError) {
      throw new Error(`Migration failed: ${migrationError.message}`);
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        processed: processedCount,
        errors: errorCount,
        message: 'Data imported and migrated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
