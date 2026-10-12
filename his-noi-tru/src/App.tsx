import React from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { medicalTheme } from './theme/antdTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#0891b2',
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        Đang khởi động EMR-Chain On-Chain Platform...
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <AuthPage />;
};

export default function App() {
  return (
    <ConfigProvider theme={medicalTheme} locale={viVN}>
      <AuthProvider>
        <Web3Provider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </Web3Provider>
      </AuthProvider>
    </ConfigProvider>
  );
}
