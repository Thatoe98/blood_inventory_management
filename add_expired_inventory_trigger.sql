-- ========================================
-- AUTO-REMOVE EXPIRED BLOOD UNITS TRIGGER
-- ========================================
-- This trigger automatically removes expired blood units from inventory
-- Blood units are considered expired when expiry_ts < current date
-- ========================================

-- Step 1: Create the function that removes expired inventory
CREATE OR REPLACE FUNCTION public.remove_expired_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete inventory items that have expired (expiry_ts is in the past)
    DELETE FROM public.inventory
    WHERE expiry_ts < NOW() 
    AND status = 'Available';
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a trigger that runs the function
-- This trigger will run BEFORE any SELECT/INSERT/UPDATE on the inventory table
CREATE TRIGGER trigger_remove_expired_inventory
    BEFORE INSERT OR UPDATE ON public.inventory
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.remove_expired_inventory();

-- ========================================
-- ALTERNATIVE: Manual cleanup function
-- ========================================
-- If you prefer to manually clean expired inventory, use this function:
-- CALL public.cleanup_expired_inventory();

CREATE OR REPLACE FUNCTION public.cleanup_expired_inventory()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
    count INTEGER;
BEGIN
    -- Delete expired inventory
    WITH deleted AS (
        DELETE FROM public.inventory
        WHERE expiry_ts < NOW() 
        AND status = 'Available'
        RETURNING *
    )
    SELECT COUNT(*) INTO count FROM deleted;
    
    -- Return the count of deleted items
    RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SCHEDULED CLEANUP (Optional)
-- ========================================
-- For automatic daily cleanup, you can use Supabase's pg_cron extension
-- Uncomment the following if you have pg_cron enabled:

/*
-- Enable pg_cron extension (run once)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at midnight
SELECT cron.schedule(
    'cleanup-expired-inventory',
    '0 0 * * *', -- Run at midnight every day
    $$SELECT public.cleanup_expired_inventory()$$
);
*/

-- ========================================
-- IMMEDIATE CLEANUP
-- ========================================
-- Run this to immediately remove all currently expired inventory
SELECT public.cleanup_expired_inventory() AS deleted_count;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check how many expired units exist (should be 0 after cleanup)
SELECT COUNT(*) as expired_units
FROM public.inventory
WHERE expiry_ts < NOW()
AND status = 'Available';

-- View all current inventory with expiry status
SELECT 
    i.inventory_id,
    d.donor_id,
    don.abo_group,
    don.rh_factor,
    i.number_of_units,
    i.collection_ts,
    i.expiry_ts,
    i.status,
    h.name as hospital_name,
    CASE 
        WHEN i.expiry_ts < NOW() THEN 'EXPIRED'
        WHEN i.expiry_ts < NOW() + INTERVAL '7 days' THEN 'EXPIRING SOON'
        ELSE 'VALID'
    END as expiry_status
FROM public.inventory i
JOIN public.donations d ON i.donation_id = d.donation_id
JOIN public.donors don ON d.donor_id = don.donor_id
JOIN public.hospitals h ON i.hospital_id = h.hospital_id
ORDER BY i.expiry_ts ASC;

-- ========================================
-- NOTES
-- ========================================
-- The trigger will automatically remove expired blood units
-- whenever there's an INSERT or UPDATE on the inventory table
-- 
-- For more robust cleanup, consider using the scheduled cleanup
-- with pg_cron to run daily maintenance
-- 
-- To manually trigger cleanup at any time, run:
-- SELECT public.cleanup_expired_inventory();
-- ========================================
