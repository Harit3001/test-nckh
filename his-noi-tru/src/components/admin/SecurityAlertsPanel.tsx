import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Space, Tag, Typography, message, Popconfirm } from 'antd';
import {
  AlertFilled,
  WarningFilled,
  LockOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { SecurityAlert } from '../../types/blockchain';
import { MockApi } from '../../services/mockApi';

const { Text } = Typography;

export const SecurityAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await MockApi.getSecurityAlerts();
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await MockApi.resolveSecurityAlert(id);
      message.success('Đã chuyển trạng thái cảnh báo sang ĐÃ XỬ LÝ!');
      await fetchAlerts();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleEmergencyLock = async (targetAccount: string, alertId: string) => {
    try {
      message.error(`ĐÃ KÍCH HOẠT KHÓA KHẨN CẤP ĐỐI VỚI: ${targetAccount}`);
      await MockApi.resolveSecurityAlert(alertId);
      await fetchAlerts();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <AlertFilled style={{ color: '#ef4444' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              Trung Tâm Giám Sát An Ninh & Cảnh Báo Bất Thường (Threat Detection)
            </span>
            <Tag color="error">Hệ thống AI giám sát 24/7</Tag>
          </Space>
          <Button size="small" icon={<ReloadOutlined spin={loading} />} onClick={fetchAlerts}>
            Làm mới
          </Button>
        </div>
      }
      style={{ borderRadius: 12, border: '1px solid #fecaca' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map((al) => {
          const isCritical = al.level === 'CRITICAL';
          const isResolved = al.status === 'RESOLVED';

          return (
            <div
              key={al.id}
              style={{
                border: isResolved ? '1px solid #e2e8f0' : isCritical ? '1px solid #f87171' : '1px solid #fcd34d',
                borderRadius: 10,
                padding: '12px 16px',
                background: isResolved ? '#f8fafc' : isCritical ? '#fef2f2' : '#fffbeb',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <Space>
                  <Tag color={isResolved ? 'default' : isCritical ? 'red' : 'gold'} style={{ fontWeight: 700 }}>
                    {al.level}
                  </Tag>
                  <Text strong style={{ fontSize: 14, color: isResolved ? '#64748b' : '#0f172a' }}>
                    {al.title}
                  </Text>
                </Space>

                <Space>
                  <Tag color={isResolved ? 'green' : 'orange'}>
                    {isResolved ? 'ĐÃ XỬ LÝ AN TOÀN' : 'ĐANG KÍCH HOẠT'}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(al.timestamp).toLocaleTimeString()}
                  </Text>
                </Space>
              </div>

              <div style={{ fontSize: 13, color: '#334155', marginBottom: 8 }}>
                {al.description}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11,
                  color: '#64748b',
                  paddingTop: 8,
                  borderTop: isResolved ? '1px solid #e2e8f0' : '1px dashed #fca5a5',
                }}
              >
                <div>
                  <span>Mục tiêu: </span>
                  <strong style={{ color: '#0f172a' }}>{al.targetAccount}</strong> | IP:{' '}
                  <span style={{ fontFamily: 'monospace' }}>{al.ipAddress}</span>
                </div>

                {!isResolved && (
                  <Space>
                    <Popconfirm
                      title="Kích hoạt ngắt kết nối khẩn cấp?"
                      description="Hệ thống sẽ lập tức thu hồi mọi Session Token và khóa Private Key truy cập Smart Contract."
                      onConfirm={() => handleEmergencyLock(al.targetAccount, al.id)}
                      okButtonProps={{ danger: true }}
                    >
                      <Button size="small" danger icon={<LockOutlined />}>
                        Khóa Quyền Khẩn Cấp
                      </Button>
                    </Popconfirm>

                    <Button
                      size="small"
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      style={{ background: '#059669' }}
                      onClick={() => handleResolve(al.id)}
                    >
                      Xác Nhận Đã Xử Lý
                    </Button>
                  </Space>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
