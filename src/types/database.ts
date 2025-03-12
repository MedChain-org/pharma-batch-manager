// Define types for the database tables
export interface Drug {
  drug_id: string;
  name: string;
  manufacturer: string;
  manufacture_date: string;
  expiry_date: string;
  batch_number: string;
  blockchain_tx_id: string;
  timestamp: string;
}

export interface DrugStatusUpdate {
  id: string;
  drug_id: string;
  status: "manufactured" | "in_transit" | "delivered" | "dispensed";
  location: string;
  updated_by: string;
  blockchain_tx_id: string;
  timestamp: string;
}

export interface Shipment {
  shipment_id: string;
  drug_ids: string[];
  sender: string;
  receiver: string;
  status: "pending" | "in_transit" | "delivered";
  ship_date: string;
  blockchain_tx_id: string;
  timestamp: string;
}

export interface ShipmentStatusUpdate {
  id: string;
  shipment_id: string;
  status: "pending" | "in_transit" | "delivered";
  location: string;
  updated_by: string;
  blockchain_tx_id: string;
  timestamp: string;
}

export interface Prescription {
  prescription_id: string;
  patient_id: string;
  doctor_id: string;
  drug_ids: string[];
  issue_date: string;
  expiry_date: string;
  timestamp: string;
  dispensed: boolean;
  dispensed_by: string | null;
  dispensed_at: string | null;
  blockchain_tx_id: string | null;
  notes: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "manufacturer" | "distributor" | "pharmacist" | "doctor";
  active: boolean;
  created_at: string;
}

export interface HealthCheck {
  id: string;
  status: string;
  timestamp: string;
} 