import React, { useState } from 'react';
import { Form, Input, Button, Typography, Select, Upload, Alert, Result, Card, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  FilePdfOutlined,
  ClockCircleFilled,
} from '@ant-design/icons';
import { MockApi } from '../../services/mockApi';

const { Title, Text } = Typography;
const { Option } = Select;

interface DoctorRegisterFormProps {
  onBackToLogin: () => void;
}

export const DoctorRegisterForm: React.FC<DoctorRegisterFormProps> = ({ onBackToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredDoc, setRegisteredDoc] = useState<any | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const specialties = [
    'Tim Mạch Can Thiệp',
    'Nội Thần Kinh',
    'Nội Tiêu Hóa - Gan Mật',
    'Hồi Sức Cấp Cứu',
    'Ngoại Tiêu Hóa',
    'Chấn Thương Chỉnh Hình',
    'Chẩn Đoán Hình Ảnh',
    'Nhi Khoa',
    'Ung Bướu',
  ];

  const hospitals = [
    'Bệnh Viện Bạch Mai Hà Nội',
    'Bệnh Viện Chợ Rẫy TP.HCM',
    'Bệnh Viện Đại Học Y Dược TP.HCM',
    'Viện Tim Thành Phố Hồ Chí Minh',
    'Bệnh Viện Trung Ương Huế',
  ];

  const handleFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const doc = await MockApi.registerDoctor({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        doctorId: values.doctorId,
        specialty: values.specialty,
        hospitalName: values.hospitalName,
        licenseNumber: values.licenseNumber,
        licenseFileName: uploadedFile || 'Chung_Chi_Hanh_Nghe_BS.pdf',
      });
      setRegisteredDoc(doc);
      message.success('Hồ sơ đăng ký Bác sĩ đã được nộp thành công!');
    } catch (err: any) {
      const msg = err.message || 'Không thể gửi hồ sơ đăng ký.';
      setErrorMessage(msg);
      message.error(msg);

      const lower = msg.toLowerCase();
      if (lower.includes('email')) {
        form.setFields([{ name: 'email', errors: [msg] }]);
      } else if (lower.includes('chứng chỉ') || lower.includes('licensenumber')) {
        form.setFields([{ name: 'licenseNumber', errors: [msg] }]);
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

  // If already registered, show the PENDING_APPROVAL screen
  if (registeredDoc) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <Result
          icon={<ClockCircleFilled style={{ color: '#f59e0b', fontSize: 64 }} />}
          status="warning"
          title="HỒ SƠ ĐANG CHỜ PHÊ DUYỆT (PENDING_APPROVAL)"
          subTitle={
            <div style={{ textAlign: 'left', marginTop: 12 }}>
              <p>
                Kính gửi <strong>{registeredDoc.fullName}</strong>,
              </p>
              <p>
                Hồ sơ định danh Y tế của bạn đã được ghi nhận vào hàng đợi xét duyệt. Quản trị viên
                bệnh viện (<strong>{registeredDoc.hospitalName}</strong>) sẽ tiến hành đối chiếu
                Chứng chỉ hành nghề số <code>{registeredDoc.licenseNumber}</code> với cổng thông tin Bộ Y Tế.
              </p>
              <p>
                Sau khi được phê duyệt, địa chỉ ví on-chain của bạn sẽ được kích hoạt quyền tạo và ghi bệnh án.
              </p>
            </div>
          }
          extra={[
            <Button type="primary" key="login" onClick={onBackToLogin} style={{ background: '#0891b2' }}>
              Trở về Màn hình Đăng nhập
            </Button>,
          ]}
        >
          <Card size="small" style={{ background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 12 }}>
              <div><strong>Mã Bác Sĩ:</strong> {registeredDoc.doctorId}</div>
              <div><strong>Chuyên khoa:</strong> {registeredDoc.specialty}</div>
              <div><strong>Chứng chỉ đính kèm:</strong> {registeredDoc.licenseFileName}</div>
              <div><strong>Trạng thái:</strong> <span style={{ color: '#f59e0b', fontWeight: 600 }}>CHỜ DUYỆT ON-CHAIN</span></div>
            </div>
          </Card>
        </Result>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
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
          Đăng Ký Hồ Sơ Bác Sĩ
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Xác thực hành nghề y khoa & Đăng ký địa chỉ ví định danh
        </Text>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Lỗi Đăng Ký Bác Sĩ"
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
          fullName: 'BS. CKI Đỗ Hải Long',
          email: 'hailong@bachmai.vn',
          phone: '0918765432',
          doctorId: 'BS-TM-09',
          specialty: 'Tim Mạch Can Thiệp',
          hospitalName: 'Bệnh Viện Bạch Mai Hà Nội',
          licenseNumber: '018942/BYT-CCHN',
        }}
      >
        <Form.Item
          name="fullName"
          label={<span style={{ fontWeight: 500 }}>Họ và Tên Bác Sĩ (kèm học hàm/học vị)</span>}
          rules={[{ required: true, message: 'Vui lòng nhập họ tên bác sĩ' }]}
        >
          <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="BS. CKI Trần Minh Tuấn" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 500 }}>Email công vụ</span>}
            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="doctor@hospital.vn" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
            rules={[{ required: true, message: 'Nhập số điện thoại' }]}
          >
            <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0901234567" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="doctorId"
            label={<span style={{ fontWeight: 500 }}>Mã số Bác Sĩ</span>}
            rules={[{ required: true, message: 'Nhập mã bác sĩ' }]}
          >
            <Input placeholder="BS-TIM-01" />
          </Form.Item>

          <Form.Item
            name="licenseNumber"
            label={<span style={{ fontWeight: 500 }}>Số CCHN Bộ Y Tế</span>}
            rules={[{ required: true, message: 'Nhập số chứng chỉ hành nghề' }]}
          >
            <Input placeholder="003412/BYT-CCHN" />
          </Form.Item>
        </div>

        <Form.Item
          name="hospitalName"
          label={<span style={{ fontWeight: 500 }}>Bệnh viện / Cơ sở y tế công tác</span>}
          rules={[{ required: true, message: 'Chọn bệnh viện công tác' }]}
        >
          <Select placeholder="Chọn bệnh viện">
            {hospitals.map((h) => (
              <Option key={h} value={h}>{h}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="specialty"
          label={<span style={{ fontWeight: 500 }}>Chuyên khoa</span>}
          rules={[{ required: true, message: 'Chọn chuyên khoa' }]}
        >
          <Select placeholder="Chọn chuyên khoa">
            {specialties.map((s) => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Certificate Upload Component */}
        <Form.Item
          label={<span style={{ fontWeight: 500 }}>Đính kèm Chứng Chỉ Hành Nghề (PDF / Ảnh chụp)</span>}
          extra="Hỗ trợ file định dạng .PDF, .PNG, .JPG (tối đa 5MB) để Admin kiểm tra tính pháp lý."
        >
          <Upload
            beforeUpload={(file) => {
              const isAllowed =
                file.type === 'application/pdf' ||
                file.type === 'image/png' ||
                file.type === 'image/jpeg';
              if (!isAllowed) {
                message.error('Chỉ chấp nhận file định dạng PDF hoặc Ảnh PNG/JPG!');
                return Upload.LIST_IGNORE;
              }
              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error('Kích thước file không được vượt quá 5MB!');
                return Upload.LIST_IGNORE;
              }
              setUploadedFile(file.name);
              message.success(`Đã đính kèm file: ${file.name}`);
              return false; // Prevent automatic HTTP post
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Tải lên Chứng chỉ hành nghề</Button>
          </Upload>
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
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
            }}
          >
            Nộp Hồ Sơ Đăng Ký Chờ Phê Duyệt
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
