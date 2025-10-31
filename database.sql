-- =====================================================
-- BLOOD INVENTORY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- This script creates all tables for the Blood Inventory Management System
-- Run this in Supabase SQL Editor to set up the database

-- =====================================================
-- DROP EXISTING TABLES (CLEAN SLATE)
-- =====================================================
-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: HOSPITALS (Independent - No FK)
-- =====================================================
CREATE TABLE hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLE 2: DONORS (Independent - No FK)
-- =====================================================
CREATE TABLE donors (
    donor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    sex VARCHAR(10) CHECK (sex IN ('Male', 'Female', 'Other')),
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    abo_group VARCHAR(3) NOT NULL CHECK (abo_group IN ('A', 'B', 'AB', 'O')),
    rh_factor VARCHAR(3) NOT NULL CHECK (rh_factor IN ('+', '-')),
    last_donation_date DATE,
    city VARCHAR(50),
    eligibility_status VARCHAR(20) DEFAULT 'Eligible' CHECK (eligibility_status IN ('Eligible', 'Ineligible', 'Deferred')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLE 3: CAMPAIGNS (Depends on: hospitals)
-- =====================================================
CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLE 4: PATIENTS (Depends on: hospitals)
-- =====================================================
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    case_no VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    sex VARCHAR(10) CHECK (sex IN ('Male', 'Female', 'Other')),
    abo_group VARCHAR(3) NOT NULL CHECK (abo_group IN ('A', 'B', 'AB', 'O')),
    rh_factor VARCHAR(3) NOT NULL CHECK (rh_factor IN ('+', '-')),
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLE 5: DONATIONS (Depends on: donors, hospitals, campaigns)
-- 3NF: Removed abo_group and rh_factor (derivable from donors table)
-- =====================================================
CREATE TABLE donations (
    donation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE SET NULL,
    donation_timestamp TIMESTAMP DEFAULT NOW(),
    test_result VARCHAR(20) DEFAULT 'Pending' CHECK (test_result IN ('Pending', 'Accepted', 'Rejected')),
    quantity_ml INTEGER DEFAULT 450 CHECK (quantity_ml > 0),
    hemoglobin_level DECIMAL(4,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLE 6: INVENTORY (Depends on: donations, hospitals)
-- 3NF: Removed abo_group and rh_factor (derivable from donations->donors)
-- =====================================================
CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL UNIQUE REFERENCES donations(donation_id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    number_of_units INTEGER DEFAULT 1 CHECK (number_of_units > 0),
    collection_ts TIMESTAMP NOT NULL,
    expiry_ts TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Issued', 'Expired', 'Discarded')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX idx_donors_phone ON donors(phone_number);
CREATE INDEX idx_donors_blood_type ON donors(abo_group, rh_factor);
CREATE INDEX idx_donors_eligibility ON donors(eligibility_status);

CREATE INDEX idx_patients_case_no ON patients(case_no);
CREATE INDEX idx_patients_hospital ON patients(hospital_id);
CREATE INDEX idx_patients_blood_type ON patients(abo_group, rh_factor);

CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_hospital ON donations(hospital_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_test_result ON donations(test_result);
CREATE INDEX idx_donations_timestamp ON donations(donation_timestamp);

CREATE INDEX idx_inventory_donation ON inventory(donation_id);
CREATE INDEX idx_inventory_hospital ON inventory(hospital_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_ts);

CREATE INDEX idx_campaigns_hospital ON campaigns(hospital_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- =====================================================
-- VIEWS FOR EASY QUERYING (3NF normalized data)
-- =====================================================

-- View: Donors with calculated eligibility status
CREATE OR REPLACE VIEW donors_with_eligibility AS
SELECT 
    d.*,
    CASE 
        WHEN d.last_donation_date IS NULL THEN 'Eligible'
        WHEN d.last_donation_date + INTERVAL '56 days' <= CURRENT_DATE THEN 'Eligible'
        WHEN d.last_donation_date + INTERVAL '56 days' > CURRENT_DATE THEN 'Deferred'
        ELSE 'Eligible'
    END as calculated_eligibility,
    CURRENT_DATE - d.last_donation_date as days_since_last_donation,
    CASE 
        WHEN d.last_donation_date IS NOT NULL AND d.last_donation_date + INTERVAL '56 days' > CURRENT_DATE 
        THEN (d.last_donation_date + INTERVAL '56 days')::date - CURRENT_DATE
        ELSE 0
    END as days_until_eligible
FROM donors d;

-- View: Get blood type from inventory (derived from donors via donations)
CREATE OR REPLACE VIEW inventory_with_blood_type AS
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

-- View: Get donations with blood type information
CREATE OR REPLACE VIEW donations_with_blood_type AS
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

-- View: Available inventory summary by blood type
CREATE OR REPLACE VIEW inventory_summary AS
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

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Sample Hospitals
INSERT INTO hospitals (name, type, phone, email, address, city, state, postal_code)
VALUES 
    ('City General Hospital', 'Public', '+1-555-0001', 'admin@citygen.hospital', '100 Hospital Blvd', 'New York', 'NY', '10001'),
    ('St. Mary Medical Center', 'Private', '+1-555-0002', 'contact@stmary.hospital', '200 Healthcare Ave', 'Los Angeles', 'CA', '90001'),
    ('Metro Health Institute', 'Public', '+1-555-0003', 'info@metrohealth.hospital', '300 Medical Plaza', 'Chicago', 'IL', '60601'),
    ('Community Care Hospital', 'Non-profit', '+1-555-0004', 'service@commcare.hospital', '400 Wellness Dr', 'Houston', 'TX', '77001'),
    ('Phoenix Regional Medical', 'Private', '+1-555-0005', 'admin@phoenixmed.hospital', '500 Care Center Rd', 'Phoenix', 'AZ', '85001')
ON CONFLICT DO NOTHING;

-- Sample Donors
INSERT INTO donors (first_name, last_name, date_of_birth, sex, phone_number, email, abo_group, rh_factor, last_donation_date, city, eligibility_status, notes)
VALUES 
    ('John', 'Smith', '1990-05-15', 'Male', '+1-234-567-8901', 'john.smith@email.com', 'O', '+', '2024-08-15', 'New York', 'Eligible', NULL),
    ('Emily', 'Johnson', '1985-08-22', 'Female', '+1-234-567-8902', 'emily.j@email.com', 'A', '+', '2024-09-10', 'Los Angeles', 'Eligible', NULL),
    ('Michael', 'Brown', '1992-03-10', 'Male', '+1-234-567-8903', 'michael.b@email.com', 'B', '+', '2024-07-20', 'Chicago', 'Eligible', NULL),
    ('Sarah', 'Davis', '1988-11-30', 'Female', '+1-234-567-8904', 'sarah.d@email.com', 'AB', '+', '2024-09-25', 'Houston', 'Eligible', NULL),
    ('David', 'Wilson', '1995-01-18', 'Male', '+1-234-567-8905', 'david.w@email.com', 'O', '-', '2024-08-05', 'Phoenix', 'Eligible', NULL),
    ('Jessica', 'Martinez', '1987-07-25', 'Female', '+1-234-567-8906', 'jessica.m@email.com', 'A', '-', '2024-09-15', 'New York', 'Eligible', NULL),
    ('James', 'Anderson', '1993-09-12', 'Male', '+1-234-567-8907', 'james.a@email.com', 'B', '-', '2024-08-28', 'Los Angeles', 'Eligible', NULL),
    ('Jennifer', 'Taylor', '1991-04-05', 'Female', '+1-234-567-8908', 'jennifer.t@email.com', 'AB', '-', '2024-09-20', 'Chicago', 'Eligible', NULL)
ON CONFLICT (phone_number) DO NOTHING;

-- Sample Campaigns
INSERT INTO campaigns (campaign_id, hospital_id, name, start_date, end_date, location, notes)
VALUES 
    ('11111111-1111-1111-1111-111111111111'::uuid, 
     (SELECT hospital_id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
     'Community Blood Drive 2024', '2024-11-15', '2024-11-15', 'Central Community Center', 'Annual drive'),
    ('22222222-2222-2222-2222-222222222222'::uuid,
     (SELECT hospital_id FROM hospitals WHERE name = 'St. Mary Medical Center' LIMIT 1),
     'University Campus Donation', '2024-11-20', '2024-11-20', 'University Main Hall', 'Student initiative'),
    ('33333333-3333-3333-3333-333333333333'::uuid,
     (SELECT hospital_id FROM hospitals WHERE name = 'Metro Health Institute' LIMIT 1),
     'Corporate Health Initiative', '2024-10-10', '2024-10-10', 'Company Headquarters', 'Corporate partnership')
ON CONFLICT (campaign_id) DO NOTHING;

-- Sample Patients
INSERT INTO patients (hospital_id, case_no, first_name, last_name, date_of_birth, sex, abo_group, rh_factor, diagnosis, notes)
VALUES 
    ((SELECT hospital_id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1),
     'CASE-2024-001', 'Robert', 'Miller', '1975-03-20', 'Male', 'O', '+', 'Anemia', 'Requires transfusion'),
    ((SELECT hospital_id FROM hospitals WHERE name = 'St. Mary Medical Center' LIMIT 1),
     'CASE-2024-002', 'Linda', 'Garcia', '1982-06-15', 'Female', 'A', '+', 'Post-surgery', 'Blood loss during surgery'),
    ((SELECT hospital_id FROM hospitals WHERE name = 'Metro Health Institute' LIMIT 1),
     'CASE-2024-003', 'William', 'Rodriguez', '1968-09-08', 'Male', 'B', '+', 'Trauma', 'Emergency case')
ON CONFLICT (case_no) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================
-- For development, disable RLS for all tables
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGERS FOR AUTOMATED WORKFLOWS
-- =====================================================

-- Trigger 1: Auto-create inventory record when donation is accepted
CREATE OR REPLACE FUNCTION create_inventory_on_accepted_donation()
RETURNS TRIGGER AS $$
BEGIN
    -- When donation test result changes to 'Accepted', create inventory record
    IF NEW.test_result = 'Accepted' AND (OLD IS NULL OR OLD.test_result != 'Accepted') THEN
        INSERT INTO inventory (
            donation_id,
            hospital_id,
            number_of_units,
            collection_ts,
            expiry_ts,
            status
        ) VALUES (
            NEW.donation_id,
            NEW.hospital_id,
            1, -- Default 1 unit per donation
            NEW.donation_timestamp,
            NEW.donation_timestamp + INTERVAL '35 days', -- Blood expires in 35 days
            'Available'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_inventory_on_donation ON donations;
CREATE TRIGGER trigger_create_inventory_on_donation
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION create_inventory_on_accepted_donation();

-- Trigger 2: Update donor's last donation date
CREATE OR REPLACE FUNCTION update_donor_on_donation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE donors
    SET last_donation_date = NEW.donation_timestamp::date
    WHERE donor_id = NEW.donor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_donor_on_donation ON donations;
CREATE TRIGGER trigger_update_donor_on_donation
AFTER INSERT ON donations
FOR EACH ROW
EXECUTE FUNCTION update_donor_on_donation();

-- Trigger 3: Auto-expire inventory items past expiry date
CREATE OR REPLACE FUNCTION auto_expire_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_ts < NOW() AND NEW.status = 'Available' THEN
        NEW.status := 'Expired';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_expire_inventory ON inventory;
CREATE TRIGGER trigger_auto_expire_inventory
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION auto_expire_inventory();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify your setup:

-- SELECT COUNT(*) as hospital_count FROM hospitals;
-- SELECT COUNT(*) as donor_count FROM donors;
-- SELECT COUNT(*) as patient_count FROM patients;
-- SELECT COUNT(*) as campaign_count FROM campaigns;

-- Use VIEWS to query normalized data:
-- SELECT * FROM inventory_with_blood_type WHERE status = 'Available';
-- SELECT * FROM donations_with_blood_type WHERE test_result = 'Accepted';
-- SELECT * FROM inventory_summary ORDER BY blood_type;

-- Check blood type distribution (using view):
-- SELECT blood_type, available_units, reserved_units 
-- FROM inventory_summary 
-- ORDER BY blood_type;

-- Query inventory with blood type (3NF normalized):
-- SELECT i.inventory_id, i.status, CONCAT(d.abo_group, d.rh_factor) as blood_type
-- FROM inventory i
-- INNER JOIN donations don ON i.donation_id = don.donation_id
-- INNER JOIN donors d ON don.donor_id = d.donor_id
-- WHERE i.status = 'Available';

-- =====================================================
-- END OF SCHEMA (3NF NORMALIZED)
-- =====================================================
