-- Insert fresh donations for blood inventory
-- Blood types: A+, A-, B-, O+, O-, AB-
-- 10 units per blood type (60 total donations)
-- Collection dates: Recent (within last 30 days to ensure not expired)
-- Expiry: 42 days from collection date
-- Using Bangkok General Hospital as default location

-- A+ Blood Type (10 units)
INSERT INTO public.donations (donation_id, donor_id, hospital_id, donation_timestamp, quantity_ml, notes) VALUES
(gen_random_uuid(), '6cdbc661-a794-4a6f-9573-89f0980139c7', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-10 09:00:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), '344a81e4-7d1f-4d6b-86b7-2801f243979b', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-09 10:00:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), '4f0676ec-31d3-4068-92cf-0df59db15987', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-08 11:00:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), '5103668b-e28b-4002-9346-23a5fc9353af', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-07 09:30:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), '598a218c-4de5-467f-b992-8741f809742c', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-06 10:30:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), '3f0d6e74-5f70-4171-a6f9-125986bc9be6', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-05 11:30:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), 'a0eb7cc7-36f0-40bd-aff2-131654c3cf12', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-04 09:45:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), 'b55c5acc-7777-4208-a9f7-7ad70e73f880', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-03 10:45:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), '4db71225-83e1-46e7-8cdf-41053a1c84a9', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-02 11:45:00', 450, 'Fresh A+ donation'),
(gen_random_uuid(), '912eb478-4b50-4210-9936-a8e9fa6f67f3', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-01 09:15:00', 450, 'Fresh A+ donation');

-- A- Blood Type (10 units)
INSERT INTO public.donations (donation_id, donor_id, hospital_id, donation_timestamp, quantity_ml, notes) VALUES
(gen_random_uuid(), '1e86046d-3bb3-479e-8144-82b66eee6ce0', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-10 09:00:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), '337be435-d7ea-4a14-815a-e76b9cd12248', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-09 10:00:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), '3dbdb26d-4663-4d92-a0e4-909f1411a178', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-08 11:00:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), '633a4ae0-3127-49d9-822d-40728018820c', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-07 09:30:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), '75ce4146-8bd6-43a5-97f2-9cecc32037de', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-06 10:30:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), '7f6df1c9-a550-4e52-98c0-8d411cb39f72', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-05 11:30:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), '8f20c597-bb24-48df-b58a-beac6656b79e', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-04 09:45:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), '9e8523b8-eed2-4972-a1b8-3831b9042f90', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-03 10:45:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), 'bf88ac60-e9b6-46b9-a48d-3b9c1c6bcf3a', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-02 11:45:00', 450, 'Fresh A- donation'),
(gen_random_uuid(), 'cfeac7c3-c33f-441f-92c4-f2c2053aa382', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-01 09:15:00', 450, 'Fresh A- donation');

-- B- Blood Type (10 units)
INSERT INTO public.donations (donation_id, donor_id, hospital_id, donation_timestamp, quantity_ml, notes) VALUES
(gen_random_uuid(), '08cfb172-58bd-413f-9f2e-a1851423156d', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-10 09:00:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), '3514cce8-87b6-4ace-9eee-89b6d670cd67', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-09 10:00:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), '43bf7e12-f355-41a7-b51f-be7e255c483a', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-08 11:00:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), '52256e19-9bb0-4f4c-9b03-6a8e2a00406b', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-07 09:30:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), '582a2786-9c24-49f0-8141-e2b1ceba0c32', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-06 10:30:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), 'a5231d91-81a6-4ff3-9826-6490ac18491d', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-05 11:30:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), 'c8025e6d-28c4-4994-ab39-1fdcf748e46e', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-04 09:45:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), 'cb2a4662-3f3c-4107-8641-77eb9921ea61', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-03 10:45:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), 'e92adf42-38d4-455d-9f22-9bb826b07db5', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-02 11:45:00', 450, 'Fresh B- donation'),
(gen_random_uuid(), 'eca20641-ea36-4fcc-85f6-fbc0fa6ea60d', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-01 09:15:00', 450, 'Fresh B- donation');

-- O+ Blood Type (10 units)
INSERT INTO public.donations (donation_id, donor_id, hospital_id, donation_timestamp, quantity_ml, notes) VALUES
(gen_random_uuid(), '23662640-e15e-458f-9a21-a6b22fe2a5a8', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-10 09:00:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), '33024c52-5fc7-4b10-9c11-4a4aa4ca7e31', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-09 10:00:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), '357750fd-f9e7-4a1f-8de8-0246b99cc1de', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-08 11:00:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), '456204c5-f51a-478b-800e-875c7c0807af', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-07 09:30:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), '75de121a-d8d4-4069-aed6-99f077122f87', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-06 10:30:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), '8b5c4ba6-d59f-4b2f-8391-0aa12ce3d197', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-05 11:30:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), 'c328a90e-3709-4fb1-9a5d-64bc31846fe2', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-04 09:45:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), 'cf341f35-3c43-4d33-b417-3e9a6ed177c8', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-03 10:45:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), 'd51374ac-0df9-486c-b77e-bb92de758e11', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-02 11:45:00', 450, 'Fresh O+ donation'),
(gen_random_uuid(), 'dba81ccc-0aa9-4e4a-b293-6971d7650f7a', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-01 09:15:00', 450, 'Fresh O+ donation');

-- O- Blood Type (10 units)
INSERT INTO public.donations (donation_id, donor_id, hospital_id, donation_timestamp, quantity_ml, notes) VALUES
(gen_random_uuid(), '3e11ebcd-e0fb-4fe3-800e-c31016d05cf2', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-10 09:00:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), '79462c20-337f-402a-99c8-580cac4891ca', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-09 10:00:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), '93170804-1c45-4c5b-be73-3a6fe466a202', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-08 11:00:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), 'a95dcccc-bf0f-4810-b7c6-a9799a7229bc', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-07 09:30:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), 'b2602812-ad52-4013-a508-1937e94af916', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-06 10:30:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), 'bf755b75-1f26-401c-93cc-bca91829e42a', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-05 11:30:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), 'cfa78398-4cc6-4396-987f-9a8734d9000d', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-04 09:45:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), 'df462544-47af-4a38-9530-8de348159421', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-03 10:45:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), 'eb37f697-183a-42df-b81d-8b1851163538', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-02 11:45:00', 450, 'Fresh O- donation'),
(gen_random_uuid(), 'bbb3e0f7-c8ee-47a7-a6d4-e328acd9e88b', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-01 09:15:00', 450, 'Fresh O- donation');

-- AB- Blood Type (10 units)
INSERT INTO public.donations (donation_id, donor_id, hospital_id, donation_timestamp, quantity_ml, notes) VALUES
(gen_random_uuid(), '0b0b03ee-8dc8-42d6-8389-c483561d60ee', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-10 09:00:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), '152c1b1d-3465-4d60-b89d-48b9c3450692', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-09 10:00:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), '18634450-2c1a-44cb-8ea4-73c3f73aa758', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-08 11:00:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), '46d002ed-e1ee-45cc-9ce9-c2491294f9dc', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-07 09:30:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), '4d24677f-4a26-4dc8-9c02-29ee1f7c9d52', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-06 10:30:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), '77e64307-5040-4928-9cbe-9ada64c3a3d9', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-05 11:30:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), '7e12f3f5-23d9-4112-a6d7-984aadb06607', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-04 09:45:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), 'd58df550-a1f1-4461-b1ea-29d97343dc5f', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-03 10:45:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), 'db2a9ea5-7695-4e39-bbe8-c42b60282c4d', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-02 11:45:00', 450, 'Fresh AB- donation'),
(gen_random_uuid(), 'eff06537-8a72-4c09-906f-19238d508a43', '6c74bb6b-d016-4975-8a9b-bb9fd408d5ab', '2025-11-01 09:15:00', 450, 'Fresh AB- donation');

-- Verification query to check the inserted donations by blood type
SELECT 
    don.abo_group,
    don.rh_factor,
    CONCAT(don.abo_group, don.rh_factor) as blood_type,
    COUNT(*) as donation_count,
    MIN(d.donation_timestamp) as earliest_timestamp,
    MAX(d.donation_timestamp) as latest_timestamp
FROM public.donations d
JOIN public.donors don ON d.donor_id = don.donor_id
WHERE d.donation_timestamp >= '2025-11-01'
GROUP BY don.abo_group, don.rh_factor
ORDER BY don.abo_group, don.rh_factor;

-- Check total recent donations
SELECT COUNT(*) as total_fresh_donations
FROM public.donations
WHERE donation_timestamp >= '2025-11-01';
