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

    const homeCountry = payload.homeCountry || "India";
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
        home_country: homeCountry,
        destination_country: r.country_name ?? r.Country ?? r.country ?? '',
        capital_city: r.capital_city ?? r["Capital City"] ?? '',
        official_languages: r.official_languages ?? r["Official Languages"] ?? '',
        currency: r.currency ?? r.Currency ?? '',
        time_difference: r.time_difference ?? r["Time Difference from IST"] ?? '',
        popular_destinations: r.popular_destinations ?? r["Popular Destinations"] ?? '',
        major_airports: r.major_airports ?? r["Major International Airport(s)"] ?? '',
        visa_portal_link: r.visa_portal_link ?? r["Actual Visa Application Link/Portal (for Indian Citizens)"] ?? '',
        visa_requirement: r.visa_requirement ?? r["Visa Requirement"] ?? r["Visa Requirement for Indians"] ?? r["Visa Status"] ?? '',
        embassy_info: r.indian_embassy ?? r["Indian Embassy"] ?? r["Indian Embassy/High Commission"] ?? r["Indian Embassy/High Commission Presence"] ?? '',
        flight_options: r.flight_options ?? r["Flight Options"] ?? r["Flight Options from India"] ?? r["Flight Connectivity from India"] ?? '',
      }))
      .filter((r) => r.destination_country && typeof r.destination_country === 'string');

    if (!normalized.length) {
      return new Response(JSON.stringify({ error: 'Parsed 0 valid rows' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Starting import of ${normalized.length} countries`);

    const { error } = await supabase
      .from('travel_information')
      .upsert(normalized, { onConflict: 'home_country,destination_country' });

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
