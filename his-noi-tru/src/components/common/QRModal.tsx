import React, { useRef } from 'react';
import { Modal, Button, Typography, Space, message } from 'antd';
import { QRCodeCanvas } from 'qrcode.react';
import { DownloadOutlined, CopyOutlined, QrcodeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface QRModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  value: string;
  subTitle?: string;
  downloadFileName?: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  visible,
  onClose,
  title,
  value,
  subTitle,
  downloadFileName = 'EMR_QR_Code',
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `${downloadFileName}.png`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    message.success('Đã tải hình ảnh mã QR thành công!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    message.success('Đã sao chép nội dung vào bộ nhớ tạm!');
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <QrcodeOutlined style={{ color: '#0891b2' }} />
          <span>{title}</span>
        </Space>
      }
      centered
      width={380}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 8px 8px 8px',
        }}
      >
        <div
          ref={qrRef}
          style={{
            padding: 16,
            background: '#ffffff',
            borderRadius: 14,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '2px solid #e2e8f0',
            marginBottom: 16,
          }}
        >
          <QRCodeCanvas
            value={value}
            size={220}
            level="H"
            marginSize={2}
            imageSettings={{
              src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230891b2"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>

        <Text strong style={{ fontSize: 15, color: '#0f172a', textAlign: 'center' }}>
          {value}
        </Text>

        {subTitle && (
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, textAlign: 'center' }}>
            {subTitle}
          </Text>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24, width: '100%' }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            style={{ flex: 1, background: '#0891b2' }}
          >
            Tải mã QR
          </Button>
          <Button icon={<CopyOutlined />} onClick={handleCopy} style={{ flex: 1 }}>
            Sao chép mã
          </Button>
        </div>
      </div>
    </Modal>
  );
};
