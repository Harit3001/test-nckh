import React from 'react';
import { Tag, Tooltip } from 'antd';
import { CheckCircleFilled, WarningFilled, SyncOutlined } from '@ant-design/icons';

interface IntegrityBadgeProps {
  status: 'CONFIRMED' | 'PENDING' | 'TAMPERED_WARNING';
  onClick?: () => void;
}

export const IntegrityBadge: React.FC<IntegrityBadgeProps> = ({ status, onClick }) => {
  if (status === 'CONFIRMED') {
    return (
      <Tooltip title="Dữ liệu đã neo trên Smart Contract. Nhấn để đối chiếu SHA-256 xác minh.">
        <Tag
          color="success"
          icon={<CheckCircleFilled />}
          style={{
            cursor: onClick ? 'pointer' : 'default',
            padding: '2px 8px',
            borderRadius: 6,
            fontWeight: 500,
          }}
          onClick={onClick}
        >
          Toàn Vẹn On-Chain
        </Tag>
      </Tooltip>
    );
  }

  if (status === 'TAMPERED_WARNING') {
    return (
      <Tooltip title="CẢNH BÁO: Phát hiện bản ghi không khớp với RecordHash on-chain!">
        <Tag
          color="error"
          icon={<WarningFilled />}
          style={{
            cursor: onClick ? 'pointer' : 'default',
            padding: '2px 8px',
            borderRadius: 6,
            fontWeight: 600,
            animation: 'pulse 1.5s infinite',
          }}
          onClick={onClick}
        >
          Cảnh Báo Sửa Đổi
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tag
      color="processing"
      icon={<SyncOutlined spin />}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: '2px 8px',
        borderRadius: 6,
      }}
      onClick={onClick}
    >
      Đang Neo Khối
    </Tag>
  );
};
