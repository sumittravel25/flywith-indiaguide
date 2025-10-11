import { supabase } from "@/integrations/supabase/client";

export const countryData = [
  {
    country_name: "Afghanistan",
    official_languages: "Pashto, Dari",
    currency: "Afghan afghani (AFN)",
    visa_requirement: "Traditional Visa Required",
    embassy_presence: "Yes, in Kabul",
    flight_options: "Flights with one or more stops available, typically via Dubai or Istanbul."
  },
  {
    country_name: "Albania",
    official_languages: "Albanian",
    currency: "Albanian lek (ALL)",
    visa_requirement: "Traditional Visa Required",
    embassy_presence: "No (Accredited to Embassy in Rome, Italy)",
    flight_options: "Connecting flights available, usually via European hubs like Istanbul or Vienna."
  },
  {
    country_name: "Algeria",
    official_languages: "Arabic, Tamazight",
    currency: "Algerian dinar (DZD)",
    visa_requirement: "Traditional Visa Required",
    embassy_presence: "Yes, in Algiers",
    flight_options: "Connecting flights available, often stopping in Paris or Dubai."
  },
  {
    country_name: "Andorra",
    official_languages: "Catalan",
    currency: "Euro (EUR)",
    visa_requirement: "Schengen Visa Required",
    embassy_presence: "No (Accredited to Embassy in Madrid, Spain)",
    flight_options: "No airport. Requires travel via nearby airports in Spain (e.g., Barcelona) or France."
  },
  {
    country_name: "Angola",
    official_languages: "Portuguese",
    currency: "Angolan kwanza (AOA)",
    visa_requirement: "Traditional Visa Required",
    embassy_presence: "Yes, in Luanda",
    flight_options: "Connecting flights available, commonly via Addis Ababa or Dubai."
  }
];

export const importCountries = async () => {
  try {
    const { error } = await supabase
      .from("countries")
      .insert(countryData);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error importing countries:", error);
    return { success: false, error };
  }
};
