export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  walletAddress?: string;
  cccd?: string; // 12-digit citizen ID
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  createdAt: string;
}

export interface PatientProfile extends User {
  phid: string; // EMR Personal Health Identifier e.g. PHID-VN-2026-8901
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  chronicDiseases: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceCardNumber?: string;
}

export interface DoctorProfile extends User {
  doctorId: string; // e.g. BS-TIM-01
  specialty: string;
  hospitalName: string;
  licenseNumber: string;
  licenseFileUrl?: string;
  licenseFileName?: string;
  hospitalWalletAddress?: string;
  isVerifiedOnChain: boolean;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface EIP712LoginMessage {
  wallet: string;
  nonce: string;
  issuedAt: number;
  statement: string;
}
