
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting direct import process...');
    
    // Call the database function
    const { error } = await supabase.rpc('import_fundraises_directly');
    
    if (error) {
      throw error;
    }

    // Get count of records to confirm import
    const { count, error: countError } = await supabase
      .from('processed_fundraises')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    console.log(`Import completed. Total records: ${count}`);

    return new Response(
      JSON.stringify({
        status: 'success',
        message: `Successfully imported fundraise data. Total records: ${count}`,
        count
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error during import:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message,
        details: error
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
