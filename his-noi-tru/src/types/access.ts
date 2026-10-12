export type AccessStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export type PermissionLevel = 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';

export interface AccessGrant {
  id: string;
  patientId: string;
  patientPhid: string;
  doctorAddress: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  grantedAt: string;
  expiresAt: string;
  permissionLevel: PermissionLevel;
  status: AccessStatus;
  grantTxHash: string;
  revokeTxHash?: string;
  revokedAt?: string;
  revokedReason?: string;
}

export interface AccessRequest {
  id: string;
  patientId: string;
  patientPhid: string;
  patientName: string;
  doctorAddress: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  requestedAt: string;
  reason: string;
  durationHours: number;
  permissionRequested: PermissionLevel;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  respondedAt?: string;
}

export interface HospitalOrganization {
  id: string;
  name: string;
  code: string;
  walletAddress: string;
  tier: 'Tuyến Trung Ương' | 'Tuyến Tỉnh / Thành Phố' | 'Tuyến Huyện';
  status: 'WHITELISTED' | 'PENDING' | 'REVOKED';
  joinedDate: string;
  contactEmail: string;
  totalDoctors: number;
}
