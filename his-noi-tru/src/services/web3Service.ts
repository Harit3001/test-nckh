import CryptoJS from 'crypto-js';
import { BlockchainTransaction, TxStepStatus } from '../types/blockchain';

export const EIP712_DOMAIN = {
  name: 'EMR-Blockchain-Healthcare',
  version: '1.0',
  chainId: 11155111, // Sepolia Testnet
  verifyingContract: '0x35687b3e0c0f823A401f8021950d8858A97E4A83',
};

export const EIP712_TYPES = {
  Login: [
    { name: 'wallet', type: 'address' },
    { name: 'nonce', type: 'string' },
    { name: 'issuedAt', type: 'uint256' },
    { name: 'statement', type: 'string' },
  ],
  GrantAccess: [
    { name: 'patientPhid', type: 'string' },
    { name: 'doctorAddress', type: 'address' },
    { name: 'expiresAt', type: 'uint256' },
    { name: 'permission', type: 'string' },
  ],
  AnchorRecord: [
    { name: 'recordCode', type: 'string' },
    { name: 'recordHash', type: 'bytes32' },
    { name: 'parentHash', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

/**
 * Computes canonical SHA-256 hash
 */
export async function calculateSHA256(data: any): Promise<string> {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(serialized);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return '0x' + hashHex;
    }
  } catch (e) {
    console.warn('Fallback to CryptoJS SHA256', e);
  }
  const hash = CryptoJS.SHA256(serialized).toString(CryptoJS.enc.Hex);
  return '0x' + hash;
}

/**
 * Computes deterministic record canonical hash
 */
export async function computeRecordHash(record: {
  recordCode: string;
  patientPhid: string;
  diagnosis: string;
  icd10Code: string;
  symptoms: string;
  prescriptions: any[];
  examinationDate: string;
}): Promise<string> {
  const canonicalPayload = {
    recordCode: record.recordCode,
    patientPhid: record.patientPhid,
    diagnosis: record.diagnosis,
    icd10Code: record.icd10Code,
    symptoms: record.symptoms,
    prescriptions: record.prescriptions.map((p) => ({
      name: p.drugName,
      substance: p.activeSubstance,
      quantity: p.quantity,
      unit: p.unit,
      instructions: p.instructions,
    })),
    examinationDate: record.examinationDate,
  };
  return calculateSHA256(canonicalPayload);
}

/**
 * Simulates Client-side AES-256 File Encryption with progress reporting
 */
export async function encryptFileAES256(
  file: File,
  secretKey: string = 'EMR_CLIENT_KEY_DEFAULT_2026',
  onProgress?: (percent: number) => void
): Promise<{
  cipherTextPreview: string;
  encryptedHash: string;
  ipfsCid: string;
  fileSize: number;
  fileName: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        const percent = Math.round((evt.loaded / evt.total) * 40);
        onProgress(percent);
      }
    };

    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        onProgress?.(50);
        
        // Simulating progressive AES encryption ticks
        await new Promise((r) => setTimeout(r, 120));
        onProgress?.(75);

        const encrypted = CryptoJS.AES.encrypt(fileData, secretKey).toString();
        await new Promise((r) => setTimeout(r, 120));
        onProgress?.(90);

        const encryptedHash = await calculateSHA256(encrypted.slice(0, 1000));
        
        // Pseudo-random deterministic IPFS CID
        const randomCidSuffix = Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        const ipfsCid = `Qm${randomCidSuffix.slice(0, 44)}`;

        onProgress?.(100);

        resolve({
          cipherTextPreview: encrypted.slice(0, 80) + '...',
          encryptedHash,
          ipfsCid,
          fileSize: file.size,
          fileName: file.name,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Simulates Client-side AES-256 Decryption
 */
export function decryptFileAES256(cipherText: string, secretKey: string = 'EMR_CLIENT_KEY_DEFAULT_2026'): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || '';
  } catch (err) {
    console.error('Decryption failed', err);
    return '';
  }
}

/**
 * Generate mock Ethereum transaction hash
 */
export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Truncate Ethereum address or transaction hash
 */
export function truncateAddress(address?: string, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Simulate On-Chain Transaction broadcasting with 3-phase lifecycle
 */
export async function simulateBlockchainTx(
  action: BlockchainTransaction['action'],
  from: string,
  to: string = EIP712_DOMAIN.verifyingContract,
  details?: string,
  onStepChange?: (step: TxStepStatus, tx: BlockchainTransaction) => void,
  latencyMs: number = 1000
): Promise<BlockchainTransaction> {
  const txHash = generateTxHash();
  const tx: BlockchainTransaction = {
    txHash,
    action,
    from,
    to,
    timestamp: new Date().toISOString(),
    status: 'SUBMITTING',
    details,
  };

  // Phase 1: Submitting
  onStepChange?.('SUBMITTING', { ...tx, status: 'SUBMITTING' });
  await new Promise((r) => setTimeout(r, latencyMs * 0.4));

  // Phase 2: Pending (Mempool broadcast)
  tx.status = 'PENDING';
  onStepChange?.('PENDING', { ...tx, status: 'PENDING' });
  await new Promise((r) => setTimeout(r, latencyMs * 0.6));

  // Phase 3: Confirmed (Mined into block)
  const currentBlock = 19842000 + Math.floor(Math.random() * 500);
  const gasUsed = 42000 + Math.floor(Math.random() * 25000);
  tx.status = 'CONFIRMED';
  tx.blockNumber = currentBlock;
  tx.gasUsed = gasUsed;
  onStepChange?.('CONFIRMED', { ...tx, status: 'CONFIRMED', blockNumber: currentBlock, gasUsed });

  return tx;
}

/**
 * EIP-712 Mock Typed Signing Helper
 */
export async function mockEIP712Sign(
  walletAddress: string,
  nonce: string
): Promise<{ signature: string; issuedAt: number; domain: typeof EIP712_DOMAIN }> {
  // If user has browser MetaMask and wants real prompt, can attempt, else simulate
  const issuedAt = Date.now();
  const rawSignature = generateTxHash() + generateTxHash().slice(2) + '1b';
  return {
    signature: rawSignature,
    issuedAt,
    domain: EIP712_DOMAIN,
  };
}
