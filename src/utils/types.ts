
export type UserRole = "manufacturer" | "distributor" | "pharmacist" | "doctor";

export interface UserDetails {
  role: UserRole;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  businessName: string;
  govtCredential: string;
}
