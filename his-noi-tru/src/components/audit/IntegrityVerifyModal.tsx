import React, { useState, useEffect } from 'react';
import { Modal, Result, Button, Typography, Space, Tag, Alert, Card, Divider, message } from 'antd';
import {
  SafetyCertificateFilled,
  WarningFilled,
  BlockOutlined,
  CopyOutlined,
  UndoOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { MedicalRecord } from '../../types/emr';
import { MockApi } from '../../services/mockApi';
import { truncateAddress } from '../../services/web3Service';

const { Text, Paragraph } = Typography;

interface IntegrityVerifyModalProps {
  visible: boolean;
  record: MedicalRecord | null;
  onClose: () => void;
  onRecordUpdated?: () => void;
}

export const IntegrityVerifyModal: React.FC<IntegrityVerifyModalProps> = ({
  visible,
  record,
  onClose,
  onRecordUpdated,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{
    isMatch: boolean;
    calculatedHash: string;
    onChainHash: string;
    txHash: string;
    blockNumber: number;
    details: string;
  } | null>(null);

  const performVerification = async () => {
    if (!record) return;
    setLoading(true);
    try {
      const res = await MockApi.verifyRecordIntegrity(record.id);
      setVerifyResult(res);
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi kiểm tra tính toàn vẹn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && record) {
      performVerification();
    } else {
      setVerifyResult(null);
    }
  }, [visible, record]);

  const handleSimulateTamper = async () => {
    if (!record) return;
    try {
      await MockApi.tamperRecordForTesting(
        record.id,
        record.diagnosis + ' [ĐÃ BỊ CHỈNH SỬA TRÁI PHÉP BỞI ATTACKER]'
      );
      message.warning('Đã mô phỏng can thiệp sửa đổi nội dung bệnh án cục bộ!');
      await performVerification();
      onRecordUpdated?.();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleRestoreOriginal = async () => {
    if (!record) return;
    try {
      await MockApi.restoreRecordOriginal(record.id);
      message.success('Đã khôi phục dữ liệu gốc chuẩn xác!');
      await performVerification();
      onRecordUpdated?.();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  if (!record) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      title={
        <Space>
          <SafetyCertificateFilled style={{ color: '#0891b2' }} />
          <span>Kiểm Tra Tính Toàn Vẹn Bệnh Án On-Chain ({record.recordCode})</span>
        </Space>
      }
      centered
    >
      <div style={{ marginTop: 12 }}>
        {verifyResult && (
          <div>
            {verifyResult.isMatch ? (
              <Result
                status="success"
                title={
                  <span style={{ color: '#059669', fontSize: 18, fontWeight: 700 }}>
                    DỮ LIỆU BỆNH ÁN TOÀN VẸN 100%
                  </span>
                }
                subTitle="Hàm băm SHA-256 tính toán từ nội dung hiện tại đối khớp hoàn toàn với RecordHash đã neo trên Smart Contract Ethereum."
                style={{ padding: '12px 0' }}
              />
            ) : (
              <Result
                status="error"
                title={
                  <span style={{ color: '#dc2626', fontSize: 18, fontWeight: 700 }}>
                    CẢNH BÁO: PHÁT HIỆN DỮ LIỆU ĐÃ BỊ SỬA ĐỔI!
                  </span>
                }
                subTitle="Mã băm SHA-256 của nội dung bệnh án hiện tại KHÔNG TRÙNG KHỚP với giá trị gốc đã ký số và neo vĩnh viễn trên chuỗi khối."
                style={{ padding: '12px 0' }}
              />
            )}

            {/* Hash Comparison Table */}
            <Card
              size="small"
              style={{
                background: verifyResult.isMatch ? '#f0fdf4' : '#fef2f2',
                border: verifyResult.isMatch ? '1px solid #bbf7d0' : '1px solid #fecaca',
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  1. Mã băm tính toán từ dữ liệu thực tế (SHA-256 Calculated):
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <Text
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 600,
                      color: verifyResult.isMatch ? '#15803d' : '#b91c1c',
                      wordBreak: 'break-all',
                    }}
                  >
                    {verifyResult.calculatedHash}
                  </Text>
                </div>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  2. Mã băm gốc neo trên Smart Contract (RecordHash on-chain):
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <Text
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0891b2',
                      wordBreak: 'break-all',
                    }}
                  >
                    {verifyResult.onChainHash}
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingTop: 8, borderTop: '1px dashed #cbd5e1', fontSize: 12 }}>
                <div>
                  <Text type="secondary">TxHash: </Text>
                  <Text copyable={{ text: verifyResult.txHash }} style={{ fontFamily: 'monospace' }}>
                    {truncateAddress(verifyResult.txHash, 8, 6)}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Block: </Text>
                  <Tag color="cyan">#{verifyResult.blockNumber}</Tag>
                </div>
              </div>
            </Card>

            {/* Interactive Tamper Testing Toolbar */}
            <div
              style={{
                marginTop: 20,
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 12 }}>
                    🛠️ Khu vực Kiểm Thử Tính Bất Biến (Demo Testing):
                  </Text>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Thử thay đổi nội dung chẩn đoán cục bộ để xem cơ chế phát hiện giả mạo.
                  </div>
                </div>

                <Space>
                  {verifyResult.isMatch ? (
                    <Button
                      size="small"
                      danger
                      icon={<ExperimentOutlined />}
                      onClick={handleSimulateTamper}
                    >
                      Thử Sửa Đổi Dữ Liệu
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      type="primary"
                      icon={<UndoOutlined />}
                      onClick={handleRestoreOriginal}
                      style={{ background: '#059669' }}
                    >
                      Khôi Phục Dữ Liệu Gốc
                    </Button>
                  )}
                </Space>
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <Button onClick={onClose} style={{ minWidth: 90 }}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
