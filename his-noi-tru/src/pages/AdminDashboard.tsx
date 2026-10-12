import React, { useState } from 'react';
import { Card, Tabs, Typography, Tag, Space } from 'antd';
import {
  DashboardOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  BankOutlined,
  AlertOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { DoctorApprovalTable } from '../components/admin/DoctorApprovalTable';
import { SystemAuditLogTable } from '../components/admin/SystemAuditLogTable';
import { HospitalWhitelistTable } from '../components/admin/HospitalWhitelistTable';
import { SecurityAlertsPanel } from '../components/admin/SecurityAlertsPanel';
import { HospitalOnChainLogsTable } from '../components/admin/HospitalOnChainLogsTable';
import { BlockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const AdminDashboard: React.FC = () => {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('analytics');

  const tabItems = [
    {
      key: 'analytics',
      label: (
        <span>
          <DashboardOutlined />
          Tổng Quan & Thống Kê (Recharts)
        </span>
      ),
      children: <AnalyticsDashboard />,
    },
    {
      key: 'doctors',
      label: (
        <span>
          <SafetyCertificateOutlined />
          Xét Duyệt Bác Sĩ (Doctor Approval)
        </span>
      ),
      children: <DoctorApprovalTable />,
    },
    {
      key: 'onchain_tx',
      label: (
        <span>
          <BlockOutlined />
          Nhật Ký On-Chain BV (Explorer)
        </span>
      ),
      children: <HospitalOnChainLogsTable />,
    },
    {
      key: 'audit',
      label: (
        <span>
          <AuditOutlined />
          Nhật Ký Thao Tác Hệ Thống (Audit Logs)
        </span>
      ),
      children: <SystemAuditLogTable />,
    },
    {
      key: 'hospitals',
      label: (
        <span>
          <BankOutlined />
          Mạng Lưới Bệnh Viện & Whitelist
        </span>
      ),
      children: <HospitalWhitelistTable />,
    },
    {
      key: 'security',
      label: (
        <span>
          <AlertOutlined />
          Cảnh Báo An Ninh Khẩn Cấp (Threat Detection)
        </span>
      ),
      children: <SecurityAlertsPanel />,
    },
  ];

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Info */}
      <Card
        style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                Trung Tâm Quản Trị Hệ Thống Y Tế On-Chain (Admin Console)
              </Title>
              <Tag color={role === 'SUPER_ADMIN' ? 'gold' : 'purple'} style={{ fontWeight: 600 }}>
                {role === 'SUPER_ADMIN' ? 'Bộ Y Tế / SuperAdmin' : 'Quản Trị Bệnh Viện'}
              </Tag>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Người vận hành: <strong>{user?.fullName || 'Quản Trị Viên'}</strong> | Giám sát Smart Contract & Định danh Y tế
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          items={tabItems}
        />
      </Card>
    </div>
  );
};
