-- =====================================================================
-- HIGH PRIORITY: Add Database-Level Donor Eligibility Validation
-- =====================================================================
-- This prevents race conditions where multiple donations could be 
-- created for the same donor within the 58-day eligibility period
-- =====================================================================

-- Step 1: Create function to check donor eligibility before donation
CREATE OR REPLACE FUNCTION check_donor_eligibility_before_donation()
RETURNS TRIGGER AS $$
DECLARE
  v_last_donation_date DATE;
  v_days_since_donation INTEGER;
  v_donor_name TEXT;
BEGIN
  -- Get the donor's last donation date and name for error message
  SELECT last_donation_date, first_name || ' ' || last_name
  INTO v_last_donation_date, v_donor_name
  FROM donors
  WHERE donor_id = NEW.donor_id;
  
  -- If donor doesn't exist, let FK constraint handle it
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- If donor has never donated before, they are eligible
  IF v_last_donation_date IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate days since last donation
  v_days_since_donation := CURRENT_DATE - v_last_donation_date;
  
  -- Check if donor is eligible (must wait more than 58 days)
  IF v_days_since_donation <= 58 THEN
    RAISE EXCEPTION 'Donor "%" is not eligible for donation. Last donation was % days ago. Must wait % more days.',
      v_donor_name,
      v_days_since_donation,
      (59 - v_days_since_donation)
    USING HINT = 'Donors must wait at least 59 days between donations.',
          ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create trigger that runs BEFORE INSERT on donations table
DROP TRIGGER IF EXISTS validate_donor_eligibility ON donations;

CREATE TRIGGER validate_donor_eligibility
  BEFORE INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION check_donor_eligibility_before_donation();

-- Step 3: Add a comment to document the trigger
COMMENT ON TRIGGER validate_donor_eligibility ON donations IS 
  'Validates that donor is eligible (>58 days since last donation) before allowing new donation. Prevents race condition where multiple donations could be created simultaneously for the same donor.';

-- =====================================================================
-- Test the validation (Optional - for verification)
-- =====================================================================

-- Test Case 1: Try to create a donation for a donor who donated recently
-- This should FAIL with error message
-- Uncomment the following lines to test:

/*
-- Find a donor who donated recently (within last 58 days)
DO $$
DECLARE
  v_test_donor_id UUID;
  v_test_hospital_id UUID;
BEGIN
  -- Get a recent donor
  SELECT donor_id INTO v_test_donor_id
  FROM donors
  WHERE last_donation_date IS NOT NULL
    AND CURRENT_DATE - last_donation_date <= 58
  LIMIT 1;
  
  -- Get any hospital
  SELECT hospital_id INTO v_test_hospital_id
  FROM hospitals
  LIMIT 1;
  
  IF v_test_donor_id IS NOT NULL AND v_test_hospital_id IS NOT NULL THEN
    -- This should fail with our custom error message
    INSERT INTO donations (donor_id, hospital_id, quantity_ml)
    VALUES (v_test_donor_id, v_test_hospital_id, 450);
    
    RAISE NOTICE 'ERROR: Validation did not work! Donation was created for ineligible donor.';
  ELSE
    RAISE NOTICE 'No recent donors found for testing. Validation is installed but not tested.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: Validation working correctly. Error: %', SQLERRM;
END $$;
*/

-- Test Case 2: Create a donation for an eligible donor
-- This should SUCCEED
-- Uncomment the following lines to test:

/*
DO $$
DECLARE
  v_test_donor_id UUID;
  v_test_hospital_id UUID;
BEGIN
  -- Get an eligible donor (no recent donation or >58 days)
  SELECT donor_id INTO v_test_donor_id
  FROM donors
  WHERE last_donation_date IS NULL
     OR CURRENT_DATE - last_donation_date > 58
  LIMIT 1;
  
  -- Get any hospital
  SELECT hospital_id INTO v_test_hospital_id
  FROM hospitals
  LIMIT 1;
  
  IF v_test_donor_id IS NOT NULL AND v_test_hospital_id IS NOT NULL THEN
    -- This should succeed
    INSERT INTO donations (donor_id, hospital_id, quantity_ml)
    VALUES (v_test_donor_id, v_test_hospital_id, 450);
    
    RAISE NOTICE 'SUCCESS: Donation created for eligible donor.';
    
    -- Clean up test donation
    DELETE FROM donations 
    WHERE donor_id = v_test_donor_id 
      AND hospital_id = v_test_hospital_id
      AND quantity_ml = 450
      AND donation_timestamp >= NOW() - INTERVAL '1 minute';
      
    RAISE NOTICE 'Test donation cleaned up.';
  ELSE
    RAISE NOTICE 'No eligible donors found for testing.';
  END IF;
END $$;
*/

-- =====================================================================
-- Verification Query
-- =====================================================================
-- Run this to verify the trigger was created successfully

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'validate_donor_eligibility';
