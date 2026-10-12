import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Button, Alert, Typography, message } from 'antd';
import { MailOutlined, KeyOutlined, LockOutlined, CheckCircleFilled } from '@ant-design/icons';
import { MockApi } from '../../services/mockApi';

const { Text } = Typography;

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step1Form] = Form.useForm();
  const [step2Form] = Form.useForm();

  const handleStep1Submit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await MockApi.resetPassword(values.email);
      setEmail(values.email);
      message.success(`Mã OTP xác thực đã được gửi đến hộp thư ${values.email}! (Mã mẫu: 888999)`);
      setCurrentStep(1);
    } catch (err: any) {
      const msg = err.message || 'Không thể gửi mã xác thực.';
      message.error(msg);
      step1Form.setFields([{ name: 'email', errors: [msg] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (values: any) => {
    setLoading(true);
    try {
      await MockApi.confirmResetPassword(email, values.newPassword, values.otp);
      message.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.');
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Không thể đổi mật khẩu.';
      message.error(msg);
      if (msg.includes('OTP')) {
        step2Form.setFields([{ name: 'otp', errors: [msg] }]);
      } else {
        step2Form.setFields([{ name: 'newPassword', errors: [msg] }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    step1Form.resetFields();
    step2Form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={440}
      title="Khôi Phục Mật Khẩu"
      centered
    >
      <div style={{ marginTop: 8 }}>
        <Steps
          size="small"
          current={currentStep}
          style={{ marginBottom: 20 }}
          items={[
            { title: 'Nhập Email' },
            { title: 'Xác thực OTP & Đổi MK' },
          ]}
        />

        {currentStep === 0 ? (
          <Form form={step1Form} layout="vertical" onFinish={handleStep1Submit} initialValues={{ email: 'nguyenvanan@gmail.com' }}>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
              Nhập địa chỉ email đăng ký tài khoản. Hệ thống sẽ gửi mã xác thực OTP 6 số để thiết lập lại mật khẩu mới.
            </Text>

            <Form.Item
              name="email"
              label="Email đã đăng ký"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="example@health.vn" size="large" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: '#0891b2', marginTop: 8 }}>
              Gửi Mã Xác Thực OTP
            </Button>
          </Form>
        ) : (
          <Form form={step2Form} layout="vertical" onFinish={handleStep2Submit} initialValues={{ otp: '888999' }}>
            <Alert
              type="info"
              showIcon
              message={`Mã OTP đã gửi về ${email}`}
              description="Để thuận tiện demo, bạn có thể sử dụng mã OTP mặc định: 888999"
              style={{ marginBottom: 16, borderRadius: 8 }}
            />

            <Form.Item
              name="otp"
              label="Mã OTP (6 chữ số)"
              rules={[{ required: true, message: 'Nhập mã OTP' }]}
            >
              <Input prefix={<KeyOutlined style={{ color: '#94a3b8' }} />} placeholder="888999" maxLength={6} size="large" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 8, message: 'Tối thiểu 8 ký tự' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" size="large" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Xác nhận lại mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••" size="large" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: '#0891b2', marginTop: 8 }}>
              Cập Nhật Mật Khẩu Mới
            </Button>
          </Form>
        )}
      </div>
    </Modal>
  );
};
