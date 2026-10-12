import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider, Alert, Space, Tag, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  WalletOutlined,
  KeyOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { MockApi } from '../../services/mockApi';
import { EIP712Modal } from '../common/EIP712Modal';

const { Text, Title } = Typography;

interface LoginFormProps {
  onSwitchToRegisterPatient: () => void;
  onSwitchToRegisterDoctor: () => void;
  onForgotPassword: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegisterPatient,
  onSwitchToRegisterDoctor,
  onForgotPassword,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { loginEmail, loginWallet } = useAuth();
  const { walletAddress, connectWallet } = useWeb3();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [eip712ModalVisible, setEip712ModalVisible] = useState(false);
  const [pendingNonce, setPendingNonce] = useState('');
  const [activeSigningWallet, setActiveSigningWallet] = useState('');

  const handleFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginEmail(values.email, values.password);
      message.success('Đăng nhập thành công!');
      onSuccess?.();
    } catch (err: any) {
      const errMsg = err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      setErrorMessage(errMsg);
      message.error(errMsg);

      const lower = errMsg.toLowerCase();
      if (lower.includes('mật khẩu') || lower.includes('password')) {
        form.setFields([
          {
            name: 'password',
            errors: [errMsg],
          },
        ]);
      } else if (
        lower.includes('không tồn tại') ||
        lower.includes('email') ||
        lower.includes('tài khoản') ||
        lower.includes('phê duyệt') ||
        lower.includes('khóa')
      ) {
        form.setFields([
          {
            name: 'email',
            errors: [errMsg],
          },
        ]);
      } else {
        form.setFields([
          {
            name: 'password',
            errors: [errMsg],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinishFailed = (errorInfo: any) => {
    const firstField = errorInfo?.errorFields?.[0];
    const firstError =
      firstField?.errors?.[0] || 'Vui lòng kiểm tra và điền đầy đủ các thông tin đăng nhập còn thiếu!';
    message.error(firstError);
    setErrorMessage(`Lỗi xác thực dữ liệu: ${firstError}`);
  };

  const handleMetaMaskLoginClick = async () => {
    setErrorMessage(null);
    try {
      const address = await connectWallet();
      const nonce = await MockApi.getWalletNonce(address);
      setActiveSigningWallet(address);
      setPendingNonce(nonce);
      setEip712ModalVisible(true);
    } catch (err: any) {
      const msg = err.message || 'Không thể kết nối ví MetaMask.';
      setErrorMessage(msg);
      message.error(msg);
    }
  };

  const handleEip712Signed = async (signature: string) => {
    setEip712ModalVisible(false);
    setLoading(true);
    try {
      await loginWallet(activeSigningWallet, signature);
      message.success('Đăng nhập bằng ví MetaMask thành công!');
      onSuccess?.();
    } catch (err: any) {
      const msg = err.message || 'Xác thực chữ ký ví thất bại.';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const setQuickCredentials = (email: string, pass: string = 'password123', autoSubmit = false) => {
    form.setFieldsValue({ email, password: pass });
    setErrorMessage(null);
    form.setFields([
      { name: 'email', errors: [] },
      { name: 'password', errors: [] },
    ]);
    if (autoSubmit) {
      setTimeout(() => {
        form.submit();
      }, 80);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#0f172a' }}>
          Đăng Nhập Hệ Thống
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Hồ Sơ Bệnh Án Điện Tử & Phân Quyền On-Chain
        </Text>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined style={{ fontSize: 20, color: '#dc2626' }} />}
          message={<span style={{ fontWeight: 700, color: '#991b1b', fontSize: 14 }}>Đăng Nhập Thất Bại</span>}
          description={
            <div style={{ color: '#7f1d1d', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
              {errorMessage}
            </div>
          }
          style={{
            marginBottom: 20,
            borderRadius: 10,
            border: '1.5px solid #f87171',
            background: '#fff1f2',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
          }}
          closable
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{ email: 'nguyenvanan@gmail.com', password: 'password123', remember: true }}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        onValuesChange={(changedValues) => {
          if (errorMessage) {
            setErrorMessage(null);
          }
          const changedField = Object.keys(changedValues)[0];
          if (changedField) {
            form.setFields([{ name: changedField, errors: [] }]);
          }
        }}
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Email hoặc Tên Đăng Nhập</span>}
          hasFeedback
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ email hoặc tên đăng nhập!' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const trimmed = value.trim().toLowerCase();
                const allowedShort = ['admin', 'superadmin', 'doctor', 'patient'];
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (allowedShort.includes(trimmed) || emailRegex.test(trimmed)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Email không đúng định dạng (Ví dụ: user@gmail.com)!'));
              },
            },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
            placeholder="vd: nguyenvanan@gmail.com hoặc admin@hospital.vn"
            size="large"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Mật Khẩu</span>}
          hasFeedback
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu đăng nhập!' },
            { min: 6, message: 'Mật khẩu phải có tối thiểu 6 ký tự!' },
          ]}
          style={{ marginBottom: 6 }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Nhập mật khẩu (Mặc định: password123)"
            size="large"
          />
        </Form.Item>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            marginTop: 6,
          }}
        >
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: '#475569', fontSize: 13 }}>Ghi nhớ phiên đăng nhập</Checkbox>
          </Form.Item>

          <a
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
            style={{
              fontSize: 13,
              color: '#0891b2',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <KeyOutlined />
            <span>Quên mật khẩu?</span>
          </a>
        </div>

        <Form.Item style={{ marginBottom: 14 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{
              background: '#0891b2',
              fontWeight: 600,
              height: 44,
              borderRadius: 8,
              fontSize: 15,
            }}
          >
            Đăng Nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '14px 0', color: '#94a3b8', fontSize: 12 }}>Hoặc</Divider>

      <Button
        size="large"
        block
        onClick={handleMetaMaskLoginClick}
        style={{
          height: 44,
          borderRadius: 8,
          borderColor: '#f59e0b',
          color: '#d97706',
          background: '#fffbeb',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>🦊</span>
        <span>Đăng nhập Ví MetaMask (EIP-712)</span>
      </Button>

      <div
        style={{
          marginTop: 18,
          padding: '12px 14px',
          background: '#f8fafc',
          borderRadius: 10,
          border: '1px dashed #cbd5e1',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
          ⚡ TÀI KHOẢN MẪU & TEST VALIDATION ĐĂNG NHẬP:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Tài khoản hợp lệ (Mật khẩu chuẩn):</div>
            <Space size={[6, 6]} wrap>
              <Tag
                color="cyan"
                style={{ cursor: 'pointer', padding: '3px 8px', fontSize: 12 }}
                onClick={() => setQuickCredentials('nguyenvanan@gmail.com', 'password123')}
              >
                Bệnh nhân (An)
              </Tag>
              <Tag
                color="blue"
                style={{ cursor: 'pointer', padding: '3px 8px', fontSize: 12 }}
                onClick={() => setQuickCredentials('tranminhtuan@bachmai.vn', 'password123')}
              >
                Bác sĩ (Tuấn)
              </Tag>
              <Tag
                color="purple"
                style={{ cursor: 'pointer', padding: '3px 8px', fontSize: 12 }}
                onClick={() => setQuickCredentials('admin@hospital.vn', 'admin123')}
              >
                Admin BV
              </Tag>
              <Tag
                color="gold"
                style={{ cursor: 'pointer', padding: '3px 8px', fontSize: 12 }}
                onClick={() => setQuickCredentials('superadmin@moh.gov.vn', 'super123')}
              >
                SuperAdmin
              </Tag>
            </Space>
          </div>

          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 8 }}>
            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginBottom: 4 }}>
              🧪 Bấm thử nghiệm kiểm tra lỗi (Click để chạy test ngay):
            </div>
            <Space size={[6, 6]} wrap>
              <Tag
                color="error"
                style={{ cursor: 'pointer', padding: '4px 9px', fontSize: 12, fontWeight: 500 }}
                onClick={() => setQuickCredentials('nguyenvanan@gmail.com', 'matkhausai_999', true)}
              >
                ❌ Test Mật Khẩu Sai
              </Tag>
              <Tag
                color="error"
                style={{ cursor: 'pointer', padding: '4px 9px', fontSize: 12, fontWeight: 500 }}
                onClick={() => setQuickCredentials('khongtontai@health.vn', 'password123', true)}
              >
                ❌ Test Email Chưa Đăng Ký
              </Tag>
              <Tag
                color="warning"
                style={{ cursor: 'pointer', padding: '4px 9px', fontSize: 12, fontWeight: 500 }}
                onClick={() => setQuickCredentials('hoangtuananh@bvcr.vn', 'password123', true)}
              >
                ⚠️ Test BS Chờ Duyệt
              </Tag>
            </Space>
          </div>
        </div>
      </div>

      {/* Navigation Switchers */}
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
        <div style={{ marginBottom: 6 }}>
          Quên mật khẩu đăng nhập?{' '}
          <a onClick={onForgotPassword} style={{ color: '#0891b2', fontWeight: 600 }}>
            Lấy lại mật khẩu qua OTP
          </a>
        </div>
        <div>
          Chưa có tài khoản Bệnh nhân?{' '}
          <a onClick={onSwitchToRegisterPatient} style={{ color: '#0891b2', fontWeight: 600 }}>
            Đăng ký ngay
          </a>
        </div>
        <div style={{ marginTop: 6 }}>
          Dành cho Bác sĩ & Chuyên gia y tế:{' '}
          <a onClick={onSwitchToRegisterDoctor} style={{ color: '#0891b2', fontWeight: 600 }}>
            Đăng ký tài khoản Bác sĩ
          </a>
        </div>
      </div>

      {/* EIP-712 Typed Signing Modal */}
      <EIP712Modal
        visible={eip712ModalVisible}
        walletAddress={activeSigningWallet}
        nonce={pendingNonce}
        onSign={handleEip712Signed}
        onCancel={() => setEip712ModalVisible(false)}
      />
    </div>
  );
};
