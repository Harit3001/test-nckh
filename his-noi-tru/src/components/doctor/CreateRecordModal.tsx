import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Space,
  Divider,
  Card,
  Spin,
  Typography,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
  SafetyCertificateFilled,
  LockOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { MedicalRecord, PrescriptionItem, AttachmentFile } from '../../types/emr';
import { MockApi } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { EncryptedAttachmentUploader } from './EncryptedAttachmentUploader';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface CreateRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordCreated?: (newRecord: MedicalRecord) => void;
}

export const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  visible,
  onClose,
  onRecordCreated,
}) => {
  const [form] = Form.useForm();
  const { doctorProfile, patientProfile, user } = useAuth();
  const { executeTransaction, walletAddress } = useWeb3();

  const [loading, setLoading] = useState(false);
  const [hashingPhase, setHashingPhase] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    setHashingPhase('Đang tính toán hàm băm mật mã SHA-256 cho dữ liệu bệnh án...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setHashingPhase('Đang phát sóng giao dịch (Broadcast) lên Smart Contract Ethereum Sepolia...');

      const docName = doctorProfile?.fullName || user?.fullName || 'BS. CKI Trần Minh Tuấn';
      const docId = doctorProfile?.doctorId || 'BS-TIM-01';
      const docAddr = walletAddress || doctorProfile?.walletAddress || '0x71C8fb866A37029d0f457739B7CEbe773E72a9A2';
      const hospName = doctorProfile?.hospitalName || 'Bệnh Viện Bạch Mai Hà Nội';
      const dept = doctorProfile?.specialty || values.department || 'Khoa Tim Mạch Can Thiệp';

      // 1. Broadcast simulated on-chain transaction
      await executeTransaction(
        'ANCHOR_RECORD',
        docAddr,
        `Neo hash hồ sơ khám bệnh chẩn đoán: ${values.diagnosis}`
      );

      setHashingPhase('Đang hoàn tất đóng khối và lưu trữ hồ sơ...');

      // 2. Persist in database
      const createdRecord = await MockApi.createRecord({
        patientPhid: values.patientPhid || patientProfile?.phid || 'PHID-VN-2026-8901',
        doctorName: docName,
        doctorId: docId,
        doctorAddress: docAddr,
        hospitalName: hospName,
        department: dept,
        symptoms: values.symptoms,
        physicalExamination: values.physicalExamination,
        diagnosis: values.diagnosis,
        icd10Code: values.icd10Code,
        doctorAdvice: values.doctorAdvice,
        prescriptions: (values.prescriptions || []).map((p: any, idx: number) => ({
          id: 'rx-new-' + idx,
          drugName: p.drugName,
          activeSubstance: p.activeSubstance || p.drugName,
          dosage: p.dosage || '1 viên',
          unit: p.unit || 'Viên',
          quantity: p.quantity || 10,
          instructions: p.instructions || 'Uống sau ăn',
        })),
        attachments,
      });

      message.success(`Đã tạo bệnh án ${createdRecord.recordCode} và neo on-chain thành công!`);
      onRecordCreated?.(createdRecord);
      form.resetFields();
      setAttachments([]);
      onClose();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tạo bệnh án.');
    } finally {
      setLoading(false);
      setHashingPhase(null);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={() => !loading && onClose()}
      footer={null}
      width={780}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateFilled style={{ color: '#0891b2', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            Khởi Tạo Bệnh Án Mới & Neo Hash On-Chain
          </span>
        </div>
      }
      centered
      maskClosable={!loading}
    >
      <div style={{ position: 'relative' }}>
        {/* Blocking Overlay During Blockchain Broadcast */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.92)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backdropFilter: 'blur(3px)',
            }}
          >
            <Spin indicator={<LoadingOutlined style={{ fontSize: 44, color: '#0891b2' }} spin />} />
            <Title level={4} style={{ marginTop: 20, marginBottom: 6, color: '#0f172a' }}>
              Đang Neo Bệnh Án Lên Chuỗi Khối
            </Title>
            <Text style={{ color: '#0891b2', fontWeight: 500, fontSize: 14 }}>{hashingPhase}</Text>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
              Vui lòng không tắt hoặc tải lại trình duyệt trong quá trình đồng thuận
            </Text>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            patientPhid: patientProfile?.phid || 'PHID-VN-2026-8901',
            department: doctorProfile?.specialty || 'Khoa Tim Mạch Can Thiệp',
            diagnosis: 'Cơn đau thắt ngực ổn định (I20.9)',
            icd10Code: 'I20.9',
            symptoms: 'Bệnh nhân đau tức ngực trái lan lên vai, khó thở khi leo cầu thang.',
            physicalExamination: 'HA: 135/85 mmHg, nhịp tim 80 ck/p, không phù chi dưới.',
            doctorAdvice: 'Uống thuốc đều đặn, không ăn mặn, kiêng thuốc lá, tái khám sau 2 tuần.',
            prescriptions: [
              {
                drugName: 'Amlodipin STADA 5mg',
                activeSubstance: 'Amlodipine',
                dosage: '5mg',
                unit: 'Viên',
                quantity: 30,
                instructions: 'Uống 1 viên vào 8h00 sáng sau ăn',
              },
            ],
          }}
          style={{ marginTop: 14 }}
        >
          {/* Section: Patient & Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Form.Item
              name="patientPhid"
              label={<span style={{ fontWeight: 500 }}>Mã định danh PHID Bệnh nhân</span>}
              rules={[{ required: true, message: 'Nhập PHID bệnh nhân' }]}
            >
              <Input placeholder="PHID-VN-2026-8901" />
            </Form.Item>

            <Form.Item
              name="department"
              label={<span style={{ fontWeight: 500 }}>Chuyên khoa khám bệnh</span>}
              rules={[{ required: true }]}
            >
              <Input placeholder="Khoa Tim Mạch Can Thiệp" />
            </Form.Item>
          </div>

          {/* Section: Symptoms & Examination */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Form.Item
              name="symptoms"
              label={<span style={{ fontWeight: 500 }}>Triệu chứng lâm sàng</span>}
              rules={[{ required: true, message: 'Nhập triệu chứng' }]}
            >
              <TextArea rows={2} placeholder="Mô tả triệu chứng chính..." />
            </Form.Item>

            <Form.Item
              name="physicalExamination"
              label={<span style={{ fontWeight: 500 }}>Khám thực thể</span>}
              rules={[{ required: true, message: 'Nhập khám thực thể' }]}
            >
              <TextArea rows={2} placeholder="Huyết áp, mạch, tim phổi..." />
            </Form.Item>
          </div>

          {/* Section: Diagnosis & ICD-10 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <Form.Item
              name="diagnosis"
              label={<span style={{ fontWeight: 500 }}>Chẩn đoán chính</span>}
              rules={[{ required: true, message: 'Nhập chẩn đoán' }]}
            >
              <Input placeholder="Cơn đau thắt ngực ổn định" />
            </Form.Item>

            <Form.Item
              name="icd10Code"
              label={<span style={{ fontWeight: 500 }}>Mã ICD-10</span>}
              rules={[{ required: true, message: 'Nhập mã ICD-10' }]}
            >
              <Input placeholder="I20.9" />
            </Form.Item>
          </div>

          <Form.Item
            name="doctorAdvice"
            label={<span style={{ fontWeight: 500 }}>Lời dặn của Bác sĩ / Kế hoạch điều trị</span>}
            rules={[{ required: true }]}
          >
            <Input placeholder="Uống thuốc đúng giờ, tái khám sau 14 ngày..." />
          </Form.Item>

          <Divider style={{ margin: '14px 0' }}>
            <Space>
              <MedicineBoxOutlined style={{ color: '#0891b2' }} />
              <span>Chỉ Định Toa Thuốc Điện Tử</span>
            </Space>
          </Divider>

          {/* Dynamic Prescription Input List */}
          <Form.List name="prescriptions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 8, background: '#f8fafc', borderRadius: 8 }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 2.5fr auto', gap: 8, alignItems: 'center' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'drugName']}
                        rules={[{ required: true, message: 'Tên thuốc' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="Tên thuốc" size="small" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'activeSubstance']}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="Hoạt chất" size="small" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'dosage']}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="Hàm lượng" size="small" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true }]}
                        style={{ margin: 0 }}
                      >
                        <InputNumber min={1} max={999} placeholder="SL" size="small" style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'instructions']}
                        rules={[{ required: true }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="Cách dùng (Sáng 1, Chiều 1)" size="small" />
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 16 }}
                >
                  Thêm thuốc vào toa
                </Button>
              </>
            )}
          </Form.List>

          <Divider style={{ margin: '14px 0' }}>
            <Space>
              <LockOutlined style={{ color: '#0891b2' }} />
              <span>Đính Kèm File Kết Quả Xét Nghiệm / X-Quang (Mã hóa AES-256)</span>
            </Space>
          </Divider>

          {/* Encrypted Attachment Uploader */}
          <EncryptedAttachmentUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: '#0891b2', minWidth: 160 }}
            >
              Ký Số & Neo On-Chain
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
