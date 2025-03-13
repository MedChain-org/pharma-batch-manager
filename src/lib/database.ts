import { supabase } from './supabase';
import { 
  Drug, 
  DrugStatusUpdate, 
  Shipment, 
  ShipmentStatusUpdate, 
  Prescription,
  User
} from '@/types/database';

// Manufacturer functions
export async function fetchDrugs() {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching drugs:', error);
    return [];
  }
  
  return data as Drug[];
}

export async function fetchDrugsByManufacturer(manufacturerId: string) {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .eq('manufacturer', manufacturerId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching drugs by manufacturer:', error);
    return [];
  }
  
  return data as Drug[];
}

export async function addDrug(drug: Omit<Drug, 'drug_id' | 'timestamp' | 'blockchain_tx_id'>) {
  // Generate a unique ID for the drug
  const drug_id = `drug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('drugs')
    .insert([
      { 
        ...drug,
        drug_id,
        blockchain_tx_id: 'pending',
        timestamp: new Date().toISOString()
      }
    ])
    .select();
  
  if (error) {
    console.error('Error adding drug:', error);
    return null;
  }
  
  // Add initial status update
  if (data && data[0]) {
    await addDrugStatusUpdate({
      drug_id: data[0].drug_id,
      status: 'manufactured',
      location: 'Manufacturing Facility',
      updated_by: drug.manufacturer
    });
  }
  
  return data ? data[0] as Drug : null;
}

export async function addDrugStatusUpdate(
  statusUpdate: Pick<DrugStatusUpdate, 'drug_id' | 'status' | 'location' | 'updated_by'>
) {
  // Check if user is authenticated
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    console.error('User not authenticated');
    return null;
  }

  // Ensure updated_by matches the authenticated user's ID
  if (session.data.session.user.id !== statusUpdate.updated_by) {
    console.error('Updated_by must match the authenticated user');
    return null;
  }

  const { data, error } = await supabase
    .from('drug_status_updates')
    .insert([
      {
        ...statusUpdate,
        blockchain_tx_id: 'pending',
        timestamp: new Date().toISOString()
      }
    ])
    .select();
  
  if (error) {
    console.error('Error adding drug status update:', error);
    return null;
  }
  
  return data ? data[0] as DrugStatusUpdate : null;
}

export async function fetchDrugStatusUpdates(drugId: string) {
  const { data, error } = await supabase
    .from('drug_status_updates')
    .select('*')
    .eq('drug_id', drugId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching drug status updates:', error);
    return [];
  }
  
  return data as DrugStatusUpdate[];
}

// Distributor functions
export async function fetchShipments() {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching shipments:', error);
    return [];
  }
  
  return data as Shipment[];
}

export async function fetchShipmentsByDistributor(distributorId: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .or(`sender.eq.${distributorId},receiver.eq.${distributorId}`)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching shipments by distributor:', error);
    return [];
  }
  
  return data as Shipment[];
}

export async function addShipment(shipment: Omit<Shipment, 'shipment_id' | 'timestamp' | 'blockchain_tx_id'>) {
  // Generate a unique ID for the shipment
  const shipment_id = `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('shipments')
    .insert([
      { 
        ...shipment,
        shipment_id,
        blockchain_tx_id: 'pending',
        timestamp: new Date().toISOString()
      }
    ])
    .select();
  
  if (error) {
    console.error('Error adding shipment:', error);
    return null;
  }
  
  // Add initial status update
  if (data && data[0]) {
    await addShipmentStatusUpdate({
      shipment_id: data[0].shipment_id,
      status: 'pending',
      location: 'Distribution Center',
      updated_by: shipment.sender
    });
  }
  
  return data ? data[0] as Shipment : null;
}

export async function addShipmentStatusUpdate(
  statusUpdate: Pick<ShipmentStatusUpdate, 'shipment_id' | 'status' | 'location' | 'updated_by'>
) {
  const { data, error } = await supabase
    .from('shipment_status_updates')
    .insert([
      {
        ...statusUpdate,
        blockchain_tx_id: 'pending',
        timestamp: new Date().toISOString()
      }
    ])
    .select();
  
  if (error) {
    console.error('Error adding shipment status update:', error);
    return null;
  }
  
  return data ? data[0] as ShipmentStatusUpdate : null;
}

export async function updateShipmentStatus(
  shipmentId: string, 
  status: ShipmentStatusUpdate['status'],
  location: string,
  updatedBy: string
) {
  // Update shipment status
  const { error: shipmentError } = await supabase
    .from('shipments')
    .update({ status })
    .eq('shipment_id', shipmentId);
  
  if (shipmentError) {
    console.error('Error updating shipment status:', shipmentError);
    return false;
  }
  
  // Add status update
  const statusUpdate = await addShipmentStatusUpdate({
    shipment_id: shipmentId,
    status,
    location,
    updated_by: updatedBy
  });
  
  return !!statusUpdate;
}

// Pharmacist functions
export async function fetchPrescriptions() {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }
  
  return data as Prescription[];
}

export async function updatePrescriptionDispensedStatus(
  prescriptionId: string,
  dispensed: boolean,
  dispensedBy: string | null = null
) {
  const { error } = await supabase
    .from('prescriptions')
    .update({ 
      dispensed, 
      dispensed_by: dispensedBy,
      dispensed_at: dispensed ? new Date().toISOString() : null
    })
    .eq('prescription_id', prescriptionId);
  
  if (error) {
    console.error('Error updating prescription dispensed status:', error);
    return false;
  }
  
  return true;
}

// Doctor functions
export async function addPrescription(prescription: Omit<Prescription, 'prescription_id' | 'timestamp' | 'dispensed' | 'dispensed_by' | 'dispensed_at'>) {
  // Generate a unique ID for the prescription
  const prescription_id = `presc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('prescriptions')
    .insert([
      { 
        ...prescription,
        prescription_id,
        timestamp: new Date().toISOString(),
        dispensed: false,
        dispensed_by: null,
        dispensed_at: null
      }
    ])
    .select();
  
  if (error) {
    console.error('Error adding prescription:', error);
    return null;
  }
  
  return data ? data[0] as Prescription : null;
}

export async function fetchPrescriptionsByDoctor(doctorId: string) {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching prescriptions by doctor:', error);
    return [];
  }
  
  return data as Prescription[];
}

// User functions
export async function fetchUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data as User;
}

export async function fetchUsersByRole(role: User['role']) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .eq('active', true);
  
  if (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
  
  return data as User[];
}

export async function fetchPatientByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('role', 'patient')
    .eq('active', true)
    .single();
  
  if (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
  
  return data;
}

export async function fetchManufacturerById(manufacturerId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', manufacturerId)
    .eq('role', 'manufacturer')
    .eq('active', true)
    .single();
  
  if (error) {
    console.error('Error fetching manufacturer:', error);
    return null;
  }
  
  return data as User;
}