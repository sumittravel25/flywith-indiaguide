import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_) {
      payload = {};
    }

    const inputRows: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.rows)
      ? payload.rows
      : [];

    if (!inputRows.length) {
      return new Response(JSON.stringify({ error: 'No rows provided to import' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Normalize incoming rows to match DB columns
    const normalized = inputRows
      .map((r) => ({
        country_name: r.country_name ?? r.Country ?? r.country ?? '',
        official_languages: r.official_languages ?? r["Official Languages"] ?? '',
        currency: r.currency ?? r.Currency ?? '',
        visa_requirement: r.visa_requirement ?? r["Visa Requirement for Indians"] ?? r["Visa Status"] ?? '',
        embassy_presence: r.embassy_presence ?? r["Indian Embassy/High Commission Presence"] ?? r["Indian Embassy Present"] ?? '',
        flight_options: r.flight_options ?? r["Flight Options from India"] ?? r["Flight Connectivity from India"] ?? '',
      }))
      .filter((r) => r.country_name && typeof r.country_name === 'string');

    if (!normalized.length) {
      return new Response(JSON.stringify({ error: 'Parsed 0 valid rows' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Starting import of ${normalized.length} countries`);

    const { error } = await supabase
      .from('countries')
      .upsert(normalized, { onConflict: 'country_name' });

    if (error) {
      console.error('Error importing countries:', error);
      throw error;
    }

    console.log('Successfully imported countries');

    return new Response(
      JSON.stringify({ success: true, count: normalized.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in import-countries function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
