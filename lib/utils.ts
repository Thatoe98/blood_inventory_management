// Date formatting utilities
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function formatDateReadable(date: string | Date): string {
  if (!date) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('en-US', options);
}

export function formatDateTime(datetime: string | Date): string {
  if (!datetime) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(datetime).toLocaleString('en-US', options);
}

// Age calculation
export function calculateAge(dateOfBirth: string | Date): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Days since last donation
export function daysSinceLastDonation(lastDonationDate: string | Date | null): number | null {
  if (!lastDonationDate) return null;
  
  const lastDonation = new Date(lastDonationDate);
  const today = new Date();
  const daysSince = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysSince;
}

// Stock level utilities
export function getStockLevelClass(units: number, threshold: number = 10): string {
  if (units < 5) return 'danger';
  if (units < threshold) return 'warning';
  return 'success';
}

export function getStockLevelText(units: number, threshold: number = 10): string {
  if (units < 5) return 'Critical';
  if (units < threshold) return 'Low';
  return 'Good';
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAge(dateOfBirth: string, minAge: number = 18, maxAge: number = 65): boolean {
  const age = calculateAge(dateOfBirth);
  return age >= minAge && age <= maxAge;
}
