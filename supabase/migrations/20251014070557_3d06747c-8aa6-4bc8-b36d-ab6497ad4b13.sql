-- Add visa_portal_link column to countries table
ALTER TABLE public.countries 
ADD COLUMN IF NOT EXISTS visa_portal_link text;