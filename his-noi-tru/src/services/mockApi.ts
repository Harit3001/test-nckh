import {
  INITIAL_PATIENT,
  INITIAL_DOCTORS,
  INITIAL_RECORDS,
  INITIAL_GRANTS,
  INITIAL_REQUESTS,
  INITIAL_HOSPITALS,
  INITIAL_ONCHAIN_AUDIT,
  INITIAL_SYSTEM_LOGS,
  INITIAL_SECURITY_ALERTS,
} from './mockData';
import { PatientProfile, DoctorProfile, User } from '../types/auth';
import { MedicalRecord, ProgressionNote, PrescriptionItem, AttachmentFile } from '../types/emr';
import { AccessGrant, AccessRequest, HospitalOrganization } from '../types/access';
import { OnChainAuditLog, SystemAuditEntry, SecurityAlert } from '../types/blockchain';
import { computeRecordHash, generateTxHash, calculateSHA256 } from './web3Service';

const DB_KEY = 'EMR_CHAIN_LOCAL_DATABASE_v1';

interface DatabaseState {
  patient: PatientProfile;
  doctors: DoctorProfile[];
  records: MedicalRecord[];
  grants: AccessGrant[];
  requests: AccessRequest[];
  hospitals: HospitalOrganization[];
  onchainAudit: OnChainAuditLog[];
  systemLogs: SystemAuditEntry[];
  securityAlerts: SecurityAlert[];
  walletNonces: Record<string, string>;
  userPasswords: Record<string, string>;
}

export const DEFAULT_PASSWORDS: Record<string, string> = {
  'nguyenvanan@gmail.com': 'password123',
  'tranminhtuan@bachmai.vn': 'password123',
  'lequynhmai@choray.vn': 'password123',
  'phamgiahuy@umc.edu.vn': 'password123',
  'hoangtuananh@bvcr.vn': 'password123',
  'admin@hospital.vn': 'admin123',
  'superadmin@moh.gov.vn': 'super123',
  'admin': 'admin123',
  'superadmin': 'super123',
};

function loadDatabase(): DatabaseState {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.userPasswords) {
        parsed.userPasswords = { ...DEFAULT_PASSWORDS };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load local DB', e);
  }

  const initial: DatabaseState = {
    patient: INITIAL_PATIENT,
    doctors: INITIAL_DOCTORS,
    records: INITIAL_RECORDS,
    grants: INITIAL_GRANTS,
    requests: INITIAL_REQUESTS,
    hospitals: INITIAL_HOSPITALS,
    onchainAudit: INITIAL_ONCHAIN_AUDIT,
    systemLogs: INITIAL_SYSTEM_LOGS,
    securityAlerts: INITIAL_SECURITY_ALERTS,
    walletNonces: {},
    userPasswords: { ...DEFAULT_PASSWORDS },
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseState) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save local DB', e);
  }
}

// Simulated network delay
const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export const MockApi = {
  // Reset database to initial state
  resetDatabase() {
    localStorage.removeItem(DB_KEY);
    return loadDatabase();
  },

  /* ---------------- AUTH ---------------- */
  async loginWithEmail(email: string, pass: string): Promise<{ token: string; user: User }> {
    await delay(300);
    const db = loadDatabase();
    if (!db.userPasswords) {
      db.userPasswords = { ...DEFAULT_PASSWORDS };
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const rawPass = (pass || '').trim();

    // Check Admin
    if (normalizedEmail === 'admin@hospital.vn' || normalizedEmail === 'admin') {
      const correctPass = db.userPasswords[normalizedEmail] || 'admin123';
      if (rawPass !== correctPass) {
        db.systemLogs.unshift({
          id: 'syslog-' + Date.now(),
          timestamp: new Date().toISOString(),
          actionType: 'LOGIN_FAILED',
          userEmail: email,
          userRole: 'ADMIN',
          ipAddress: '113.161.44.12',
          status: 'DENIED',
          metadata: { reason: 'SAI_MAT_KHAU' },
        });
        saveDatabase(db);
        throw new Error('Mật khẩu không chính xác cho tài khoản Quản trị viên (admin@hospital.vn)! Mật khẩu mặc định là: admin123');
      }

      db.systemLogs.unshift({
        id: 'syslog-' + Date.now(),
        timestamp: new Date().toISOString(),
        actionType: 'LOGIN_SUCCESS',
        userEmail: 'admin@hospital.vn',
        userRole: 'ADMIN',
        ipAddress: '113.161.44.12',
        status: 'SUCCESS',
      });
      saveDatabase(db);

      return {
        token: 'mock_jwt_admin_' + Date.now(),
        user: {
          id: 'admin-01',
          email: 'admin@hospital.vn',
          fullName: 'Quản Trị Viên Bệnh Viện Bạch Mai',
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: '2025-01-01',
        },
      };
    }

    // Check SuperAdmin
    if (normalizedEmail === 'superadmin@moh.gov.vn' || normalizedEmail === 'superadmin') {
      const correctPass = db.userPasswords[normalizedEmail] || 'super123';
      if (rawPass !== correctPass) {
        db.systemLogs.unshift({
          id: 'syslog-' + Date.now(),
          timestamp: new Date().toISOString(),
          actionType: 'LOGIN_FAILED',
          userEmail: email,
          userRole: 'SUPER_ADMIN',
          ipAddress: '113.161.44.12',
          status: 'DENIED',
          metadata: { reason: 'SAI_MAT_KHAU' },
        });
        saveDatabase(db);
        throw new Error('Mật khẩu không chính xác cho tài khoản SuperAdmin Bộ Y Tế! Mật khẩu mặc định là: super123');
      }

      db.systemLogs.unshift({
        id: 'syslog-' + Date.now(),
        timestamp: new Date().toISOString(),
        actionType: 'LOGIN_SUCCESS',
        userEmail: 'superadmin@moh.gov.vn',
        userRole: 'SUPER_ADMIN',
        ipAddress: '113.161.44.12',
        status: 'SUCCESS',
      });
      saveDatabase(db);

      return {
        token: 'mock_jwt_superadmin_' + Date.now(),
        user: {
          id: 'superadmin-01',
          email: 'superadmin@moh.gov.vn',
          fullName: 'Bộ Y Tế - Giám Sát Trưởng (SuperAdmin)',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          createdAt: '2025-01-01',
        },
      };
    }

    // Check Doctors (allow email or 'doctor' shortcut)
    const doc =
      db.doctors.find((d) => d.email.toLowerCase() === normalizedEmail) ||
      (normalizedEmail === 'doctor' ? db.doctors[0] : undefined);

    if (doc) {
      if (doc.status === 'PENDING_APPROVAL') {
        throw new Error(`Tài khoản Bác sĩ (${doc.fullName}) đang chờ Quản trị viên bệnh viện phê duyệt hồ sơ (PENDING_APPROVAL). Vui lòng liên hệ Admin BV!`);
      }
      if (doc.status === 'SUSPENDED') {
        throw new Error(`Tài khoản Bác sĩ (${doc.fullName}) đã bị tạm khóa do vi phạm chính sách bảo mật on-chain.`);
      }

      const correctPass = db.userPasswords[doc.email.toLowerCase()] || 'password123';
      if (rawPass !== correctPass) {
        db.systemLogs.unshift({
          id: 'syslog-' + Date.now(),
          timestamp: new Date().toISOString(),
          actionType: 'LOGIN_FAILED',
          userEmail: email,
          userRole: 'DOCTOR',
          ipAddress: '113.161.44.12',
          status: 'DENIED',
          metadata: { reason: 'SAI_MAT_KHAU' },
        });
        saveDatabase(db);
        throw new Error(`Mật khẩu không chính xác cho tài khoản Bác sĩ (${doc.email})! Vui lòng thử lại hoặc chọn "Quên mật khẩu".`);
      }

      db.systemLogs.unshift({
        id: 'syslog-' + Date.now(),
        timestamp: new Date().toISOString(),
        actionType: 'LOGIN_SUCCESS',
        userEmail: doc.email,
        userRole: 'DOCTOR',
        ipAddress: '113.161.44.12',
        status: 'SUCCESS',
      });
      saveDatabase(db);

      return { token: 'mock_jwt_doc_' + Date.now(), user: doc };
    }

    // Check Patient (allow email or 'patient' shortcut)
    if (
      db.patient.email.toLowerCase() === normalizedEmail ||
      normalizedEmail === 'patient'
    ) {
      const correctPass = db.userPasswords[db.patient.email.toLowerCase()] || 'password123';
      if (rawPass !== correctPass) {
        db.systemLogs.unshift({
          id: 'syslog-' + Date.now(),
          timestamp: new Date().toISOString(),
          actionType: 'LOGIN_FAILED',
          userEmail: email,
          userRole: 'PATIENT',
          ipAddress: '113.161.44.12',
          status: 'DENIED',
          metadata: { reason: 'SAI_MAT_KHAU' },
        });
        saveDatabase(db);
        throw new Error(`Mật khẩu không chính xác cho tài khoản Bệnh nhân (${db.patient.email})! Vui lòng thử lại hoặc chọn "Quên mật khẩu".`);
      }

      db.systemLogs.unshift({
        id: 'syslog-' + Date.now(),
        timestamp: new Date().toISOString(),
        actionType: 'LOGIN_SUCCESS',
        userEmail: db.patient.email,
        userRole: 'PATIENT',
        ipAddress: '113.161.44.12',
        status: 'SUCCESS',
      });
      saveDatabase(db);

      return { token: 'mock_jwt_pat_' + Date.now(), user: db.patient };
    }

    // Account not found in database
    db.systemLogs.unshift({
      id: 'syslog-' + Date.now(),
      timestamp: new Date().toISOString(),
      actionType: 'LOGIN_FAILED',
      userEmail: email,
      userRole: 'UNKNOWN',
      ipAddress: '113.161.44.12',
      status: 'DENIED',
      metadata: { reason: 'TAI_KHOAN_KHONG_TON_TAI' },
    });
    saveDatabase(db);

    throw new Error(`Tài khoản "${email}" không tồn tại trong hệ thống! Vui lòng kiểm tra lại địa chỉ email hoặc đăng ký tài khoản mới.`);
  },

  async getWalletNonce(walletAddress: string): Promise<string> {
    await delay(150);
    const db = loadDatabase();
    const nonce = 'EMR_NONCE_' + Math.floor(100000 + Math.random() * 900000);
    db.walletNonces[walletAddress.toLowerCase()] = nonce;
    saveDatabase(db);
    return nonce;
  },

  async loginWithWallet(walletAddress: string, signature: string): Promise<{ token: string; user: User }> {
    await delay(350);
    const db = loadDatabase();
    const normalized = walletAddress.toLowerCase();

    // Check if doctor
    const doc = db.doctors.find((d) => d.walletAddress?.toLowerCase() === normalized);
    if (doc) {
      return { token: 'mock_jwt_wallet_doc_' + Date.now(), user: doc };
    }

    // Default to patient with this wallet
    const patUser: PatientProfile = {
      ...db.patient,
      walletAddress,
    };
    db.patient = patUser;
    saveDatabase(db);

    return { token: 'mock_jwt_wallet_pat_' + Date.now(), user: patUser };
  },

  async registerPatient(data: {
    fullName: string;
    email: string;
    cccd: string;
    phone: string;
    password?: string;
  }): Promise<PatientProfile> {
    await delay(400);
    const db = loadDatabase();

    if (db.patient.email.toLowerCase() === data.email.toLowerCase()) {
      throw new Error(`Email "${data.email}" đã được đăng ký trên hệ thống! Vui lòng chọn đăng nhập hoặc dùng email khác.`);
    }
    if (db.patient.cccd === data.cccd) {
      throw new Error(`Số CCCD "${data.cccd}" đã được liên kết với một hồ sơ bệnh án khác!`);
    }

    const newPat: PatientProfile = {
      ...db.patient,
      id: 'pat-' + Date.now(),
      fullName: data.fullName.toUpperCase(),
      email: data.email,
      cccd: data.cccd,
      phone: data.phone,
      phid: 'PHID-VN-2026-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
    };
    db.patient = newPat;

    // Save custom password if provided
    if (data.password) {
      if (!db.userPasswords) db.userPasswords = { ...DEFAULT_PASSWORDS };
      db.userPasswords[data.email.trim().toLowerCase()] = data.password;
    }

    saveDatabase(db);
    return newPat;
  },

  async registerDoctor(data: {
    fullName: string;
    email: string;
    phone: string;
    doctorId: string;
    specialty: string;
    hospitalName: string;
    licenseNumber: string;
    licenseFileName?: string;
  }): Promise<DoctorProfile> {
    await delay(400);
    const db = loadDatabase();

    const existingEmail = db.doctors.find((d) => d.email.toLowerCase() === data.email.toLowerCase());
    if (existingEmail) {
      throw new Error(`Email Bác sĩ "${data.email}" đã tồn tại trên hệ thống! Vui lòng chọn đăng nhập hoặc dùng email khác.`);
    }

    const existingLicense = db.doctors.find((d) => d.licenseNumber === data.licenseNumber);
    if (existingLicense) {
      throw new Error(`Chứng chỉ hành nghề số "${data.licenseNumber}" đã được đăng ký bởi bác sĩ khác!`);
    }

    const newDoc: DoctorProfile = {
      id: 'doc-' + Date.now(),
      doctorId: data.doctorId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'DOCTOR',
      specialty: data.specialty,
      hospitalName: data.hospitalName,
      licenseNumber: data.licenseNumber,
      licenseFileName: data.licenseFileName || 'Chung_Chi_Hanh_Nghe.pdf',
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      walletAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      isVerifiedOnChain: false,
    };

    db.doctors.push(newDoc);
    saveDatabase(db);
    return newDoc;
  },

  async resetPassword(email: string): Promise<boolean> {
    await delay(350);
    const db = loadDatabase();
    const normalized = email.trim().toLowerCase();
    const exists =
      normalized === 'admin@hospital.vn' ||
      normalized === 'admin' ||
      normalized === 'superadmin@moh.gov.vn' ||
      normalized === 'superadmin' ||
      db.patient.email.toLowerCase() === normalized ||
      db.doctors.some((d) => d.email.toLowerCase() === normalized);

    if (!exists) {
      throw new Error(`Email "${email}" chưa được đăng ký trong hệ thống! Vui lòng kiểm tra lại.`);
    }
    return true;
  },

  async confirmResetPassword(email: string, newPass: string, otp?: string): Promise<boolean> {
    await delay(350);
    if (otp && otp.trim() !== '888999') {
      throw new Error('Mã OTP xác thực không chính xác! Vui lòng nhập mã OTP mẫu là: 888999.');
    }
    const db = loadDatabase();
    if (!db.userPasswords) db.userPasswords = { ...DEFAULT_PASSWORDS };
    db.userPasswords[email.trim().toLowerCase()] = newPass;
    saveDatabase(db);
    return true;
  },

  /* ---------------- PATIENT PROFILE ---------------- */
  async getPatientProfile(): Promise<PatientProfile> {
    await delay(120);
    return loadDatabase().patient;
  },

  async updatePatientMedicalInfo(info: {
    bloodGroup: PatientProfile['bloodGroup'];
    allergies: string[];
    chronicDiseases: string[];
    emergencyContact: PatientProfile['emergencyContact'];
  }): Promise<PatientProfile> {
    await delay(300);
    const db = loadDatabase();
    db.patient = {
      ...db.patient,
      ...info,
    };
    saveDatabase(db);
    return db.patient;
  },

  /* ---------------- MEDICAL RECORDS ---------------- */
  async getRecords(filters?: {
    keyword?: string;
    department?: string;
    dateRange?: [string, string];
  }): Promise<MedicalRecord[]> {
    await delay(180);
    const db = loadDatabase();
    let result = [...db.records];

    if (filters?.keyword) {
      const q = filters.keyword.toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.patientCccd.includes(q) ||
          r.patientPhid.toLowerCase().includes(q) ||
          r.recordCode.toLowerCase().includes(q) ||
          r.diagnosis.toLowerCase().includes(q)
      );
    }

    if (filters?.department) {
      result = result.filter((r) => r.department === filters.department);
    }

    if (filters?.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const [start, end] = filters.dateRange;
      result = result.filter((r) => r.examinationDate >= start && r.examinationDate <= end);
    }

    return result.sort((a, b) => new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime());
  },

  async getRecordById(id: string): Promise<MedicalRecord | undefined> {
    await delay(150);
    return loadDatabase().records.find((r) => r.id === id);
  },

  async createRecord(payload: {
    patientPhid: string;
    doctorName: string;
    doctorId: string;
    doctorAddress: string;
    hospitalName: string;
    department: string;
    symptoms: string;
    physicalExamination: string;
    diagnosis: string;
    icd10Code: string;
    doctorAdvice: string;
    prescriptions: PrescriptionItem[];
    attachments: AttachmentFile[];
  }): Promise<MedicalRecord> {
    await delay(450);
    const db = loadDatabase();
    const recordCode = `EMR-2026-${String(db.records.length + 1).padStart(4, '0')}`;
    const examDate = new Date().toISOString();

    const recordData = {
      recordCode,
      patientPhid: payload.patientPhid,
      diagnosis: payload.diagnosis,
      icd10Code: payload.icd10Code,
      symptoms: payload.symptoms,
      prescriptions: payload.prescriptions,
      examinationDate: examDate,
    };

    const recordHash = await computeRecordHash(recordData);
    const txHash = generateTxHash();
    const currentBlock = 19842000 + Math.floor(Math.random() * 500);

    const newRecord: MedicalRecord = {
      id: 'rec-' + Date.now(),
      recordCode,
      patientId: db.patient.id,
      patientName: db.patient.fullName,
      patientPhid: payload.patientPhid,
      patientCccd: db.patient.cccd || '001095012345',
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      doctorAddress: payload.doctorAddress,
      hospitalName: payload.hospitalName,
      department: payload.department,
      examinationDate: examDate,
      symptoms: payload.symptoms,
      physicalExamination: payload.physicalExamination,
      diagnosis: payload.diagnosis,
      icd10Code: payload.icd10Code,
      doctorAdvice: payload.doctorAdvice,
      prescriptions: payload.prescriptions,
      attachments: payload.attachments,
      progressions: [],
      recordHash,
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      version: 1,
      txHash,
      blockNumber: currentBlock,
      blockTimestamp: examDate,
      onChainStatus: 'CONFIRMED',
      network: 'Ethereum Sepolia (Mock Chain)',
    };

    db.records.unshift(newRecord);

    // Also add to on-chain audit trail
    db.onchainAudit.unshift({
      id: 'audit-' + Date.now(),
      txHash,
      blockNumber: currentBlock,
      timestamp: examDate,
      eventType: 'RECORD_CREATED',
      operatorName: payload.doctorName,
      operatorAddress: payload.doctorAddress,
      operatorRole: 'DOCTOR',
      recordCode,
      patientPhid: payload.patientPhid,
      stateHash: recordHash,
      notes: `Khởi tạo bệnh án ${recordCode} chuyên khoa ${payload.department}`,
    });

    db.systemLogs.unshift({
      id: 'syslog-' + Date.now(),
      timestamp: examDate,
      actionType: 'CREATE_RECORD',
      userEmail: payload.doctorName,
      userRole: 'DOCTOR',
      ipAddress: '192.168.1.15',
      resourceId: recordCode,
      status: 'SUCCESS',
    });

    saveDatabase(db);
    return newRecord;
  },

  async appendProgression(
    recordId: string,
    data: {
      doctorName: string;
      doctorId: string;
      doctorAddress: string;
      vitalSigns: ProgressionNote['vitalSigns'];
      clinicalEvolution: string;
      treatmentCare: string;
    }
  ): Promise<ProgressionNote> {
    await delay(400);
    const db = loadDatabase();
    const record = db.records.find((r) => r.id === recordId);
    if (!record) throw new Error('Không tìm thấy bệnh án.');

    const parentHash =
      record.progressions.length > 0
        ? record.progressions[record.progressions.length - 1].currentHash
        : record.recordHash;

    const timestamp = new Date().toISOString();
    const payloadForHash = {
      recordId,
      parentHash,
      vitalSigns: data.vitalSigns,
      clinicalEvolution: data.clinicalEvolution,
      treatmentCare: data.treatmentCare,
      timestamp,
    };

    const currentHash = await calculateSHA256(payloadForHash);
    const txHash = generateTxHash();
    const currentBlock = 19842500 + Math.floor(Math.random() * 200);

    const newProg: ProgressionNote = {
      id: 'prog-' + Date.now(),
      recordId,
      timestamp,
      doctorName: data.doctorName,
      doctorId: data.doctorId,
      doctorAddress: data.doctorAddress,
      vitalSigns: data.vitalSigns,
      clinicalEvolution: data.clinicalEvolution,
      treatmentCare: data.treatmentCare,
      parentHash,
      currentHash,
      txHash,
      blockNumber: currentBlock,
    };

    record.progressions.push(newProg);
    record.version += 1;

    // Add audit log
    db.onchainAudit.unshift({
      id: 'audit-' + Date.now(),
      txHash,
      blockNumber: currentBlock,
      timestamp,
      eventType: 'PROGRESSION_APPENDED',
      operatorName: data.doctorName,
      operatorAddress: data.doctorAddress,
      operatorRole: 'DOCTOR',
      recordCode: record.recordCode,
      patientPhid: record.patientPhid,
      stateHash: currentHash,
      notes: `Ghi chú diễn tiến điều trị mới (${record.progressions.length}) - Neo hash cha: ${parentHash.slice(0, 10)}...`,
    });

    saveDatabase(db);
    return newProg;
  },

  /* ---------------- TAMPER & INTEGRITY TESTING ---------------- */
  async tamperRecordForTesting(recordId: string, tamperedDiagnosis: string): Promise<MedicalRecord> {
    await delay(200);
    const db = loadDatabase();
    const record = db.records.find((r) => r.id === recordId);
    if (!record) throw new Error('Record not found');

    record.diagnosis = tamperedDiagnosis;
    record.onChainStatus = 'TAMPERED_WARNING';
    saveDatabase(db);
    return record;
  },

  async restoreRecordOriginal(recordId: string): Promise<MedicalRecord> {
    await delay(200);
    const db = loadDatabase();
    const initial = INITIAL_RECORDS.find((r) => r.id === recordId);
    const record = db.records.find((r) => r.id === recordId);
    if (record && initial) {
      record.diagnosis = initial.diagnosis;
      record.onChainStatus = 'CONFIRMED';
      saveDatabase(db);
      return record;
    }
    throw new Error('Cannot restore record');
  },

  async verifyRecordIntegrity(recordId: string): Promise<{
    isMatch: boolean;
    calculatedHash: string;
    onChainHash: string;
    txHash: string;
    blockNumber: number;
    details: string;
  }> {
    await delay(350);
    const db = loadDatabase();
    const record = db.records.find((r) => r.id === recordId);
    if (!record) throw new Error('Record not found');

    const canonicalData = {
      recordCode: record.recordCode,
      patientPhid: record.patientPhid,
      diagnosis: record.diagnosis,
      icd10Code: record.icd10Code,
      symptoms: record.symptoms,
      prescriptions: record.prescriptions,
      examinationDate: record.examinationDate,
    };

    const calculatedHash = await computeRecordHash(canonicalData);
    const isMatch = calculatedHash.toLowerCase() === record.recordHash.toLowerCase();

    return {
      isMatch,
      calculatedHash,
      onChainHash: record.recordHash,
      txHash: record.txHash,
      blockNumber: record.blockNumber,
      details: isMatch
        ? 'Dữ liệu toàn vẹn 100%. SHA-256 tính toán từ bản ghi hiện tại trùng khớp hoàn toàn với RecordHash neo trên Smart Contract.'
        : 'CẢNH BÁO NGUY HIỂM: Phát hiện dữ liệu bệnh án đã bị sửa đổi trái phép sau khi neo trên Blockchain! Hash tính toán không trùng khớp.',
    };
  },

  /* ---------------- ACCESS CONTROL ---------------- */
  async getAccessGrants(): Promise<AccessGrant[]> {
    await delay(150);
    return loadDatabase().grants;
  },

  async grantAccess(payload: {
    patientId: string;
    patientPhid: string;
    doctorAddress: string;
    doctorId: string;
    doctorName: string;
    hospitalName: string;
    durationHours: number;
    permissionLevel: AccessGrant['permissionLevel'];
  }): Promise<AccessGrant> {
    await delay(400);
    const db = loadDatabase();
    const now = new Date();
    const expires = new Date(now.getTime() + payload.durationHours * 60 * 60 * 1000);
    const txHash = generateTxHash();

    const newGrant: AccessGrant = {
      id: 'grant-' + Date.now(),
      patientId: payload.patientId,
      patientPhid: payload.patientPhid,
      doctorAddress: payload.doctorAddress,
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      hospitalName: payload.hospitalName,
      grantedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      permissionLevel: payload.permissionLevel,
      status: 'ACTIVE',
      grantTxHash: txHash,
    };

    db.grants.unshift(newGrant);

    // Audit log
    db.onchainAudit.unshift({
      id: 'audit-' + Date.now(),
      txHash,
      blockNumber: 19842600 + Math.floor(Math.random() * 50),
      timestamp: now.toISOString(),
      eventType: 'ACCESS_GRANTED',
      operatorName: db.patient.fullName,
      operatorAddress: db.patient.walletAddress || '0xPatientWallet',
      operatorRole: 'PATIENT',
      recordCode: 'ALL_RECORDS',
      patientPhid: payload.patientPhid,
      stateHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      notes: `Bệnh nhân cấp quyền ${payload.permissionLevel} cho ${payload.doctorName} (${payload.durationHours}h)`,
    });

    saveDatabase(db);
    return newGrant;
  },

  async revokeAccess(grantId: string, reason: string = 'Bệnh nhân yêu cầu thu hồi'): Promise<AccessGrant> {
    await delay(350);
    const db = loadDatabase();
    const grant = db.grants.find((g) => g.id === grantId);
    if (!grant) throw new Error('Grant not found');

    const revokeTxHash = generateTxHash();
    grant.status = 'REVOKED';
    grant.revokeTxHash = revokeTxHash;
    grant.revokedAt = new Date().toISOString();
    grant.revokedReason = reason;

    // Audit log
    db.onchainAudit.unshift({
      id: 'audit-' + Date.now(),
      txHash: revokeTxHash,
      blockNumber: 19842650 + Math.floor(Math.random() * 50),
      timestamp: new Date().toISOString(),
      eventType: 'ACCESS_REVOKED',
      operatorName: db.patient.fullName,
      operatorAddress: db.patient.walletAddress || '0xPatientWallet',
      operatorRole: 'PATIENT',
      recordCode: 'ALL_RECORDS',
      patientPhid: grant.patientPhid,
      stateHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      notes: `Bệnh nhân thu hồi quyền truy cập của ${grant.doctorName}. Lý do: ${reason}`,
    });

    saveDatabase(db);
    return grant;
  },

  async getAccessRequests(): Promise<AccessRequest[]> {
    await delay(120);
    return loadDatabase().requests;
  },

  async requestAccess(data: {
    patientPhid: string;
    doctorAddress: string;
    doctorId: string;
    doctorName: string;
    hospitalName: string;
    reason: string;
    durationHours: number;
    permissionRequested: AccessRequest['permissionRequested'];
  }): Promise<AccessRequest> {
    await delay(300);
    const db = loadDatabase();
    const newReq: AccessRequest = {
      id: 'req-' + Date.now(),
      patientId: db.patient.id,
      patientPhid: data.patientPhid,
      patientName: db.patient.fullName,
      doctorAddress: data.doctorAddress,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      hospitalName: data.hospitalName,
      requestedAt: new Date().toISOString(),
      reason: data.reason,
      durationHours: data.durationHours,
      permissionRequested: data.permissionRequested,
      status: 'PENDING',
    };
    db.requests.unshift(newReq);
    saveDatabase(db);
    return newReq;
  },

  async respondAccessRequest(requestId: string, approve: boolean): Promise<AccessRequest> {
    await delay(350);
    const db = loadDatabase();
    const req = db.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    req.status = approve ? 'APPROVED' : 'REJECTED';
    req.respondedAt = new Date().toISOString();

    if (approve) {
      // Automatically create the grant
      await this.grantAccess({
        patientId: req.patientId,
        patientPhid: req.patientPhid,
        doctorAddress: req.doctorAddress,
        doctorId: req.doctorId,
        doctorName: req.doctorName,
        hospitalName: req.hospitalName,
        durationHours: req.durationHours,
        permissionLevel: req.permissionRequested,
      });
    }

    saveDatabase(db);
    return req;
  },

  /* ---------------- ADMIN & GOVERNANCE ---------------- */
  async getDoctorApplications(): Promise<DoctorProfile[]> {
    await delay(150);
    return loadDatabase().doctors;
  },

  async approveDoctor(doctorId: string): Promise<DoctorProfile> {
    await delay(300);
    const db = loadDatabase();
    const doc = db.doctors.find((d) => d.id === doctorId || d.doctorId === doctorId);
    if (!doc) throw new Error('Doctor not found');

    doc.status = 'ACTIVE';
    doc.isVerifiedOnChain = true;
    saveDatabase(db);
    return doc;
  },

  async rejectDoctor(doctorId: string): Promise<DoctorProfile> {
    await delay(300);
    const db = loadDatabase();
    const doc = db.doctors.find((d) => d.id === doctorId || d.doctorId === doctorId);
    if (!doc) throw new Error('Doctor not found');

    doc.status = 'SUSPENDED';
    saveDatabase(db);
    return doc;
  },

  async suspendDoctor(doctorId: string): Promise<DoctorProfile> {
    await delay(300);
    const db = loadDatabase();
    const doc = db.doctors.find((d) => d.id === doctorId || d.doctorId === doctorId);
    if (!doc) throw new Error('Doctor not found');

    doc.status = 'SUSPENDED';
    saveDatabase(db);
    return doc;
  },

  async getHospitalWhitelist(): Promise<HospitalOrganization[]> {
    await delay(150);
    return loadDatabase().hospitals;
  },

  async whitelistHospital(data: {
    name: string;
    code: string;
    walletAddress: string;
    tier: HospitalOrganization['tier'];
    contactEmail: string;
  }): Promise<HospitalOrganization> {
    await delay(350);
    const db = loadDatabase();
    const newHosp: HospitalOrganization = {
      id: 'hosp-' + Date.now(),
      name: data.name,
      code: data.code,
      walletAddress: data.walletAddress,
      tier: data.tier,
      status: 'WHITELISTED',
      joinedDate: new Date().toISOString().split('T')[0],
      contactEmail: data.contactEmail,
      totalDoctors: 0,
    };
    db.hospitals.push(newHosp);
    saveDatabase(db);
    return newHosp;
  },

  async getSystemAuditLogs(): Promise<SystemAuditEntry[]> {
    await delay(150);
    return loadDatabase().systemLogs;
  },

  async getOnChainAuditLogs(): Promise<OnChainAuditLog[]> {
    await delay(150);
    return loadDatabase().onchainAudit;
  },

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    await delay(150);
    return loadDatabase().securityAlerts;
  },

  async resolveSecurityAlert(alertId: string): Promise<SecurityAlert> {
    await delay(250);
    const db = loadDatabase();
    const alert = db.securityAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Alert not found');

    alert.status = 'RESOLVED';
    saveDatabase(db);
    return alert;
  },

  async getAnalyticsData() {
    await delay(200);
    return {
      kpis: {
        totalPatients: 1420,
        activeDoctors: 86,
        recordsAnchored: 3840,
        transactions24h: 312,
        gasUsedTotalEth: '1.42 ETH',
      },
      dailyRecords: [
        { date: '06/10', count: 42, anchored: 42 },
        { date: '07/10', count: 58, anchored: 58 },
        { date: '08/10', count: 65, anchored: 65 },
        { date: '09/10', count: 72, anchored: 71 },
        { date: '10/10', count: 80, anchored: 80 },
        { date: '11/10', count: 48, anchored: 48 },
        { date: '12/10', count: 91, anchored: 91 },
      ],
      specialtyDistribution: [
        { name: 'Tim Mạch Can Thiệp', value: 380, color: '#0891b2' },
        { name: 'Nội Thần Kinh', value: 290, color: '#06b6d4' },
        { name: 'Nội Tiêu Hóa', value: 240, color: '#059669' },
        { name: 'Hồi Sức Cấp Cứu', value: 180, color: '#d97706' },
        { name: 'Nhi Khoa', value: 160, color: '#6366f1' },
        { name: 'Chẩn Đoán Hình Ảnh', value: 170, color: '#ec4899' },
      ],
      accessTrends: [
        { day: 'Thứ 2', granted: 28, revoked: 4 },
        { day: 'Thứ 3', granted: 35, revoked: 6 },
        { day: 'Thứ 4', granted: 42, revoked: 9 },
        { day: 'Thứ 5', granted: 39, revoked: 5 },
        { day: 'Thứ 6', granted: 48, revoked: 8 },
        { day: 'Thứ 7', granted: 22, revoked: 3 },
        { day: 'Chủ Nhật', granted: 15, revoked: 2 },
      ],
    };
  },
};
