import React, { useState } from 'react';
import { Modal, Button, Typography, Space, Divider, message, Card } from 'antd';
import { CheckOutlined, CloseOutlined, KeyOutlined, SafetyCertificateFilled } from '@ant-design/icons';
import { EIP712_DOMAIN } from '../../services/web3Service';
import { truncateAddress } from '../../services/web3Service';

const { Text, Paragraph } = Typography;

interface EIP712ModalProps {
  visible: boolean;
  walletAddress: string;
  nonce: string;
  onSign: (signature: string) => void;
  onCancel: () => void;
}

export const EIP712Modal: React.FC<EIP712ModalProps> = ({
  visible,
  walletAddress,
  nonce,
  onSign,
  onCancel,
}) => {
  const [signing, setSigning] = useState<boolean>(false);

  const issuedAt = Math.floor(Date.now() / 1000);

  const handleConfirmSign = async () => {
    setSigning(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // Simulate hardware/metamask signing delay
      const mockSig =
        '0x7b1c4e9f82d3a6b5c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c31c';
      message.success('Chữ ký EIP-712 đã được xác thực thành công!');
      onSign(mockSig);
    } finally {
      setSigning(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={440}
      centered
      closable={!signing}
      maskClosable={false}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 18,
            }}
          >
            🦊
          </div>
          <div>
            <Text strong style={{ fontSize: 14 }}>
              Yêu cầu Chữ ký Số (EIP-712)
            </Text>
            <div style={{ fontSize: 11, color: '#64748b' }}>MetaMask Wallet Provider</div>
          </div>
        </div>
      }
    >
      <div style={{ marginTop: 8 }}>
        {/* Account Info */}
        <div
          style={{
            padding: '10px 14px',
            background: '#f8fafc',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              Tài khoản đang kết nối:
            </Text>
            <Text strong style={{ fontSize: 13, fontFamily: 'monospace' }}>
              {truncateAddress(walletAddress, 10, 8)}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Sepolia</Text>
          </div>
        </div>

        {/* Typed Data Structure */}
        <div style={{ marginTop: 14 }}>
          <Text strong style={{ fontSize: 12, color: '#334155' }}>
            Nội dung thông điệp cần ký (Typed Data):
          </Text>

          <Card
            size="small"
            style={{
              marginTop: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              fontFamily: 'monospace',
              fontSize: 11,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            <div style={{ color: '#0891b2', fontWeight: 600, marginBottom: 4 }}>
              // EIP712Domain
            </div>
            <div style={{ color: '#475569', paddingLeft: 8 }}>
              name: "{EIP712_DOMAIN.name}"<br />
              version: "{EIP712_DOMAIN.version}"<br />
              chainId: {EIP712_DOMAIN.chainId}<br />
              verifyingContract: "{truncateAddress(EIP712_DOMAIN.verifyingContract, 10, 8)}"
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ color: '#0891b2', fontWeight: 600, marginBottom: 4 }}>
              // Message (LoginPayload)
            </div>
            <div style={{ color: '#1e293b', paddingLeft: 8 }}>
              wallet: "{walletAddress}"<br />
              nonce: "{nonce}"<br />
              issuedAt: {issuedAt} ({new Date().toLocaleTimeString()})<br />
              statement: "Xac thuc dang nhap vao He thong Benh An Dien Tu On-Chain EMR"
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <SafetyCertificateFilled style={{ color: '#059669', fontSize: 14 }} />
          <Text style={{ fontSize: 11, color: '#64748b' }}>
            Thao tác này chỉ ký thông điệp bảo mật, không tiêu tốn phí Gas.
          </Text>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Button
            style={{ flex: 1 }}
            icon={<CloseOutlined />}
            onClick={onCancel}
            disabled={signing}
          >
            Từ chối (Reject)
          </Button>
          <Button
            type="primary"
            style={{ flex: 1, background: '#0891b2' }}
            icon={<KeyOutlined />}
            loading={signing}
            onClick={handleConfirmSign}
          >
            Ký Xác Nhận (Sign)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
