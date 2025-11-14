-- =====================================================================
-- Campaign Enhancement: Add Total Blood Units Column and Sample Data
-- =====================================================================

-- Step 1: Add column to store total blood units collected from campaign
-- This will be automatically calculated from donations table
ALTER TABLE public.campaigns 
ADD COLUMN total_units_collected INTEGER DEFAULT 0;

-- Step 2: Create a function to calculate total units from a campaign
CREATE OR REPLACE FUNCTION calculate_campaign_total_units(p_campaign_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0)
  INTO v_total
  FROM donations
  WHERE campaign_id = p_campaign_id;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger function to update campaign total when donation is added/removed
CREATE OR REPLACE FUNCTION update_campaign_total_units()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.campaign_id IS NOT NULL THEN
    UPDATE campaigns
    SET total_units_collected = calculate_campaign_total_units(NEW.campaign_id)
    WHERE campaign_id = NEW.campaign_id;
  END IF;
  
  -- Handle UPDATE when campaign_id changes (from old to new)
  IF TG_OP = 'UPDATE' AND OLD.campaign_id IS DISTINCT FROM NEW.campaign_id THEN
    -- Update old campaign if it existed
    IF OLD.campaign_id IS NOT NULL THEN
      UPDATE campaigns
      SET total_units_collected = calculate_campaign_total_units(OLD.campaign_id)
      WHERE campaign_id = OLD.campaign_id;
    END IF;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' AND OLD.campaign_id IS NOT NULL THEN
    UPDATE campaigns
    SET total_units_collected = calculate_campaign_total_units(OLD.campaign_id)
    WHERE campaign_id = OLD.campaign_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger on donations table
DROP TRIGGER IF EXISTS update_campaign_units_trigger ON donations;

CREATE TRIGGER update_campaign_units_trigger
  AFTER INSERT OR UPDATE OR DELETE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_total_units();

-- Step 5: Add comment to document the column
COMMENT ON COLUMN campaigns.total_units_collected IS 
  'Total number of blood donation units collected during this campaign. Automatically updated via trigger when donations are added/removed.';

-- =====================================================================
-- Insert Sample Campaign Data
-- =====================================================================

-- Past Campaigns (5 campaigns - completed with donations)
INSERT INTO campaigns (campaign_id, hospital_id, name, start_date, end_date, location, notes) VALUES

-- Campaign 1: January 2025 - Bangkok General Hospital
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 
 '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab',
 'New Year Blood Drive 2025',
 '2025-01-05',
 '2025-01-15',
 'Bangkok General Hospital Main Hall',
 'Successful campaign during New Year period. High donor turnout.'),

-- Campaign 2: March 2025 - Chulalongkorn Memorial Hospital
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
 '8cd056df-46fe-466c-9cef-9685d0fed966',
 'World Blood Donor Day Preparation',
 '2025-03-10',
 '2025-03-20',
 'Chulalongkorn University Campus',
 'Student-focused campaign. Great participation from university community.'),

-- Campaign 3: May 2025 - Siriraj Hospital
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
 'fb68276c-dff7-44e5-a2a6-37e60579c703',
 'Thalassemia Awareness Blood Campaign',
 '2025-05-01',
 '2025-05-10',
 'Siriraj Hospital Blood Center',
 'Special campaign for Thalassemia Day. Focus on rare blood types.'),

-- Campaign 4: July 2025 - Pathum Thani Regional Hospital
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
 '3964ce29-9490-4d2f-8562-50639ce01e10',
 'Summer Health Festival Blood Drive',
 '2025-07-15',
 '2025-07-25',
 'Pathum Thani Sports Complex',
 'Combined with health festival. Good family participation.'),

-- Campaign 5: September 2025 - Nonthaburi Central Hospital
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
 '949f13bc-2957-4c97-af9c-a8db09066371',
 'Emergency Blood Reserve Campaign',
 '2025-09-05',
 '2025-09-15',
 'Nonthaburi Central Hospital Auditorium',
 'Emergency replenishment campaign due to low stock. Excellent response.');

-- Future Campaigns (3 campaigns - upcoming)
INSERT INTO campaigns (campaign_id, hospital_id, name, start_date, end_date, location, notes) VALUES

-- Future Campaign 1: December 2025 - Bangkok Heart Hospital
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c',
 'da53a12d-11aa-484e-be8e-93f99f30d233',
 'Holiday Season Blood Drive 2025',
 '2025-12-01',
 '2025-12-20',
 'Bangkok Heart Hospital Community Center',
 'Annual holiday campaign. Expecting high participation from corporate donors.'),

-- Future Campaign 2: January 2026 - Samut Prakan Medical Center
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d',
 '80f6d627-e88f-438d-8b0c-9f94dd38e86a',
 'New Year Health Initiative 2026',
 '2026-01-10',
 '2026-01-25',
 'Samut Prakan City Hall Plaza',
 'Partnership with local government. Mobile blood donation units available.'),

-- Future Campaign 3: February 2026 - Nakhon Pathom Provincial Hospital
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e',
 '55b2cc8e-607c-4f9a-8aa1-38539fdfcfe5',
 'Chinese New Year Blood Donation',
 '2026-02-01',
 '2026-02-14',
 'Nakhon Pathom Provincial Hospital',
 'Cultural celebration campaign. Focus on community engagement.');

-- =====================================================================
-- Update existing campaigns with current donation counts
-- =====================================================================

UPDATE campaigns
SET total_units_collected = calculate_campaign_total_units(campaign_id);

-- =====================================================================
-- Verification Queries
-- =====================================================================

-- Query 1: View all campaigns with their total units
SELECT 
  c.campaign_id,
  c.name,
  c.start_date,
  c.end_date,
  c.location,
  h.name as hospital_name,
  c.total_units_collected,
  CASE 
    WHEN c.end_date < CURRENT_DATE THEN 'Completed'
    WHEN c.start_date > CURRENT_DATE THEN 'Upcoming'
    ELSE 'Ongoing'
  END as status
FROM campaigns c
JOIN hospitals h ON c.hospital_id = h.hospital_id
ORDER BY c.start_date DESC;

-- Query 2: Summary by campaign status
SELECT 
  CASE 
    WHEN end_date < CURRENT_DATE THEN 'Past'
    WHEN start_date > CURRENT_DATE THEN 'Future'
    ELSE 'Ongoing'
  END as campaign_status,
  COUNT(*) as total_campaigns,
  SUM(total_units_collected) as total_units
FROM campaigns
GROUP BY campaign_status
ORDER BY campaign_status;

-- Query 3: View trigger information
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'update_campaign_units_trigger';
