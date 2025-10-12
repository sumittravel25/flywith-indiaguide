import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currencyCode } = await req.json();
    const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');

    if (!apiKey) {
      throw new Error('EXCHANGE_RATE_API_KEY is not configured');
    }

    console.log(`Fetching exchange rates for: ${currencyCode}`);

    // Fetch latest rates using exchangerate-api.com
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currencyCode}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Exchange rate API error:', response.status, errorText);
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data = await response.json();
    console.log('Exchange rate response:', data);

    if (data.result !== 'success') {
      console.error('API returned error:', data);
      throw new Error(data['error-type'] || 'Failed to fetch exchange rates');
    }

    // Extract only the currencies we need
    const filteredRates = {
      INR: data.conversion_rates.INR,
      USD: data.conversion_rates.USD,
      EUR: data.conversion_rates.EUR,
      GBP: data.conversion_rates.GBP,
    };

    return new Response(
      JSON.stringify({ rates: filteredRates, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in get-exchange-rates function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
