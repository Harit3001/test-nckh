export interface PrescriptionItem {
  id: string;
  drugName: string;
  activeSubstance: string;
  dosage: string; // e.g. 500mg
  unit: string;   // e.g. Viên, Ống, Lọ
  quantity: number;
  instructions: string; // Sáng 1, Chiều 1 sau ăn
}

export interface AttachmentFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  ipfsHash: string; // Simulated IPFS CID e.g. QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco
  encryptedHash: string; // AES-256 ciphertext hash
  encryptedDataPreview?: string; // Base64 data preview
  encryptionKeyStatus: 'ENCRYPTED_AES256' | 'DECRYPTED_CLIENT';
  decryptedDataUrl?: string; // Decrypted data for instant preview
}

export interface ProgressionNote {
  id: string;
  recordId: string;
  timestamp: string;
  doctorName: string;
  doctorId: string;
  doctorAddress: string;
  vitalSigns: {
    bloodPressure: string; // e.g. 120/80 mmHg
    heartRate: number;      // bpm
    temperature: number;    // °C
    spO2: number;          // %
  };
  clinicalEvolution: string; // Diễn tiến lâm sàng
  treatmentCare: string;     // Y lệnh chăm sóc / điều trị
  parentHash: string;        // Hash of previous record/progression state (append-only chain)
  currentHash: string;       // SHA-256 of this entry + parentHash
  txHash: string;            // On-chain transaction hash
  blockNumber: number;
}

export interface MedicalRecord {
  id: string;
  recordCode: string; // e.g. EMR-2026-0042
  patientId: string;
  patientName: string;
  patientPhid: string;
  patientCccd: string;
  doctorId: string;
  doctorName: string;
  doctorAddress: string;
  hospitalName: string;
  department: string; // Chuyên khoa
  examinationDate: string;
  symptoms: string; // Triệu chứng lâm sàng
  physicalExamination: string; // Khám thực thể
  diagnosis: string; // Chẩn đoán chính
  icd10Code: string; // Mã ICD-10 e.g. I10 (Tăng huyết áp)
  secondaryDiagnosis?: string;
  doctorAdvice: string; // Lời dặn của bác sĩ
  prescriptions: PrescriptionItem[];
  attachments: AttachmentFile[];
  progressions: ProgressionNote[];
  
  // Blockchain Anchor Data
  recordHash: string; // SHA-256 digest of record payload
  parentHash?: string;
  version: number;
  txHash: string;
  blockNumber: number;
  blockTimestamp: string;
  onChainStatus: 'CONFIRMED' | 'PENDING' | 'TAMPERED_WARNING';
  network: string; // e.g. "Ethereum Sepolia (Mock)"
}
