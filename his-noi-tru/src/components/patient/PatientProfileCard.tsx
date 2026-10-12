import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Input,
  message,
  Typography,
  Divider,
} from 'antd';
import {
  QrcodeOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  PhoneOutlined,
  HeartOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { PatientProfile } from '../../types/auth';
import { MockApi } from '../../services/mockApi';
import { QRModal } from '../common/QRModal';
import { truncateAddress } from '../../services/web3Service';

const { Text, Title } = Typography;
const { Option } = Select;

interface PatientProfileCardProps {
  patient: PatientProfile;
  onProfileUpdated?: (updated: PatientProfile) => void;
}

export const PatientProfileCard: React.FC<PatientProfileCardProps> = ({
  patient,
  onProfileUpdated,
}) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleEditSubmit = async (values: any) => {
    setLoading(true);
    try {
      const updated = await MockApi.updatePatientMedicalInfo({
        bloodGroup: values.bloodGroup,
        allergies: values.allergies || [],
        chronicDiseases: values.chronicDiseases || [],
        emergencyContact: {
          name: values.emergencyName,
          relationship: values.emergencyRel,
          phone: values.emergencyPhone,
        },
      });
      message.success('Cập nhật thông tin y tế cơ bản thành công!');
      onProfileUpdated?.(updated);
      setEditModalVisible(false);
    } catch (err: any) {
      message.error(err.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroupColors: Record<string, string> = {
    'A+': 'red',
    'A-': 'volcano',
    'B+': 'blue',
    'B-': 'geekblue',
    'AB+': 'purple',
    'AB-': 'magenta',
    'O+': 'green',
    'O-': 'cyan',
  };

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <UserOutlined style={{ color: '#0891b2' }} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>Hồ Sơ Y Tế Cá Nhân (PHID)</span>
              <Tag color="cyan" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {patient.phid}
              </Tag>
            </Space>

            <Space>
              <Button
                type="default"
                icon={<QrcodeOutlined />}
                onClick={() => setQrModalVisible(true)}
                style={{ borderColor: '#0891b2', color: '#0891b2' }}
              >
                Mã QR PHID
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  form.setFieldsValue({
                    bloodGroup: patient.bloodGroup,
                    allergies: patient.allergies,
                    chronicDiseases: patient.chronicDiseases,
                    emergencyName: patient.emergencyContact.name,
                    emergencyRel: patient.emergencyContact.relationship,
                    emergencyPhone: patient.emergencyContact.phone,
                  });
                  setEditModalVisible(true);
                }}
                style={{ background: '#0891b2' }}
              >
                Cập Nhật Y Tế
              </Button>
            </Space>
          </div>
        }
        style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Descriptions bordered size="small" column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Họ và Tên">
            <Text strong style={{ color: '#0f172a' }}>
              {patient.fullName}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số CCCD (12 số)">
            <Text style={{ fontFamily: 'monospace' }}>{patient.cccd}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh / Tuổi">
            {patient.dateOfBirth} ({new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} tuổi)
          </Descriptions.Item>

          <Descriptions.Item label="Giới tính">{patient.gender}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{patient.phone}</Descriptions.Item>
          <Descriptions.Item label="Thẻ BHYT">
            <Text style={{ fontFamily: 'monospace' }}>{patient.insuranceCardNumber || 'Chưa liên kết'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Địa chỉ Ví On-Chain" span={2}>
            <Text copyable={{ text: patient.walletAddress }} style={{ fontFamily: 'monospace', color: '#0891b2' }}>
              {truncateAddress(patient.walletAddress, 14, 10)}
            </Text>
            <Tag color="green" style={{ marginLeft: 8 }}>
              Smart Wallet
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Nhóm Máu">
            <Tag color={bloodGroupColors[patient.bloodGroup] || 'blue'} style={{ fontWeight: 700 }}>
              <HeartOutlined style={{ marginRight: 4 }} />
              {patient.bloodGroup}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Tiền Sử Dị Ứng" span={2}>
            {patient.allergies.length > 0 ? (
              <Space wrap size={[4, 4]}>
                {patient.allergies.map((all, i) => (
                  <Tag color="error" key={i} icon={<AlertOutlined />}>
                    {all}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Chưa ghi nhận dị ứng</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Bệnh Mạn Tính" span={2}>
            {patient.chronicDiseases.length > 0 ? (
              <Space wrap size={[4, 4]}>
                {patient.chronicDiseases.map((cd, i) => (
                  <Tag color="warning" key={i}>
                    {cd}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Không có</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Liên Hệ Khẩn Cấp" span={4}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>
                <strong>{patient.emergencyContact.name}</strong> ({patient.emergencyContact.relationship})
              </span>
              <Tag color="cyan" icon={<PhoneOutlined />}>
                {patient.emergencyContact.phone}
              </Tag>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* QR Code Modal */}
      <QRModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        title="MÃ ĐỊNH DANH Y TẾ CÁ NHÂN (PHID)"
        value={patient.phid}
        subTitle={`Bệnh nhân: ${patient.fullName} | CCCD: ${patient.cccd}`}
        downloadFileName={`PHID_${patient.phid}`}
      />

      {/* Edit Medical Info Modal */}
      <Modal
        open={editModalVisible}
        title="Cập Nhật Thông Tin Y Tế Cơ Bản"
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit} style={{ marginTop: 16 }}>
          <Form.Item
            name="bloodGroup"
            label={<span style={{ fontWeight: 500 }}>Nhóm máu (Hệ ABO & Rh)</span>}
            rules={[{ required: true, message: 'Vui lòng chọn nhóm máu' }]}
          >
            <Select placeholder="Chọn nhóm máu">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <Option key={bg} value={bg}>
                  Nhóm máu {bg}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="allergies"
            label={<span style={{ fontWeight: 500 }}>Tiền sử dị ứng (Thuốc, thức ăn, hóa chất)</span>}
          >
            <Select
              mode="tags"
              placeholder="Nhập và ấn Enter (VD: Penicillin, Aspirin, Tôm, Cua)"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="chronicDiseases"
            label={<span style={{ fontWeight: 500 }}>Bệnh mạn tính / Tiền sử điều trị</span>}
          >
            <Select
              mode="tags"
              placeholder="Nhập và ấn Enter (VD: Tăng huyết áp, Đái tháo đường Type 2)"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }}>Người Liên Hệ Khẩn Cấp</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="emergencyName"
              label="Họ tên người nhà"
              rules={[{ required: true, message: 'Nhập họ tên người liên hệ' }]}
            >
              <Input placeholder="Trần Thị Mai" />
            </Form.Item>

            <Form.Item
              name="emergencyRel"
              label="Mối quan hệ"
              rules={[{ required: true, message: 'Nhập mối quan hệ' }]}
            >
              <Input placeholder="Vợ / Chồng / Con" />
            </Form.Item>
          </div>

          <Form.Item
            name="emergencyPhone"
            label="Số điện thoại khẩn cấp"
            rules={[
              { required: true, message: 'Nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'SĐT gồm 10 số' },
            ]}
          >
            <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0987654321" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#0891b2' }}>
              Lưu Thay Đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
