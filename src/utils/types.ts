
export type UserRole = 'manufacturer' | 'distributor' | 'pharmacist' | 'doctor';

export interface UserDetails {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  businessName?: string; // Company/Hospital/Pharmacy name
  certificate?: File | null; // Certificate file upload
  govtCredential?: string; // Government credential ID
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface DrugBatch {
  id: string;
  name: string;
  manufacturer: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  status: 'in-production' | 'quality-check' | 'ready' | 'shipped' | 'delivered';
}

export interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  doctor: string;
  hospital: string;
  medications: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  date: string;
  status: 'active' | 'dispensed' | 'expired';
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  items: DrugBatch[];
  departureDate: string;
  estimatedArrival: string;
  status: 'pending' | 'in-transit' | 'delivered';
}
