-- Create countries table to store all country information
CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_name text NOT NULL UNIQUE,
  official_languages text NOT NULL,
  currency text NOT NULL,
  visa_requirement text NOT NULL,
  embassy_presence text NOT NULL,
  flight_options text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Allow public read access since this is reference data
CREATE POLICY "Anyone can view countries"
  ON public.countries
  FOR SELECT
  USING (true);

-- Create index for faster searches
CREATE INDEX idx_countries_name ON public.countries(country_name);