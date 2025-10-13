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

    const symbols = ['INR', 'USD', 'EUR', 'GBP'];
    const symbolList = symbols.join(',');

    type Rates = { INR: number; USD: number; EUR: number; GBP: number };

    const providers: Array<{
      name: string;
      url: string;
      parse: (res: Response) => Promise<Rates>;
    }> = [
      {
        name: 'exchangerate-api.com',
        url: `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currencyCode}`,
        parse: async (res: Response) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          console.log('Exchange rate response (exchangerate-api):', data);
          if (data.result !== 'success') throw new Error(data['error-type'] || 'exchangerate-api failed');
          return {
            INR: data.conversion_rates?.INR,
            USD: data.conversion_rates?.USD,
            EUR: data.conversion_rates?.EUR,
            GBP: data.conversion_rates?.GBP,
          } as Rates;
        },
      },
      {
        name: 'exchangerate.host',
        // Support both formats: some deployments require access_key, others accept no key. We include it if present.
        url: `https://api.exchangerate.host/latest?base=${currencyCode}&symbols=${symbolList},${currencyCode}&access_key=${apiKey}`,
        parse: async (res: Response) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          console.log('Exchange rate response (exchangerate.host):', data);
          if (data.success === false && data.error) throw new Error(data.error?.info || 'exchangerate.host failed');
          const rates = data.rates;
          if (!rates) throw new Error('No rates field');
          return {
            INR: rates.INR,
            USD: rates.USD,
            EUR: rates.EUR,
            GBP: rates.GBP,
          } as Rates;
        },
      },
      {
        name: 'exchangeratesapi.io (apilayer)',
        url: `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&base=${currencyCode}&symbols=${symbolList},${currencyCode}`,
        parse: async (res: Response) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          console.log('Exchange rate response (exchangeratesapi.io):', data);
          if (data.success === false) {
            if (data.error?.type === 'base_currency_access_restricted') {
              // Free plans often lock base=EUR. Fetch EUR base and compute derived rates.
              const res2 = await fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=${symbolList},${currencyCode}`);
              if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
              const data2 = await res2.json();
              console.log('Fallback response (exchangeratesapi.io EUR base):', data2);
              if (data2.success === false) throw new Error(data2.error?.info || 'exchangeratesapi.io failed');
              const baseRates = data2.rates;
              const rateOfCurrencyCode = baseRates[currencyCode];
              if (!rateOfCurrencyCode) throw new Error(`No base rate for ${currencyCode}`);
              return {
                INR: baseRates.INR / rateOfCurrencyCode,
                USD: baseRates.USD / rateOfCurrencyCode,
                EUR: baseRates.EUR / rateOfCurrencyCode,
                GBP: baseRates.GBP / rateOfCurrencyCode,
              } as Rates;
            }
            throw new Error(data.error?.info || 'exchangeratesapi.io failed');
          }
          const rates = data.rates;
          if (!rates) throw new Error('No rates field');
          return {
            INR: rates.INR,
            USD: rates.USD,
            EUR: rates.EUR,
            GBP: rates.GBP,
          } as Rates;
        },
      },
    ];

    let lastError: unknown = null;
    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider.name}`);
        const res = await fetch(provider.url);
        const filteredRates = await provider.parse(res);
        if (Object.values(filteredRates).every(v => typeof v === 'number' && !isNaN(v))) {
          return new Response(
            JSON.stringify({ rates: filteredRates, success: true, provider: provider.name }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        throw new Error('Incomplete rates from provider');
      } catch (err) {
        console.error(`Provider failed: ${provider.name}`, err);
        lastError = err;
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown'}`);

  } catch (error) {
    console.error('Error in get-exchange-rates function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
