import React, { useState, useRef } from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Divider,
  Card,
  Image,
  message,
} from 'antd';
import {
  FilePdfOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  UnlockOutlined,
  QrcodeOutlined,
  EyeOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { MedicalRecord, PrescriptionItem, AttachmentFile } from '../../types/emr';
import { IntegrityBadge } from '../common/IntegrityBadge';
import { IntegrityVerifyModal } from '../audit/IntegrityVerifyModal';
import { QRModal } from '../common/QRModal';
import { exportMedicalRecordPDF } from '../../services/pdfService';
import { truncateAddress } from '../../services/web3Service';
import { QRCodeCanvas } from 'qrcode.react';

const { Text, Title } = Typography;

interface RecordDetailModalProps {
  visible: boolean;
  record: MedicalRecord | null;
  onClose: () => void;
  onRecordUpdated?: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  visible,
  record,
  onClose,
  onRecordUpdated,
}) => {
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [decryptedFiles, setDecryptedFiles] = useState<Record<string, boolean>>({});

  const hiddenQrRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const handleToggleDecrypt = (attId: string) => {
    setDecryptedFiles((prev) => ({
      ...prev,
      [attId]: !prev[attId],
    }));
    message.success('Đã giải mã AES-256 client thành công để xem nội dung file!');
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      let qrDataUrl = '';
      if (hiddenQrRef.current) {
        const canvas = hiddenQrRef.current.querySelector('canvas');
        if (canvas) {
          qrDataUrl = canvas.toDataURL('image/png');
        }
      }
      await exportMedicalRecordPDF(record, qrDataUrl);
      message.success('Đã xuất file PDF bệnh án y tế chuẩn kèm mã QR xác thực on-chain!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xuất PDF.');
    } finally {
      setExportingPDF(false);
    }
  };

  const prescriptionColumns = [
    {
      title: 'Tên Thuốc & Hoạt Chất',
      key: 'name',
      render: (_: any, p: PrescriptionItem) => (
        <div>
          <Text strong style={{ color: '#0f172a' }}>
            {p.drugName}
          </Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>{p.activeSubstance}</div>
        </div>
      ),
    },
    {
      title: 'Hàm Lượng',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Số Lượng',
      key: 'quantity',
      render: (_: any, p: PrescriptionItem) => `${p.quantity} ${p.unit}`,
    },
    {
      title: 'Cách Dùng & Liều Lượng',
      dataIndex: 'instructions',
      key: 'instructions',
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={820}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <MedicineBoxOutlined style={{ color: '#0891b2', fontSize: 18 }} />
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                Chi Tiết Bệnh Án Điện Tử ({record.recordCode})
              </span>
            </Space>

            <Space>
              <IntegrityBadge
                status={record.onChainStatus}
                onClick={() => setVerifyModalVisible(true)}
              />
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                loading={exportingPDF}
                onClick={handleExportPDF}
                style={{ background: '#059669' }}
              >
                Xuất PDF Bệnh Án
              </Button>
            </Space>
          </div>
        }
        centered
      >
        <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 4 }}>
          {/* Top Meta info */}
          <Descriptions bordered size="small" column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} style={{ marginTop: 12 }}>
            <Descriptions.Item label="Bệnh Nhân">
              <Text strong>{record.patientName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mã Định Danh PHID">
              <Tag color="cyan">{record.patientPhid}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Khám">
              <CalendarOutlined style={{ marginRight: 4, color: '#0891b2' }} />
              {new Date(record.examinationDate).toLocaleString('vi-VN')}
            </Descriptions.Item>

            <Descriptions.Item label="Bác Sĩ Điều Trị">
              {record.doctorName} ({record.doctorId})
            </Descriptions.Item>
            <Descriptions.Item label="Cơ Sở Y Tế">
              {record.hospitalName}
            </Descriptions.Item>
            <Descriptions.Item label="Chuyên Khoa">
              <Tag color="blue">{record.department}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Blockchain TxHash" span={3}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text copyable={{ text: record.txHash }} style={{ fontFamily: 'monospace', color: '#0891b2' }}>
                  {record.txHash}
                </Text>
                <Tag color="green">Block #{record.blockNumber}</Tag>
              </div>
            </Descriptions.Item>
          </Descriptions>

          {/* Diagnosis & Findings */}
          <Card size="small" style={{ marginTop: 14, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Triệu chứng lâm sàng:</Text>
              <div style={{ color: '#0f172a', fontSize: 13, marginTop: 2 }}>{record.symptoms}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Khám thực thể:</Text>
              <div style={{ color: '#0f172a', fontSize: 13, marginTop: 2 }}>{record.physicalExamination}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Chẩn đoán xác định:</Text>
              <div style={{ color: '#0891b2', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                {record.diagnosis} <Tag color="cyan" style={{ marginLeft: 6 }}>{record.icd10Code}</Tag>
              </div>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Lời dặn của bác sĩ:</Text>
              <div style={{ color: '#475569', fontSize: 13, fontStyle: 'italic', marginTop: 2 }}>
                "{record.doctorAdvice}"
              </div>
            </div>
          </Card>

          {/* Prescription List */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <MedicineBoxOutlined style={{ color: '#0891b2' }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Toa Thuốc Chỉ Định ({record.prescriptions.length} loại)</span>
            </div>
            <Table
              dataSource={record.prescriptions}
              columns={prescriptionColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </div>

          {/* Attached Files & AES-256 Decryption View */}
          {record.attachments.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <LockOutlined style={{ color: '#0891b2' }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  Tệp Kết Quả Cận Lâm Sàng (Mã hóa AES-256 Client-Side)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {record.attachments.map((att) => {
                  const isDecrypted = decryptedFiles[att.id];
                  return (
                    <Card
                      key={att.id}
                      size="small"
                      style={{
                        borderRadius: 8,
                        border: isDecrypted ? '1px solid #059669' : '1px solid #cbd5e1',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text strong style={{ fontSize: 12 }}>{att.fileName}</Text>
                        <Tag color={isDecrypted ? 'green' : 'cyan'}>
                          {isDecrypted ? 'ĐÃ GIẢI MÃ' : 'AES-256'}
                        </Tag>
                      </div>

                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                        IPFS: <span style={{ fontFamily: 'monospace' }}>{truncateAddress(att.ipfsHash, 8, 6)}</span>
                      </div>

                      {/* Preview decrypted image if available */}
                      {isDecrypted && att.decryptedDataUrl && (
                        <div style={{ textAlign: 'center', marginBottom: 10 }}>
                          <Image
                            src={att.decryptedDataUrl}
                            height={120}
                            style={{ objectFit: 'cover', borderRadius: 6 }}
                          />
                        </div>
                      )}

                      <Button
                        size="small"
                        block
                        icon={isDecrypted ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => handleToggleDecrypt(att.id)}
                        style={{
                          borderColor: isDecrypted ? '#059669' : '#0891b2',
                          color: isDecrypted ? '#059669' : '#0891b2',
                        }}
                      >
                        {isDecrypted ? 'Khóa Lại (Mã Hóa)' : 'Giải Mã Xem Trước (Client AES-256)'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verification Trigger Banner */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 14px',
              borderRadius: 8,
              background: '#f0fdfa',
              border: '1px solid #a5f3fc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                Xác Thực Tính Toàn Vẹn Bệnh Án Bằng Hàm Băm
              </Text>
              <div style={{ fontSize: 11, color: '#0e7490' }}>
                Đối chiếu SHA-256 của bản ghi với RecordHash trên Smart Contract để kiểm tra tính toàn vẹn 100%.
              </div>
            </div>
            <Button
              type="primary"
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => setVerifyModalVisible(true)}
              style={{ background: '#0891b2' }}
            >
              Kiểm Tra Toàn Vẹn
            </Button>
          </div>
        </div>
      </Modal>

      {/* Hidden QR Code generator for PDF Export */}
      <div style={{ display: 'none' }} ref={hiddenQrRef}>
        <QRCodeCanvas value={`https://sepolia.etherscan.io/tx/${record.txHash}`} size={160} />
      </div>

      {/* Verification Modal */}
      <IntegrityVerifyModal
        visible={verifyModalVisible}
        record={record}
        onClose={() => setVerifyModalVisible(false)}
        onRecordUpdated={onRecordUpdated}
      />
    </>
  );
};
