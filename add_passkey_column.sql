-- Add passkey column to hospitals table
ALTER TABLE public.hospitals 
ADD COLUMN passkey character varying UNIQUE;

-- Update existing hospitals with generated passkeys
-- This will generate passkeys for existing hospitals based on their names
UPDATE public.hospitals
SET passkey = CONCAT(
  -- Extract initials from hospital name
  UPPER(
    SUBSTRING(SPLIT_PART(name, ' ', 1), 1, 1) ||
    CASE 
      WHEN SPLIT_PART(name, ' ', 2) != '' THEN SUBSTRING(SPLIT_PART(name, ' ', 2), 1, 1)
      ELSE ''
    END ||
    CASE 
      WHEN SPLIT_PART(name, ' ', 3) != '' THEN SUBSTRING(SPLIT_PART(name, ' ', 3), 1, 1)
      ELSE ''
    END
  ),
  '123'
)
WHERE passkey IS NULL;
