import React, { useState } from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { LoginForm } from '../components/auth/LoginForm';
import { PatientRegisterForm } from '../components/auth/PatientRegisterForm';
import { DoctorRegisterForm } from '../components/auth/DoctorRegisterForm';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

const { Title, Text } = Typography;

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<'LOGIN' | 'PATIENT_REGISTER' | 'DOCTOR_REGISTER'>('LOGIN');
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e2e8f0 50%, #ecfeff 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 28,
            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.35)',
            marginBottom: 12,
          }}
        >
          <SafetyCertificateOutlined />
        </div>
        <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
          EMR-CHAIN PLATFORM
        </Title>
        <Text style={{ fontSize: 14, color: '#64748b' }}>
          Hệ Thống Hồ Sơ Bệnh Án Điện Tử & Phân Quyền On-Chain
        </Text>
      </div>

      {/* Main Form Card */}
      <Card
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          padding: '8px 12px',
        }}
      >
        {view === 'LOGIN' && (
          <LoginForm
            onSwitchToRegisterPatient={() => setView('PATIENT_REGISTER')}
            onSwitchToRegisterDoctor={() => setView('DOCTOR_REGISTER')}
            onForgotPassword={() => setForgotPasswordVisible(true)}
          />
        )}

        {view === 'PATIENT_REGISTER' && (
          <PatientRegisterForm
            onBackToLogin={() => setView('LOGIN')}
            onSuccess={() => setView('LOGIN')}
          />
        )}

        {view === 'DOCTOR_REGISTER' && (
          <DoctorRegisterForm onBackToLogin={() => setView('LOGIN')} />
        )}
      </Card>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onClose={() => setForgotPasswordVisible(false)}
      />

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
        © 2026 EMR-CHAIN | Tuân thủ tiêu chuẩn HL7/FHIR & Chuẩn hóa mật mã học EIP-712 Ethereum
      </div>
    </div>
  );
};
