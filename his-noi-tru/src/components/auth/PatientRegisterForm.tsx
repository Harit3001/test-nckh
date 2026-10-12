import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Progress, Space, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { MockApi } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface PatientRegisterFormProps {
  onBackToLogin: () => void;
  onSuccess?: () => void;
}

export const PatientRegisterForm: React.FC<PatientRegisterFormProps> = ({
  onBackToLogin,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { switchRoleDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordScore, setPasswordScore] = useState<number>(0);

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordScore(calculatePasswordStrength(e.target.value));
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const newPatient = await MockApi.registerPatient({
        fullName: values.fullName,
        email: values.email,
        cccd: values.cccd,
        phone: values.phone,
        password: values.password,
      });

      message.success(`Đăng ký thành công! Mã định danh của bạn là ${newPatient.phid}`);
      await switchRoleDemo('PATIENT');
      onSuccess?.();
    } catch (err: any) {
      const msg = err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setErrorMessage(msg);
      message.error(msg);

      const lower = msg.toLowerCase();
      if (lower.includes('email')) {
        form.setFields([{ name: 'email', errors: [msg] }]);
      } else if (lower.includes('cccd')) {
        form.setFields([{ name: 'cccd', errors: [msg] }]);
      } else if (lower.includes('phone') || lower.includes('điện thoại')) {
        form.setFields([{ name: 'phone', errors: [msg] }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinishFailed = (errorInfo: any) => {
    const firstField = errorInfo?.errorFields?.[0];
    const firstError = firstField?.errors?.[0] || 'Vui lòng kiểm tra lại thông tin đăng ký!';
    message.error(firstError);
    setErrorMessage(`Lỗi nhập liệu: ${firstError}`);
  };

  const getProgressColor = () => {
    if (passwordScore <= 25) return '#ef4444';
    if (passwordScore <= 50) return '#f59e0b';
    if (passwordScore <= 75) return '#3b82f6';
    return '#10b981';
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBackToLogin}
          style={{ padding: 0, color: '#64748b', marginBottom: 8 }}
        >
          Quay lại Đăng nhập
        </Button>
        <Title level={3} style={{ marginBottom: 4, color: '#0f172a' }}>
          Đăng Ký Hồ Sơ Bệnh Nhân
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Khởi tạo mã định danh sức khỏe cá nhân (PHID) bảo mật On-Chain
        </Text>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Lỗi Đăng Ký Tài Khoản"
          description={errorMessage}
          style={{ marginBottom: 16, borderRadius: 8 }}
          closable
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        onValuesChange={(changedValues) => {
          if (errorMessage) setErrorMessage(null);
          const changedField = Object.keys(changedValues)[0];
          if (changedField) form.setFields([{ name: changedField, errors: [] }]);
        }}
        initialValues={{
          fullName: 'Lê Hoàng Nam',
          email: 'hoangnam@gmail.com',
          cccd: '079095001234',
          phone: '0981234567',
        }}
      >
        <Form.Item
          name="fullName"
          label={<span style={{ fontWeight: 500 }}>Họ và Tên (In hoa có dấu)</span>}
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
            placeholder="NGUYỄN VĂN AN"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="cccd"
          label={<span style={{ fontWeight: 500 }}>Số CCCD / Căn Cước (12 số)</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập số CCCD 12 số' },
            { pattern: /^[0-9]{12}$/, message: 'CCCD phải bao gồm đúng 12 chữ số' },
          ]}
        >
          <Input
            prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />}
            placeholder="001095012345"
            size="large"
            maxLength={12}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 500 }}>Địa chỉ Email</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
            placeholder="patient@gmail.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label={<span style={{ fontWeight: 500 }}>Số điện thoại liên hệ</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số' },
          ]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
            placeholder="0912345678"
            size="large"
            maxLength={10}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 500 }}>Mật khẩu đăng nhập</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
            size="large"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {/* Password Strength Meter */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: '#64748b' }}>Độ mạnh mật khẩu:</span>
            <span style={{ fontWeight: 600, color: getProgressColor() }}>
              {passwordScore <= 25 && 'Rất yếu'}
              {passwordScore > 25 && passwordScore <= 50 && 'Trung bình'}
              {passwordScore > 50 && passwordScore <= 75 && 'Khá mạnh'}
              {passwordScore > 75 && 'Rất an toàn'}
            </span>
          </div>
          <Progress
            percent={passwordScore}
            strokeColor={getProgressColor()}
            showInfo={false}
            size="small"
          />
        </div>

        <Form.Item
          name="confirmPassword"
          label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu</span>}
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận lại mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="••••••••"
            size="large"
          />
        </Form.Item>

        <Form.Item>
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
              marginTop: 8,
            }}
          >
            Đăng Ký Tài Khoản
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
