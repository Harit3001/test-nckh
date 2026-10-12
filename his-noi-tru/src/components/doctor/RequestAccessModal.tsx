import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Typography, message } from 'antd';
import { SendOutlined, KeyOutlined } from '@ant-design/icons';
import { MockApi } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface RequestAccessModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { doctorProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const docName = doctorProfile?.fullName || user?.fullName || 'BS. CKI Trần Minh Tuấn';
      const docId = doctorProfile?.doctorId || 'BS-TIM-01';
      const docAddr = doctorProfile?.walletAddress || '0x71C8fb866A37029d0f457739B7CEbe773E72a9A2';
      const hospName = doctorProfile?.hospitalName || 'Bệnh Viện Bạch Mai Hà Nội';

      await MockApi.requestAccess({
        patientPhid: values.patientPhid,
        doctorAddress: docAddr,
        doctorId: docId,
        doctorName: docName,
        hospitalName: hospName,
        reason: values.reason,
        durationHours: values.durationHours,
        permissionRequested: values.permissionRequested,
      });

      message.success('Đã gửi yêu cầu truy cập hồ sơ đến Bệnh nhân thành công!');
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi gửi yêu cầu truy cập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyOutlined style={{ color: '#0891b2' }} />
          <span>Gửi Yêu Cầu Truy Cập Hồ Sơ Bệnh Nhân</span>
        </div>
      }
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          patientPhid: 'PHID-VN-2026-8901',
          durationHours: 168,
          permissionRequested: 'READ_ONLY',
          reason: 'Hội chẩn liên viện và đối chiếu chỉ định cận lâm sàng phục vụ điều trị.',
        }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="patientPhid"
          label={<span style={{ fontWeight: 500 }}>Mã định danh PHID hoặc CCCD Bệnh nhân</span>}
          rules={[{ required: true, message: 'Nhập PHID bệnh nhân cần truy cập' }]}
        >
          <Input placeholder="PHID-VN-2026-8901" />
        </Form.Item>

        <Form.Item
          name="reason"
          label={<span style={{ fontWeight: 500 }}>Lý do chuyên môn / Mục đích truy cập</span>}
          rules={[{ required: true, message: 'Vui lòng nêu rõ lý do khám/chữa bệnh' }]}
        >
          <TextArea rows={3} placeholder="VD: Khám chuyên khoa Tim Mạch, đối chiếu tiền sử dị ứng thuốc..." />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="durationHours"
            label={<span style={{ fontWeight: 500 }}>Thời hạn yêu cầu</span>}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value={24}>24 Giờ (Khám nhanh)</Option>
              <Option value={168}>7 Ngày (Điều trị)</Option>
              <Option value={720}>30 Ngày (Hậu phẫu)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="permissionRequested"
            label={<span style={{ fontWeight: 500 }}>Mức độ quyền</span>}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="READ_ONLY">Chỉ xem hồ sơ</Option>
              <Option value="READ_WRITE">Đọc & Kê đơn thuốc</Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={loading}
            style={{ background: '#0891b2' }}
          >
            Gửi Yêu Cầu Cho Bệnh Nhân
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
