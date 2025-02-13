
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

    console.log('Starting CSV import process...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First clear the temporary table using TRUNCATE via RPC
    console.log('Clearing temporary table...');
    const { error: clearError } = await supabase.rpc('truncate_temp_fundraises');

    if (clearError) {
      throw new Error(`Failed to clear temporary table: ${clearError.message}`);
    }

    // First check if the file exists in storage
    console.log('Checking if CSV file exists...');
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('public')
      .list('', {
        limit: 100,
        search: 'cryptofundraises_cleaned.csv'
      });

    if (fileError) {
      throw new Error(`Failed to check for CSV file: ${fileError.message}`);
    }

    if (!fileData || !fileData.length) {
      throw new Error('CSV file not found in storage bucket');
    }

    // Fetch CSV file from public URL
    console.log('Fetching CSV file...');
    const csvUrl = `${supabaseUrl}/storage/v1/object/public/public/cryptofundraises_cleaned.csv`;
    console.log('CSV URL:', csvUrl);
    
    const response = await fetch(csvUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch CSV:', {
        status: response.status,
        statusText: response.statusText,
        url: csvUrl
      });
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log('CSV content preview:', csvText.substring(0, 200));
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file is empty');
    }

    const rows = parse(csvText, { skipFirstRow: true });
    console.log(`Parsed ${rows.length} rows from CSV`);

    let processedCount = 0;
    let errorCount = 0;

    // Process rows in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const batchData = batch.map(row => {
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

        // Generate a predictable slug from Project name and date
        const date = new Date(Date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const baseSlug = (Project || 'unknown-project')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const slug = `${baseSlug}-${yearMonth}`;

        return {
          Project,
          Round,
          Website,
          Date: Date ? new Date(Date).toISOString() : null,
          Amount: Amount ? parseFloat(Amount.replace(/[^0-9.-]+/g, "")) : null,
          Valuation: Valuation ? parseFloat(Valuation.replace(/[^0-9.-]+/g, "")) : null,
          Category,
          Tags: Tags ? Tags.split(',').map(t => t.trim()) : [],
          Lead_Investors,
          Other_Investors: Other_Investors ? Other_Investors.split(',').map(i => i.trim()) : [],
          Description,
          Announcement_Link,
          Social_Links,
          slug
        };
      });

      console.log(`Processing batch of ${batch.length} records...`);
      const { error: insertError } = await supabase
        .from('temp_fundraises')
        .insert(batchData);

      if (insertError) {
        console.error('Error processing batch:', insertError);
        errorCount += batch.length;
      } else {
        processedCount += batch.length;
        console.log(`Processed ${processedCount} rows so far`);
      }
    }

    // After all data is in temp table, run the migration function
    console.log('Running migration function...');
    const { error: migrationError } = await supabase.rpc('migrate_fundraises');
    
    if (migrationError) {
      throw new Error(`Migration failed: ${migrationError.message}`);
    }

    // Get the total count of records in processed_fundraises
    console.log('Getting final record count...');
    const { count, error: countError } = await supabase
      .from('processed_fundraises')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Failed to get count: ${countError.message}`);
    }

    const result = {
      status: 'success',
      processed: processedCount,
      errors: errorCount,
      total_records: count,
      message: `Successfully imported ${processedCount} records. Total records in database: ${count}`
    };

    console.log('Import completed:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: error.message,
        stack: error.stack,
        details: {
          supabaseUrl: Deno.env.get('SUPABASE_URL'),
          hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
