import React from 'react';
import { Card, Steps, Button, Typography, Tag, Space } from 'antd';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  BlockOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useWeb3 } from '../../context/Web3Context';
import { truncateAddress } from '../../services/web3Service';

const { Text, Paragraph } = Typography;

export const TxStatusWidget: React.FC = () => {
  const { activeTx, txStep, dismissActiveTx } = useWeb3();

  if (!activeTx || !txStep) return null;

  const currentStepIndex =
    txStep === 'SUBMITTING' ? 0 : txStep === 'PENDING' ? 1 : 2;

  const actionLabels: Record<string, string> = {
    ANCHOR_RECORD: 'Neo Hash Bệnh Án On-Chain',
    GRANT_ACCESS: 'Phân Quyền Truy Cập (Smart Contract)',
    REVOKE_ACCESS: 'Thu Hồi Quyền Truy Cập',
    APPEND_PROGRESSION: 'Ghi Diễn Tiến (Append-Only Hash)',
    WHITELIST_HOSPITAL: 'Thêm Bệnh Viện Vào Whitelist',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        width: 380,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <Card
        size="small"
        style={{
          borderRadius: 14,
          border: '1px solid #0891b2',
          background: '#ffffff',
          overflow: 'hidden',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size="small">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: txStep === 'CONFIRMED' ? '#10b981' : '#0891b2',
                  display: 'inline-block',
                }}
              />
              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                {actionLabels[activeTx.action] || 'Giao Dịch Blockchain'}
              </Text>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined style={{ fontSize: 11 }} />}
              onClick={dismissActiveTx}
            />
          </div>
        }
      >
        <div style={{ padding: '6px 4px' }}>
          <Steps
            size="small"
            current={currentStepIndex}
            items={[
              {
                title: 'Submitting',
                description: 'Ký ví & gửi',
                icon: txStep === 'SUBMITTING' ? <LoadingOutlined /> : undefined,
              },
              {
                title: 'Pending',
                description: 'Mempool',
                icon: txStep === 'PENDING' ? <LoadingOutlined /> : undefined,
              },
              {
                title: 'Confirmed',
                description: 'Đóng khối',
                icon: txStep === 'CONFIRMED' ? <CheckCircleOutlined style={{ color: '#059669' }} /> : undefined,
              },
            ]}
          />

          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary">TxHash:</Text>
              <Text
                copyable={{ text: activeTx.txHash }}
                style={{ fontFamily: 'monospace', color: '#0891b2', fontWeight: 600 }}
              >
                {truncateAddress(activeTx.txHash, 8, 6)}
              </Text>
            </div>

            {activeTx.blockNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Block Height:</Text>
                <Tag color="cyan" style={{ margin: 0, fontFamily: 'monospace' }}>
                  <BlockOutlined style={{ marginRight: 4 }} />
                  #{activeTx.blockNumber}
                </Tag>
              </div>
            )}

            {activeTx.gasUsed && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Gas Tiêu Thụ:</Text>
                <Text style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  <FireOutlined style={{ color: '#f59e0b', marginRight: 4 }} />
                  {activeTx.gasUsed.toLocaleString()} units
                </Text>
              </div>
            )}

            {activeTx.details && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #cbd5e1', color: '#475569' }}>
                {activeTx.details}
              </div>
            )}
          </div>

          {txStep === 'CONFIRMED' && (
            <div style={{ marginTop: 10, textAlign: 'right' }}>
              <Button
                type="link"
                size="small"
                onClick={dismissActiveTx}
                style={{ padding: 0, color: '#0891b2', fontWeight: 500 }}
              >
                Đóng thông báo <ArrowRightOutlined />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
