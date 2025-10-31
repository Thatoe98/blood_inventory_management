-- =====================================================
-- CREATE VIEWS ONLY (If they're missing)
-- =====================================================
-- Run this if views weren't created when you ran database.sql

-- Drop existing views if any
DROP VIEW IF EXISTS inventory_summary CASCADE;
DROP VIEW IF EXISTS donations_with_blood_type CASCADE;
DROP VIEW IF EXISTS inventory_with_blood_type CASCADE;

-- View 1: inventory_with_blood_type
CREATE VIEW inventory_with_blood_type AS
SELECT 
    i.inventory_id,
    i.donation_id,
    i.hospital_id,
    i.number_of_units,
    i.collection_ts,
    i.expiry_ts,
    i.status,
    i.notes,
    i.created_at,
    dn.abo_group,
    dn.rh_factor,
    CONCAT(dn.abo_group, dn.rh_factor) as blood_type
FROM inventory i
INNER JOIN donations d ON i.donation_id = d.donation_id
INNER JOIN donors dn ON d.donor_id = dn.donor_id;

-- View 2: donations_with_blood_type
CREATE VIEW donations_with_blood_type AS
SELECT 
    d.donation_id,
    d.donor_id,
    d.hospital_id,
    d.campaign_id,
    d.donation_timestamp,
    d.test_result,
    d.quantity_ml,
    d.hemoglobin_level,
    d.notes,
    d.created_at,
    dn.abo_group,
    dn.rh_factor,
    CONCAT(dn.abo_group, dn.rh_factor) as blood_type,
    dn.first_name || ' ' || dn.last_name as donor_name
FROM donations d
INNER JOIN donors dn ON d.donor_id = dn.donor_id;

-- View 3: inventory_summary
CREATE VIEW inventory_summary AS
SELECT 
    dn.abo_group,
    dn.rh_factor,
    CONCAT(dn.abo_group, dn.rh_factor) as blood_type,
    COUNT(i.inventory_id) as total_units,
    SUM(CASE WHEN i.status = 'Available' THEN 1 ELSE 0 END) as available_units,
    SUM(CASE WHEN i.status = 'Reserved' THEN 1 ELSE 0 END) as reserved_units,
    SUM(CASE WHEN i.status = 'Issued' THEN 1 ELSE 0 END) as issued_units,
    SUM(CASE WHEN i.status = 'Expired' THEN 1 ELSE 0 END) as expired_units
FROM inventory i
INNER JOIN donations d ON i.donation_id = d.donation_id
INNER JOIN donors dn ON d.donor_id = dn.donor_id
GROUP BY dn.abo_group, dn.rh_factor;

-- Test the views
SELECT 'Views created successfully!' as status;
SELECT COUNT(*) as inventory_view_rows FROM inventory_with_blood_type;
SELECT COUNT(*) as donations_view_rows FROM donations_with_blood_type;
SELECT COUNT(*) as summary_rows FROM inventory_summary;
