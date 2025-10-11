import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const countryData = [
  { country_name: "Afghanistan", official_languages: "Pashto, Dari", currency: "Afghan afghani (AFN)", visa_requirement: "Traditional Visa Required", embassy_presence: "Yes, in Kabul", flight_options: "Flights with one or more stops available, typically via Dubai or Istanbul." },
  { country_name: "Albania", official_languages: "Albanian", currency: "Albanian lek (ALL)", visa_requirement: "Traditional Visa Required", embassy_presence: "No (Accredited to Embassy in Rome, Italy)", flight_options: "Connecting flights available, usually via European hubs like Istanbul or Vienna." },
  { country_name: "Algeria", official_languages: "Arabic, Tamazight", currency: "Algerian dinar (DZD)", visa_requirement: "Traditional Visa Required", embassy_presence: "Yes, in Algiers", flight_options: "Connecting flights available, often stopping in Paris or Dubai." },
  { country_name: "Andorra", official_languages: "Catalan", currency: "Euro (EUR)", visa_requirement: "Schengen Visa Required", embassy_presence: "No (Accredited to Embassy in Madrid, Spain)", flight_options: "No airport. Requires travel via nearby airports in Spain (e.g., Barcelona) or France." },
  { country_name: "Angola", official_languages: "Portuguese", currency: "Angolan kwanza (AOA)", visa_requirement: "Traditional Visa Required", embassy_presence: "Yes, in Luanda", flight_options: "Connecting flights available, commonly via Addis Ababa or Dubai." },
  { country_name: "Antigua & Barbuda", official_languages: "English", currency: "East Caribbean dollar (XCD)", visa_requirement: "Visa on Arrival", embassy_presence: "No (Accredited to High Commission in Georgetown, Guyana)", flight_options: "Connecting flights required, usually through the US or UK." },
  { country_name: "Argentina", official_languages: "Spanish", currency: "Argentine peso (ARS)", visa_requirement: "Traditional Visa Required", embassy_presence: "Yes, in Buenos Aires", flight_options: "Flights with 1+ stops available, often via Dubai, Addis Ababa, or São Paulo." },
  { country_name: "Armenia", official_languages: "Armenian", currency: "Armenian dram (AMD)", visa_requirement: "eVisa / Visa on Arrival", embassy_presence: "Yes, in Yerevan", flight_options: "Connecting flights available with stops in Sharjah, Moscow, or Doha." },
  { country_name: "Australia", official_languages: "English", currency: "Australian dollar (AUD)", visa_requirement: "eVisa (Visitor visa subclass 600)", embassy_presence: "Yes (Canberra, Sydney, Melbourne, Perth)", flight_options: "Direct flights available to major cities like Sydney and Melbourne." },
  { country_name: "Austria", official_languages: "German", currency: "Euro (EUR)", visa_requirement: "Schengen Visa Required", embassy_presence: "Yes, in Vienna", flight_options: "Direct flights available to Vienna. Many connecting options also exist." },
  { country_name: "Azerbaijan", official_languages: "Azerbaijani", currency: "Azerbaijani manat (AZN)", visa_requirement: "eVisa (ASAN Visa)", embassy_presence: "Yes, in Baku", flight_options: "Direct flights available to Baku from Delhi." },
  { country_name: "Bahamas", official_languages: "English", currency: "Bahamian dollar (BSD)", visa_requirement: "Traditional Visa Required", embassy_presence: "No (Accredited to High Commission in Kingston, Jamaica)", flight_options: "Connecting flights required, typically through the US or Europe." },
  { country_name: "Bahrain", official_languages: "Arabic", currency: "Bahraini dinar (BHD)", visa_requirement: "eVisa", embassy_presence: "Yes, in Manama", flight_options: "Direct flights available from several Indian cities." },
  { country_name: "Bangladesh", official_languages: "Bengali", currency: "Bangladeshi taka (BDT)", visa_requirement: "Visa on Arrival (limited ports) / Traditional Visa", embassy_presence: "Yes (Dhaka, Chittagong, Rajshahi, Sylhet)", flight_options: "Direct flights available from major Indian cities." },
  { country_name: "Barbados", official_languages: "English", currency: "Barbadian dollar (BBD)", visa_requirement: "Visa-Free (up to 90 days)", embassy_presence: "No (Accredited to High Commission in Paramaribo, Suriname)", flight_options: "Connecting flights required, usually through Europe or the UK." },
  { country_name: "Belarus", official_languages: "Belarusian, Russian", currency: "Belarusian ruble (BYN)", visa_requirement: "Traditional Visa Required", embassy_presence: "Yes, in Minsk", flight_options: "Connecting flights available, often via Moscow, Dubai or Istanbul." },
  { country_name: "Belgium", official_languages: "Dutch, French, German", currency: "Euro (EUR)", visa_requirement: "Schengen Visa Required", embassy_presence: "Yes, in Brussels", flight_options: "Direct flights available to Brussels from major Indian cities." },
  { country_name: "Belize", official_languages: "English", currency: "Belize dollar (BZD)", visa_requirement: "Traditional Visa Required", embassy_presence: "No (Accredited to Embassy in Mexico City, Mexico)", flight_options: "Connecting flights required, usually through the US or Mexico." },
  { country_name: "Benin", official_languages: "French", currency: "West African CFA franc (XOF)", visa_requirement: "eVisa / Visa on Arrival", embassy_presence: "No (Accredited to High Commission in Abuja, Nigeria)", flight_options: "Connecting flights available, via Addis Ababa or European cities." },
  { country_name: "Bhutan", official_languages: "Dzongkha", currency: "Bhutanese ngultrum (BTN), Indian Rupee (INR)", visa_requirement: "Permit on Arrival", embassy_presence: "Yes, in Thimphu", flight_options: "Direct flights available from select Indian cities to Paro." }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting import of ${countryData.length} countries`);

    const { data, error } = await supabase
      .from('countries')
      .upsert(countryData, { onConflict: 'country_name' });

    if (error) {
      console.error('Error importing countries:', error);
      throw error;
    }

    console.log('Successfully imported countries');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported ${countryData.length} countries`,
        count: countryData.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in import-countries function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
