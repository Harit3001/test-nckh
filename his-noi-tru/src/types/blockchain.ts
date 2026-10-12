export type TxStepStatus = 'SUBMITTING' | 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface BlockchainTransaction {
  txHash: string;
  action: 'ANCHOR_RECORD' | 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'APPEND_PROGRESSION' | 'WHITELIST_HOSPITAL';
  from: string;
  to: string;
  dataHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  timestamp: string;
  status: TxStepStatus;
  details?: string;
}

export interface OnChainAuditLog {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: 'RECORD_CREATED' | 'RECORD_ACCESSED' | 'PROGRESSION_APPENDED' | 'ACCESS_GRANTED' | 'ACCESS_REVOKED' | 'INTEGRITY_VERIFIED';
  operatorName: string;
  operatorAddress: string;
  operatorRole: string;
  recordCode: string;
  patientPhid: string;
  stateHash: string;
  notes: string;
}

export interface SystemAuditEntry {
  id: string;
  timestamp: string;
  actionType: 'VIEW_RECORD' | 'CREATE_RECORD' | 'UPDATE_PROGRESSION' | 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'EXPORT_PDF';
  userEmail: string;
  userRole: string;
  ipAddress: string;
  resourceId?: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  level: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  title: string;
  description: string;
  timestamp: string;
  targetAccount: string;
  ipAddress: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  suggestedAction: string;
}
