-- Create new travel_information table that supports all nationality combinations
CREATE TABLE IF NOT EXISTS public.travel_information (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_country text NOT NULL,
  destination_country text NOT NULL,
  capital_city text,
  official_languages text,
  currency text NOT NULL,
  time_difference text,
  popular_destinations text,
  major_airports text,
  visa_portal_link text,
  visa_requirement text,
  embassy_info text,
  flight_options text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(home_country, destination_country)
);

-- Enable RLS
ALTER TABLE public.travel_information ENABLE ROW LEVEL SECURITY;

-- Anyone can view travel information
CREATE POLICY "Anyone can view travel information"
  ON public.travel_information
  FOR SELECT
  USING (true);

-- Migrate existing Indian data from countries table to travel_information
INSERT INTO public.travel_information (
  home_country,
  destination_country,
  capital_city,
  official_languages,
  currency,
  time_difference,
  popular_destinations,
  major_airports,
  visa_portal_link,
  visa_requirement,
  embassy_info,
  flight_options
)
SELECT 
  'India' as home_country,
  country_name as destination_country,
  capital_city,
  official_languages,
  currency,
  time_difference,
  popular_destinations,
  major_airports,
  visa_portal_link,
  visa_requirement,
  indian_embassy as embassy_info,
  flight_options
FROM public.countries
ON CONFLICT (home_country, destination_country) DO UPDATE SET
  capital_city = EXCLUDED.capital_city,
  official_languages = EXCLUDED.official_languages,
  currency = EXCLUDED.currency,
  time_difference = EXCLUDED.time_difference,
  popular_destinations = EXCLUDED.popular_destinations,
  major_airports = EXCLUDED.major_airports,
  visa_portal_link = EXCLUDED.visa_portal_link,
  visa_requirement = EXCLUDED.visa_requirement,
  embassy_info = EXCLUDED.embassy_info,
  flight_options = EXCLUDED.flight_options;