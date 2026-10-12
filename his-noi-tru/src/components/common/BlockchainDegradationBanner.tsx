import React from 'react';
import { Alert, Button, Space } from 'antd';
import { SyncOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { useWeb3 } from '../../context/Web3Context';

export const BlockchainDegradationBanner: React.FC = () => {
  const { isSlowNetwork, toggleSlowNetwork } = useWeb3();

  if (!isSlowNetwork) return null;

  return (
    <div style={{ margin: '16px 24px 0 24px' }}>
      <Alert
        type="warning"
        showIcon
        icon={<CloudSyncOutlined style={{ fontSize: 18, color: '#d97706' }} />}
        message={
          <span style={{ fontWeight: 600, color: '#92400e' }}>
            Chế độ hoạt động ngoại tuyến / Mạng Blockchain đang phản hồi chậm
          </span>
        }
        description={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#b45309', fontSize: 13 }}>
              Dữ liệu bệnh án và diễn tiến điều trị của bạn đã được mã hóa và lưu trữ an toàn cục bộ (IndexedDB/Local Vault). Hệ thống đang tự động xếp hàng đợi và đồng bộ lên Smart Contract mạng Sepolia ngay khi điều kiện mạng ổn định. Mọi thao tác khám chữa bệnh vẫn diễn ra bình thường.
            </span>
            <Space style={{ marginLeft: 16 }}>
              <Button
                size="small"
                icon={<SyncOutlined spin />}
                style={{ borderColor: '#d97706', color: '#92400e', background: '#fef3c7' }}
              >
                Đang chờ đồng bộ (1 tác vụ)
              </Button>
              <Button size="small" type="link" onClick={() => toggleSlowNetwork(false)} style={{ color: '#b45309' }}>
                Tắt giả lập
              </Button>
            </Space>
          </div>
        }
        style={{
          borderRadius: 10,
          border: '1px solid #fde68a',
          background: '#fffbeb',
        }}
      />
    </div>
  );
};
