// Database Types
export interface Hospital {
  hospital_id: string;
  name: string;
  type?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  passkey?: string;
  created_at: string;
}

export interface Donor {
  donor_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: 'Male' | 'Female' | 'Other';
  phone_number: string;
  email?: string;
  abo_group: 'A' | 'B' | 'AB' | 'O';
  rh_factor: '+' | '-';
  last_donation_date?: string;
  city?: string;
  eligibility_status: 'Eligible' | 'Ineligible' | 'Deferred';
  notes?: string;
  created_at: string;
}

export interface DonorWithEligibility extends Donor {
  calculated_eligibility: 'Eligible' | 'Deferred';
  days_since_last_donation?: number;
  days_until_eligible?: number;
  full_name?: string;
  blood_type?: string;
  is_eligible?: boolean;
}

export interface Campaign {
  campaign_id: string;
  hospital_id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  notes?: string;
  total_units_collected?: number;
  created_at: string;
  hospital_name?: string;
  hospitals?: { name: string };
}

export interface Patient {
  patient_id: string;
  hospital_id: string;
  case_no: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: 'Male' | 'Female' | 'Other';
  abo_group: 'A' | 'B' | 'AB' | 'O';
  rh_factor: '+' | '-';
  diagnosis?: string;
  notes?: string;
  created_at: string;
  hospital_name?: string;
  hospitals?: { name: string };
}

export interface Donation {
  donation_id: string;
  donor_id: string;
  hospital_id: string;
  campaign_id?: string;
  donation_timestamp: string;
  test_result: 'Pending' | 'Accepted' | 'Rejected';
  quantity_ml: number;
  hemoglobin_level?: number;
  notes?: string;
  created_at: string;
  donor_name?: string;
  blood_type?: string;
  hospital_name?: string;
  campaign_name?: string;
  donors?: {
    first_name: string;
    last_name: string;
    abo_group: string;
    rh_factor: string;
  };
  hospitals?: { name: string };
  campaigns?: { name: string };
}

export interface Inventory {
  inventory_id: string;
  donation_id: string;
  hospital_id: string;
  number_of_units: number;
  collection_ts: string;
  expiry_ts: string;
  status: 'Available' | 'Reserved' | 'Issued' | 'Expired' | 'Discarded';
  notes?: string;
  created_at: string;
  blood_type?: string;
  abo_group?: string;
  rh_factor?: string;
}

export interface InventorySummary {
  blood_type: string;
  total_units: number;
  available_units: number;
  reserved_units: number;
  minimum_threshold: number;
  last_updated: string;
}

export interface Transfusion {
  transfusion_id: string;
  patient_id: string;
  inventory_id: string;
  hospital_id: string;
  transfusion_date: string;
  units_transfused: number;
  notes?: string;
  created_at: string;
  patient_name?: string;
  blood_type?: string;
  hospital_name?: string;
  case_no?: string;
  patients?: {
    first_name: string;
    last_name: string;
    case_no: string;
    abo_group: string;
    rh_factor: string;
  };
  hospitals?: { name: string };
  inventory?: {
    donations?: {
      donors?: {
        abo_group: string;
        rh_factor: string;
      };
    };
  };
}

export interface DashboardStats {
  totalDonors: number;
  eligibleDonors: number;
  totalDonations: number;
  acceptedDonations: number;
  totalInventory: number;
  availableUnits: number;
  lowStockTypes: number;
  criticalStockTypes: number;
}
