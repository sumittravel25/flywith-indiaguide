-- Add new columns to countries table
ALTER TABLE public.countries
ADD COLUMN IF NOT EXISTS capital_city TEXT,
ADD COLUMN IF NOT EXISTS time_difference TEXT,
ADD COLUMN IF NOT EXISTS popular_destinations TEXT,
ADD COLUMN IF NOT EXISTS major_airports TEXT;

-- Rename existing columns to match new structure
ALTER TABLE public.countries
RENAME COLUMN official_languages TO official_languages_old;

ALTER TABLE public.countries
RENAME COLUMN visa_requirement TO visa_requirement_old;

ALTER TABLE public.countries
RENAME COLUMN embassy_presence TO embassy_presence_old;

ALTER TABLE public.countries
RENAME COLUMN flight_options TO flight_options_old;

-- Add new columns with proper names
ALTER TABLE public.countries
ADD COLUMN IF NOT EXISTS official_languages_new TEXT,
ADD COLUMN IF NOT EXISTS visa_requirement_new TEXT,
ADD COLUMN IF NOT EXISTS indian_embassy TEXT,
ADD COLUMN IF NOT EXISTS flight_options_new TEXT;

-- Copy data from old columns to new
UPDATE public.countries
SET official_languages_new = official_languages_old,
    visa_requirement_new = visa_requirement_old,
    indian_embassy = embassy_presence_old,
    flight_options_new = flight_options_old;

-- Drop old columns
ALTER TABLE public.countries
DROP COLUMN official_languages_old,
DROP COLUMN visa_requirement_old,
DROP COLUMN embassy_presence_old,
DROP COLUMN flight_options_old;

-- Rename new columns to final names
ALTER TABLE public.countries
RENAME COLUMN official_languages_new TO official_languages;

ALTER TABLE public.countries
RENAME COLUMN visa_requirement_new TO visa_requirement;

ALTER TABLE public.countries
RENAME COLUMN flight_options_new TO flight_options;