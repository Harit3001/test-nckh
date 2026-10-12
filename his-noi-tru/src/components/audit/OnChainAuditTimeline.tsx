import React, { useEffect, useState } from 'react';
import { Card, Timeline, Tag, Typography, Button, Space, Skeleton, Empty, Tooltip } from 'antd';
import {
  FileAddOutlined,
  KeyOutlined,
  LockOutlined,
  EditOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
  HistoryOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { OnChainAuditLog } from '../../types/blockchain';
import { MockApi } from '../../services/mockApi';
import { truncateAddress } from '../../services/web3Service';

const { Text } = Typography;

interface OnChainAuditTimelineProps {
  filterRecordCode?: string;
}

export const OnChainAuditTimeline: React.FC<OnChainAuditTimelineProps> = ({
  filterRecordCode,
}) => {
  const [logs, setLogs] = useState<OnChainAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await MockApi.getOnChainAuditLogs();
      if (filterRecordCode) {
        setLogs(data.filter((l) => l.recordCode === filterRecordCode || l.recordCode === 'ALL_RECORDS'));
      } else {
        setLogs(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterRecordCode]);

  const getEventMeta = (type: OnChainAuditLog['eventType']) => {
    switch (type) {
      case 'RECORD_CREATED':
        return {
          icon: <FileAddOutlined style={{ color: '#0891b2', fontSize: 16 }} />,
          color: 'cyan',
          title: 'Khởi tạo Bệnh Án On-Chain',
        };
      case 'ACCESS_GRANTED':
        return {
          icon: <KeyOutlined style={{ color: '#10b981', fontSize: 16 }} />,
          color: 'green',
          title: 'Cấp Quyền Truy Cập (Smart Contract)',
        };
      case 'ACCESS_REVOKED':
        return {
          icon: <LockOutlined style={{ color: '#ef4444', fontSize: 16 }} />,
          color: 'red',
          title: 'Thu Hồi Quyền Truy Cập',
        };
      case 'PROGRESSION_APPENDED':
        return {
          icon: <EditOutlined style={{ color: '#f59e0b', fontSize: 16 }} />,
          color: 'gold',
          title: 'Thêm Diễn Tiến (Append-Only Chain)',
        };
      case 'INTEGRITY_VERIFIED':
        return {
          icon: <SafetyCertificateOutlined style={{ color: '#6366f1', fontSize: 16 }} />,
          color: 'purple',
          title: 'Xác Minh Tính Toàn Vẹn',
        };
      default:
        return {
          icon: <CheckCircleOutlined style={{ color: '#64748b', fontSize: 16 }} />,
          color: 'default',
          title: 'Sự Kiện Smart Contract',
        };
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <HistoryOutlined style={{ color: '#0891b2' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              Nhật Ký Vòng Đời & Kiểm Toán On-Chain (Audit Trail)
            </span>
          </Space>
          <Button size="small" icon={<SyncOutlined spin={loading} />} onClick={fetchLogs}>
            Làm mới
          </Button>
        </div>
      }
      style={{
        borderRadius: 12,
        border: '1px solid #e2e8f0',
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : logs.length === 0 ? (
        <Empty description="Chưa có nhật ký kiểm toán on-chain" />
      ) : (
        <Timeline
          mode="left"
          items={logs.map((log) => {
            const meta = getEventMeta(log.eventType);
            return {
              dot: meta.icon,
              children: (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Space>
                      <Tag color={meta.color} style={{ margin: 0, fontWeight: 600 }}>
                        {meta.title}
                      </Tag>
                      {log.recordCode !== 'ALL_RECORDS' && (
                        <Tag color="blue" style={{ margin: 0 }}>
                          {log.recordCode}
                        </Tag>
                      )}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </Text>
                  </div>

                  <div style={{ fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                    {log.notes}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12,
                      fontSize: 11,
                      color: '#64748b',
                      paddingTop: 6,
                      borderTop: '1px dashed #cbd5e1',
                    }}
                  >
                    <div>
                      <span>Người thực hiện: </span>
                      <strong style={{ color: '#0f172a' }}>{log.operatorName}</strong> (
                      <span style={{ fontFamily: 'monospace' }}>
                        {truncateAddress(log.operatorAddress, 6, 4)}
                      </span>
                      )
                    </div>

                    <div>
                      <span>Block: </span>
                      <Tag color="cyan" style={{ margin: 0, fontSize: 10 }}>
                        #{log.blockNumber}
                      </Tag>
                    </div>

                    <div>
                      <span>TxHash: </span>
                      <Tooltip title={log.txHash}>
                        <Text
                          copyable={{ text: log.txHash }}
                          style={{ fontFamily: 'monospace', color: '#0891b2', fontWeight: 600 }}
                        >
                          {truncateAddress(log.txHash, 8, 6)}
                        </Text>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ),
            };
          })}
        />
      )}
    </Card>
  );
};
