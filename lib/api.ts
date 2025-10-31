import { supabase } from './supabase';
import type { 
  Donor, 
  DonorWithEligibility, 
  Hospital, 
  Campaign, 
  Patient, 
  Donation,
  Inventory,
  InventorySummary,
  DashboardStats
} from './types';

// ===== DONORS =====
export async function fetchDonors(): Promise<DonorWithEligibility[]> {
  const { data, error } = await supabase
    .from('donors_with_eligibility')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(donor => ({
    ...donor,
    full_name: `${donor.first_name} ${donor.last_name}`,
    blood_type: `${donor.abo_group}${donor.rh_factor}`,
    phone: donor.phone_number,
    is_eligible: donor.calculated_eligibility === 'Eligible',
    eligibility_status: donor.calculated_eligibility,
    last_donation: donor.last_donation_date
  }));
}

export async function createDonor(donor: Partial<Donor>) {
  const { data, error } = await supabase
    .from('donors')
    .insert(donor)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDonor(id: string, donor: Partial<Donor>) {
  const { data, error } = await supabase
    .from('donors')
    .update(donor)
    .eq('donor_id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteDonor(id: string) {
  const { error } = await supabase
    .from('donors')
    .delete()
    .eq('donor_id', id);
  
  if (error) throw error;
}

// ===== HOSPITALS =====
export async function fetchHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createHospital(hospital: Partial<Hospital>) {
  const { data, error } = await supabase
    .from('hospitals')
    .insert(hospital)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateHospital(id: string, hospital: Partial<Hospital>) {
  const { data, error } = await supabase
    .from('hospitals')
    .update(hospital)
    .eq('hospital_id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteHospital(id: string) {
  const { error } = await supabase
    .from('hospitals')
    .delete()
    .eq('hospital_id', id);
  
  if (error) throw error;
}

// ===== CAMPAIGNS =====
export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      hospitals (name, phone)
    `)
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(campaign => ({
    ...campaign,
    hospital_name: campaign.hospitals?.name || 'N/A'
  }));
}

export async function createCampaign(campaign: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, campaign: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(campaign)
    .eq('campaign_id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('campaign_id', id);
  
  if (error) throw error;
}

// ===== PATIENTS =====
export async function fetchPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      hospitals (name, phone)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(patient => ({
    ...patient,
    hospital_name: patient.hospitals?.name || 'N/A'
  }));
}

export async function createPatient(patient: Partial<Patient>) {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePatient(id: string, patient: Partial<Patient>) {
  const { data, error } = await supabase
    .from('patients')
    .update(patient)
    .eq('patient_id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePatient(id: string) {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('patient_id', id);
  
  if (error) throw error;
}

// ===== DONATIONS =====
export async function fetchDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select(`
      *,
      donors (first_name, last_name, phone_number, abo_group, rh_factor),
      hospitals (name),
      campaigns (name)
    `)
    .order('donation_timestamp', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(donation => ({
    ...donation,
    donor_name: donation.donors ? `${donation.donors.first_name} ${donation.donors.last_name}` : 'Unknown',
    blood_type: donation.donors ? `${donation.donors.abo_group}${donation.donors.rh_factor}` : 'N/A',
    hospital_name: donation.hospitals?.name || 'N/A',
    campaign_name: donation.campaigns?.name || null
  }));
}

export async function createDonation(donation: Partial<Donation>) {
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDonation(id: string, donation: Partial<Donation>) {
  const { data, error } = await supabase
    .from('donations')
    .update(donation)
    .eq('donation_id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteDonation(id: string) {
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('donation_id', id);
  
  if (error) throw error;
}

// ===== INVENTORY =====`nexport async function fetchInventory(): Promise<Inventory[]> {`n  const { data, error } = await supabase`n    .from('inventory_with_blood_type')`n    .select('*')`n    .order('expiry_ts', { ascending: true });`n`n  if (error) throw error;`n  return data || [];`n}`n`nexport async function updateInventory(id: string, inventoryData: Partial<Inventory>): Promise<void> {`n  const { error } = await supabase`n    .from('inventory')`n    .update(inventoryData)`n    .eq('inventory_id', id);`n`n  if (error) throw error;`n}`n
export async function fetchInventorySummary(): Promise<InventorySummary[]> {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const { data: inventory, error } = await supabase
    .from('inventory_with_blood_type')
    .select('*');
  
  if (error) throw error;
  
  const summary = bloodTypes.map(bloodType => {
    const units = (inventory || []).filter((item: any) => item.blood_type === bloodType);
    const totalUnits = units.length;
    const availableUnits = units.filter((u: any) => u.status === 'Available').length;
    const reservedUnits = units.filter((u: any) => u.status === 'Reserved').length;
    const minimum_threshold = 10;
    
    const lastUpdated = units.length > 0 
      ? units.reduce((latest: Date, item: any) => {
          const itemDate = new Date(item.created_at);
          return itemDate > latest ? itemDate : latest;
        }, new Date(0))
      : new Date();
    
    return {
      blood_type: bloodType,
      total_units: totalUnits,
      available_units: availableUnits,
      reserved_units: reservedUnits,
      minimum_threshold,
      last_updated: lastUpdated.toISOString()
    };
  });
  
  return summary;
}

// ===== DASHBOARD STATS =====
export async function getDashboardStats(): Promise<DashboardStats> {
  const [donors, donations, inventory] = await Promise.all([
    supabase.from('donors_with_eligibility').select('calculated_eligibility'),
    supabase.from('donations').select('test_result'),
    fetchInventorySummary()
  ]);
  
  const totalDonors = donors.data?.length || 0;
  const eligibleDonors = donors.data?.filter(d => d.calculated_eligibility === 'Eligible').length || 0;
  const totalDonations = donations.data?.length || 0;
  const acceptedDonations = donations.data?.filter(d => d.test_result === 'Accepted').length || 0;
  
  const totalInventory = inventory.reduce((sum, item) => sum + item.total_units, 0);
  const availableUnits = inventory.reduce((sum, item) => sum + item.available_units, 0);
  const lowStockTypes = inventory.filter(item => item.available_units < item.minimum_threshold).length;
  const criticalStockTypes = inventory.filter(item => item.available_units < 5).length;
  
  return {
    totalDonors,
    eligibleDonors,
    totalDonations,
    acceptedDonations,
    totalInventory,
    availableUnits,
    lowStockTypes,
    criticalStockTypes
  };
}

