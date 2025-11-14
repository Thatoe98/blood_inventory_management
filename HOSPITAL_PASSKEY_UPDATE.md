# Hospital Pass-Key Feature Implementation

## Changes Made

### 1. Database Schema
- Added `passkey` column to `hospitals` table
- Passkey format: Hospital Initials + "123" (e.g., "BGH123" for Bangkok General Hospital)
- Column is UNIQUE to prevent duplicate passkeys

### 2. Updated Files

#### `lib/types.ts`
- Added `passkey?: string` to Hospital interface

#### `lib/api.ts`
- Updated `createHospital()` function to auto-generate passkey from hospital name
- Passkey generation logic:
  - Takes first 3 words of hospital name
  - Extracts first letter of each word
  - Converts to uppercase
  - Appends "123"
  - Example: "Bangkok General Hospital" → "BGH123"

#### `app/hospitals/page.tsx`
- Changed "Add Hospital" button to "Register Hospital"
- Changed modal title to "Register New Hospital"
- Added "Pass-Key" column to hospitals table
- Converted city filter from text input to dropdown (populated from existing hospitals)
- Added passkey display modal that shows after hospital registration
- Modal features:
  - Large, prominent display of the generated passkey
  - Warning message to keep passkey secure
  - "Copy to Clipboard" button
  - Confirmation button to acknowledge passkey saved

### 3. Pass-Key Modal Features
When a new hospital is registered:
1. Hospital is created with auto-generated passkey
2. Modal pops up showing the passkey prominently
3. User can copy passkey to clipboard
4. User must acknowledge before closing
5. Success toast appears after closing modal
6. Passkey remains visible in hospitals table for future reference

## SQL Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add passkey column to hospitals table
ALTER TABLE public.hospitals 
ADD COLUMN passkey character varying UNIQUE;

-- Update existing hospitals with generated passkeys
UPDATE public.hospitals
SET passkey = CONCAT(
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
```

## Future Use
The passkey will be used for hospital user authentication when you develop the hospital-facing UI. Each hospital will use their unique passkey to login and:
- View their own inventory
- Manage their blood stock
- Track donations at their facility
- Generate reports

## Examples of Generated Passkeys
- "Bangkok General Hospital" → "BGH123"
- "Chulalongkorn Memorial Hospital" → "CMH123"
- "Siriraj Hospital Bangkok" → "SHB123"
- "Pathum Thani Regional Hospital" → "PTR123"
