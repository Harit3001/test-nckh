import React from 'react';
import {
  Button,
  Dropdown,
  Badge,
  Popover,
  Tag,
  Space,
  Avatar,
  Typography,
  Switch,
  Tooltip,
} from 'antd';
import {
  SafetyCertificateOutlined,
  BellOutlined,
  WalletOutlined,
  UserOutlined,
  SwapOutlined,
  CheckCircleFilled,
  WarningOutlined,
  LogoutOutlined,
  ReloadOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { useNotification } from '../../context/NotificationContext';
import { truncateAddress } from '../../services/web3Service';
import { UserRole } from '../../types/auth';

const { Text } = Typography;

export const AppHeader: React.FC = () => {
  const { user, role, switchRoleDemo, logout } = useAuth();
  const { walletAddress, isConnected, connectWallet, disconnectWallet, isSlowNetwork, toggleSlowNetwork } =
    useWeb3();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotification();

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    PATIENT: { label: 'Bệnh Nhân', color: 'cyan' },
    DOCTOR: { label: 'Bác Sĩ Điều Trị', color: 'blue' },
    ADMIN: { label: 'Quản Trị Bệnh Viện', color: 'purple' },
    SUPER_ADMIN: { label: 'SuperAdmin (Bộ Y Tế)', color: 'gold' },
  };

  const roleMenuItems = [
    {
      key: 'PATIENT',
      label: 'Bệnh nhân (Nguyễn Văn An)',
      icon: <UserOutlined />,
      onClick: () => switchRoleDemo('PATIENT'),
    },
    {
      key: 'DOCTOR',
      label: 'Bác sĩ (BS. CKI Trần Minh Tuấn)',
      icon: <SafetyCertificateOutlined />,
      onClick: () => switchRoleDemo('DOCTOR'),
    },
    {
      key: 'ADMIN',
      label: 'Quản trị viên BV (Bạch Mai)',
      icon: <ClusterOutlined />,
      onClick: () => switchRoleDemo('ADMIN'),
    },
    {
      key: 'SUPER_ADMIN',
      label: 'SuperAdmin (Bộ Y Tế / Giám sát)',
      icon: <SafetyCertificateOutlined />,
      onClick: () => switchRoleDemo('SUPER_ADMIN'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'AUTH_PAGE',
      label: 'Về Màn Hình Đăng Nhập (Login / Register)',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  const notificationContent = (
    <div style={{ width: 340, maxHeight: 420, overflowY: 'auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 8,
          marginBottom: 8,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Text strong style={{ fontSize: 13 }}>
          Thông báo On-Chain & Truy cập
        </Text>
        <Space size="small">
          <Button type="link" size="small" onClick={markAllAsRead} style={{ padding: 0 }}>
            Đọc tất cả
          </Button>
          <Button type="link" size="small" onClick={clearAll} style={{ padding: 0, color: '#94a3b8' }}>
            Xóa
          </Button>
        </Space>
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>
          Không có thông báo mới
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              marginBottom: 6,
              background: n.isRead ? '#f8fafc' : '#ecfeff',
              cursor: 'pointer',
              border: n.isRead ? '1px solid #f1f5f9' : '1px solid #a5f3fc',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 12, color: '#0f172a' }}>
                {n.title}
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                {n.time}
              </Text>
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>{n.description}</div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <header
      style={{
        height: 64,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Brand Logo & System Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 22,
            boxShadow: '0 2px 6px rgba(8, 145, 178, 0.35)',
          }}
        >
          <SafetyCertificateOutlined />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', letterSpacing: '-0.3px' }}>
              EMR-CHAIN
            </span>
            <Tag color="cyan" style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>
              v2.5 On-Chain
            </Tag>
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Hồ Sơ Bệnh Án Điện Tử & Phân Quyền Blockchain
          </div>
        </div>
      </div>

      {/* Middle & Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Network Status Badge */}
        <Tooltip title="Mạng thử nghiệm Ethereum Sepolia Testnet neo Hash">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#f1f5f9',
              padding: '5px 10px',
              borderRadius: 20,
              fontSize: 12,
              border: '1px solid #e2e8f0',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
              }}
            />
            <Text style={{ fontSize: 12, color: '#334155' }}>Sepolia #19842580</Text>
          </div>
        </Tooltip>

        {/* Slow Network / Degradation Mode Switch */}
        <Tooltip title="Bật/Tắt chế độ mô phỏng mạng blockchain phản hồi chậm (Graceful Degradation)">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isSlowNetwork ? '#fef3c7' : '#f8fafc',
              border: isSlowNetwork ? '1px solid #f59e0b' : '1px solid #e2e8f0',
              padding: '4px 10px',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
          >
            <WarningOutlined style={{ color: isSlowNetwork ? '#d97706' : '#94a3b8' }} />
            <span style={{ fontSize: 11, color: isSlowNetwork ? '#b45309' : '#64748b', fontWeight: 500 }}>
              Mạng chậm
            </span>
            <Switch
              size="small"
              checked={isSlowNetwork}
              onChange={(val) => toggleSlowNetwork(val)}
              style={{ background: isSlowNetwork ? '#f59e0b' : undefined }}
            />
          </div>
        </Tooltip>

        {/* Role Switcher Demo */}
        <Dropdown menu={{ items: roleMenuItems }} trigger={['click']}>
          <Button
            type="default"
            icon={<SwapOutlined />}
            style={{
              borderColor: '#0891b2',
              color: '#0891b2',
              fontWeight: 500,
              background: '#ecfeff',
            }}
          >
            Vai trò: <Tag color={roleLabels[role].color} style={{ margin: '0 0 0 4px' }}>{roleLabels[role].label}</Tag>
          </Button>
        </Dropdown>

        {/* Real-time Notification Bell Popover */}
        <Popover content={notificationContent} title={null} trigger="click" placement="bottomRight">
          <Badge count={unreadCount} overflowCount={9} offset={[-2, 4]}>
            <Button
              shape="circle"
              icon={<BellOutlined />}
              style={{ border: '1px solid #e2e8f0', color: '#475569' }}
            />
          </Badge>
        </Popover>

        {/* Web3 Wallet Connector */}
        {isConnected ? (
          <Tooltip title={`Ví On-Chain: ${walletAddress}`}>
            <Button
              type="text"
              icon={<WalletOutlined style={{ color: '#0891b2' }} />}
              onClick={() => disconnectWallet()}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              {truncateAddress(walletAddress || undefined)}
            </Button>
          </Tooltip>
        ) : (
          <Button
            type="primary"
            icon={<WalletOutlined />}
            onClick={() => connectWallet()}
            style={{ background: '#0891b2' }}
          >
            Kết nối Ví
          </Button>
        )}

        {/* User Info & Logout */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'profile',
                label: user?.fullName || 'Tài khoản',
                icon: <UserOutlined />,
                disabled: true,
              },
              {
                key: 'reset',
                label: 'Khôi phục Dữ liệu Gốc',
                icon: <ReloadOutlined />,
                onClick: () => {
                  localStorage.clear();
                  window.location.reload();
                },
              },
              {
                type: 'divider',
              },
              {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: logout,
              },
            ],
          }}
          placement="bottomRight"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Avatar style={{ backgroundColor: '#0891b2' }} icon={<UserOutlined />} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong style={{ fontSize: 13, lineHeight: '15px' }}>
                {user?.fullName?.split(' ').slice(-2).join(' ') || 'User'}
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                {roleLabels[role].label}
              </Text>
            </div>
          </div>
        </Dropdown>

        {/* Quick Logout Button for easy test of Auth & Validation */}
        <Tooltip title="Đăng xuất khỏi phiên hiện tại để về màn hình Đăng nhập (Test Validation)">
          <Button
            type="dashed"
            danger
            size="small"
            icon={<LogoutOutlined />}
            onClick={logout}
            style={{ borderRadius: 6, fontSize: 12, fontWeight: 500 }}
          >
            Đăng xuất
          </Button>
        </Tooltip>
      </div>
    </header>
  );
};
