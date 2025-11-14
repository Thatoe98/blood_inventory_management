-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.campaigns (
  campaign_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  hospital_id uuid NOT NULL,
  name character varying NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text NOT NULL,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  total_units_collected integer DEFAULT 0,
  CONSTRAINT campaigns_pkey PRIMARY KEY (campaign_id),
  CONSTRAINT campaigns_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(hospital_id)
);
CREATE TABLE public.donations (
  donation_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  donor_id uuid NOT NULL,
  hospital_id uuid NOT NULL,
  campaign_id uuid,
  donation_timestamp timestamp without time zone DEFAULT now(),
  quantity_ml integer DEFAULT 450 CHECK (quantity_ml > 0),
  hemoglobin_level numeric,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT donations_pkey PRIMARY KEY (donation_id),
  CONSTRAINT donations_donor_id_fkey FOREIGN KEY (donor_id) REFERENCES public.donors(donor_id),
  CONSTRAINT donations_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(hospital_id),
  CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(campaign_id)
);
CREATE TABLE public.donors (
  donor_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  date_of_birth date NOT NULL,
  sex character varying CHECK (sex::text = ANY (ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying]::text[])),
  phone_number character varying NOT NULL UNIQUE,
  email character varying UNIQUE,
  abo_group character varying NOT NULL CHECK (abo_group::text = ANY (ARRAY['A'::character varying, 'B'::character varying, 'AB'::character varying, 'O'::character varying]::text[])),
  rh_factor character varying NOT NULL CHECK (rh_factor::text = ANY (ARRAY['+'::character varying, '-'::character varying]::text[])),
  last_donation_date date,
  city character varying,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT donors_pkey PRIMARY KEY (donor_id)
);
CREATE TABLE public.hospitals (
  hospital_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  type character varying,
  phone character varying NOT NULL,
  email character varying,
  address text NOT NULL,
  city character varying NOT NULL,
  state character varying NOT NULL,
  postal_code character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  passkey character varying UNIQUE,
  CONSTRAINT hospitals_pkey PRIMARY KEY (hospital_id)
);
CREATE TABLE public.inventory (
  inventory_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  donation_id uuid NOT NULL UNIQUE,
  hospital_id uuid NOT NULL,
  number_of_units integer DEFAULT 1 CHECK (number_of_units > 0),
  collection_ts timestamp without time zone NOT NULL,
  expiry_ts timestamp without time zone NOT NULL,
  status character varying DEFAULT 'Available'::character varying CHECK (status::text = ANY (ARRAY['Available'::character varying, 'Reserved'::character varying, 'Issued'::character varying, 'Expired'::character varying, 'Discarded'::character varying]::text[])),
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT inventory_pkey PRIMARY KEY (inventory_id),
  CONSTRAINT inventory_donation_id_fkey FOREIGN KEY (donation_id) REFERENCES public.donations(donation_id),
  CONSTRAINT inventory_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(hospital_id)
);
CREATE TABLE public.patients (
  patient_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  hospital_id uuid NOT NULL,
  case_no character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  date_of_birth date NOT NULL,
  sex character varying CHECK (sex::text = ANY (ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying]::text[])),
  abo_group character varying NOT NULL CHECK (abo_group::text = ANY (ARRAY['A'::character varying, 'B'::character varying, 'AB'::character varying, 'O'::character varying]::text[])),
  rh_factor character varying NOT NULL CHECK (rh_factor::text = ANY (ARRAY['+'::character varying, '-'::character varying]::text[])),
  diagnosis text,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (patient_id),
  CONSTRAINT patients_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(hospital_id)
);