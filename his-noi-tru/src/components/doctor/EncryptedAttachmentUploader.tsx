import React, { useState } from 'react';
import { Upload, Button, Progress, Tag, Space, Typography, Card, message } from 'antd';
import {
  UploadOutlined,
  LockOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { AttachmentFile } from '../../types/emr';
import { encryptFileAES256, truncateAddress } from '../../services/web3Service';

const { Text } = Typography;

interface EncryptedAttachmentUploaderProps {
  attachments: AttachmentFile[];
  onAttachmentsChange: (files: AttachmentFile[]) => void;
}

export const EncryptedAttachmentUploader: React.FC<EncryptedAttachmentUploaderProps> = ({
  attachments,
  onAttachmentsChange,
}) => {
  const [encrypting, setEncrypting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const handleUpload = async (file: File) => {
    setEncrypting(true);
    setProgressPercent(10);
    setCurrentFileName(file.name);

    try {
      const res = await encryptFileAES256(file, 'EMR_CLIENT_KEY_DEFAULT_2026', (pct) => {
        setProgressPercent(pct);
      });

      const newAttachment: AttachmentFile = {
        id: 'att-' + Date.now(),
        fileName: res.fileName,
        fileSize: res.fileSize,
        mimeType: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString(),
        ipfsHash: res.ipfsCid,
        encryptedHash: res.encryptedHash,
        encryptionKeyStatus: 'ENCRYPTED_AES256',
        decryptedDataUrl: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
      };

      onAttachmentsChange([...attachments, newAttachment]);
      message.success(`Đã mã hóa AES-256 client và tạo IPFS CID cho ${file.name}!`);
    } catch (err: any) {
      message.error(err.message || 'Mã hóa file thất bại.');
    } finally {
      setEncrypting(false);
      setProgressPercent(0);
      setCurrentFileName('');
    }
  };

  const handleRemove = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div>
      <Upload
        beforeUpload={(file) => {
          handleUpload(file);
          return false;
        }}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} disabled={encrypting}>
          Đính kèm Kết quả Xét nghiệm / X-Quang / DICOM
        </Button>
      </Upload>

      {encrypting && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: '#ecfeff',
            borderRadius: 8,
            border: '1px solid #a5f3fc',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
            <span style={{ color: '#0e7490', fontWeight: 600 }}>
              <LockOutlined style={{ marginRight: 6 }} />
              Đang mã hóa AES-256 Client-side: {currentFileName}
            </span>
            <span style={{ color: '#0891b2', fontWeight: 700 }}>{progressPercent}%</span>
          </div>
          <Progress percent={progressPercent} strokeColor="#0891b2" showInfo={false} size="small" />
        </div>
      )}

      {attachments.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {attachments.map((att) => (
            <Card
              key={att.id}
              size="small"
              style={{
                marginBottom: 8,
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  {att.mimeType.includes('pdf') ? (
                    <FilePdfOutlined style={{ color: '#ef4444', fontSize: 18 }} />
                  ) : (
                    <FileImageOutlined style={{ color: '#0891b2', fontSize: 18 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{att.fileName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {(att.fileSize / 1024).toFixed(1)} KB | IPFS CID:{' '}
                      <span style={{ fontFamily: 'monospace' }}>{truncateAddress(att.ipfsHash, 8, 6)}</span>
                    </div>
                  </div>
                </Space>

                <Space>
                  <Tag color="cyan" icon={<CheckCircleFilled />}>
                    AES-256 Encrypted
                  </Tag>
                  <Button type="link" size="small" danger onClick={() => handleRemove(att.id)}>
                    Xóa
                  </Button>
                </Space>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
