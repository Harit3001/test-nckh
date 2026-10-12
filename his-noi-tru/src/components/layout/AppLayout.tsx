import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Tag } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../common/Header';
import { TxStatusWidget } from '../common/TxStatusWidget';
import { BlockchainDegradationBanner } from '../common/BlockchainDegradationBanner';
import { PatientDashboard } from '../../pages/PatientDashboard';
import { DoctorDashboard } from '../../pages/DoctorDashboard';
import { AdminDashboard } from '../../pages/AdminDashboard';

const { Content } = Layout;

export const AppLayout: React.FC = () => {
  const { role, user } = useAuth();

  // Navigation tab based on role
  const renderDashboard = () => {
    switch (role) {
      case 'PATIENT':
        return <PatientDashboard />;
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return <AdminDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Universal Top Header */}
      <AppHeader />

      {/* Graceful Degradation UX Warning Banner */}
      <BlockchainDegradationBanner />

      {/* Main Content Area */}
      <Content style={{ background: '#f8fafc', paddingBottom: 60 }}>
        {renderDashboard()}
      </Content>

      {/* Floating Transaction Lifecycle Steps Widget */}
      <TxStatusWidget />
    </Layout>
  );
};
