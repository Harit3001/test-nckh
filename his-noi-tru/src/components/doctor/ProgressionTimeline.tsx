import React, { useState } from 'react';
import {
  Card,
  Timeline,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Space,
  Typography,
  message,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  BlockOutlined,
} from '@ant-design/icons';
import { ProgressionNote } from '../../types/emr';
import { MockApi } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { truncateAddress } from '../../services/web3Service';

const { Text } = Typography;
const { TextArea } = Input;

interface ProgressionTimelineProps {
  recordId: string;
  progressions: ProgressionNote[];
  canEdit?: boolean;
  onProgressionAdded?: (newNote: ProgressionNote) => void;
}

export const ProgressionTimeline: React.FC<ProgressionTimelineProps> = ({
  recordId,
  progressions,
  canEdit = true,
  onProgressionAdded,
}) => {
  const { doctorProfile, user } = useAuth();
  const { executeTransaction, walletAddress } = useWeb3();

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleAddProgression = async (values: any) => {
    setLoading(true);
    try {
      const docName = doctorProfile?.fullName || user?.fullName || 'BS. Điều Trị';
      const docId = doctorProfile?.doctorId || 'BS-01';
      const docAddr = walletAddress || doctorProfile?.walletAddress || '0xDoctorWallet';

      // 1. Simulate on-chain appendProgression transaction
      await executeTransaction(
        'APPEND_PROGRESSION',
        docAddr,
        `Ghi diễn tiến điều trị mới cho bệnh án ${recordId}`
      );

      // 2. Add progression note with parentHash linking
      const newNote = await MockApi.appendProgression(recordId, {
        doctorName: docName,
        doctorId: docId,
        doctorAddress: docAddr,
        vitalSigns: {
          bloodPressure: values.bloodPressure,
          heartRate: values.heartRate,
          temperature: values.temperature,
          spO2: values.spO2,
        },
        clinicalEvolution: values.clinicalEvolution,
        treatmentCare: values.treatmentCare,
      });

      message.success('Đã thêm diễn tiến điều trị và neo chuỗi hash thành công!');
      onProgressionAdded?.(newNote);
      setModalVisible(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi ghi diễn tiến.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <HistoryOutlined style={{ color: '#0891b2' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Diễn Tiến Điều Trị (Append-Only Log)</span>
            <Tag color="cyan">Phiên bản #{progressions.length + 1}</Tag>
          </Space>

          {canEdit && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              style={{ background: '#0891b2' }}
            >
              Ghi Diễn Tiến Mới
            </Button>
          )}
        </div>
      }
      style={{
        borderRadius: 12,
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ padding: '4px 0' }}>
        <div
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            background: '#f8fafc',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            fontSize: 12,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <LockOutlined style={{ color: '#0891b2' }} />
          <span>
            <strong>Chính sách Bất Biến (Append-only):</strong> Mọi bản ghi diễn tiến điều trị cũ đều
            được bảo vệ bằng mã băm SHA-256 chuỗi mẹ-con (parentHash), không thể chỉnh sửa hoặc xóa
            bỏ để đảm bảo tính pháp lý y khoa.
          </span>
        </div>

        {progressions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
            Chưa có ghi chú diễn tiến hàng ngày.
          </div>
        ) : (
          <Timeline
            mode="left"
            items={progressions.map((prog, idx) => (
              {
                dot: <EditOutlined style={{ color: '#0891b2', fontSize: 14 }} />,
                children: (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginBottom: 12,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Space>
                        <Tag color="blue" style={{ fontWeight: 600 }}>
                          Lần #{idx + 1}
                        </Tag>
                        <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                          {prog.doctorName}
                        </Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(prog.timestamp).toLocaleString('vi-VN')}
                      </Text>
                    </div>

                    {/* Vitals Signs Pills */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '8px 0' }}>
                      <Tag color="red">
                        Huyết áp: <strong>{prog.vitalSigns.bloodPressure} mmHg</strong>
                      </Tag>
                      <Tag color="volcano">
                        Mạch: <strong>{prog.vitalSigns.heartRate} ck/p</strong>
                      </Tag>
                      <Tag color="gold">
                        Nhiệt độ: <strong>{prog.vitalSigns.temperature} °C</strong>
                      </Tag>
                      <Tag color="cyan">
                        SpO2: <strong>{prog.vitalSigns.spO2}%</strong>
                      </Tag>
                    </div>

                    <div style={{ fontSize: 13, color: '#334155', marginTop: 8 }}>
                      <div>
                        <strong>Diễn tiến lâm sàng:</strong> {prog.clinicalEvolution}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <strong>Y lệnh chăm sóc / điều trị:</strong> {prog.treatmentCare}
                      </div>
                    </div>

                    {/* Cryptographic Linkage Footer */}
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: '1px dashed #e2e8f0',
                        fontSize: 11,
                        color: '#64748b',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span>parentHash: </span>
                        <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
                          {truncateAddress(prog.parentHash, 8, 6)}
                        </span>
                        {' ➔ '}
                        <span>currentHash: </span>
                        <span style={{ fontFamily: 'monospace', color: '#0891b2', fontWeight: 600 }}>
                          {truncateAddress(prog.currentHash, 8, 6)}
                        </span>
                      </div>

                      <div>
                        <span>TxHash: </span>
                        <Text copyable={{ text: prog.txHash }} style={{ fontFamily: 'monospace' }}>
                          {truncateAddress(prog.txHash, 6, 4)}
                        </Text>
                      </div>
                    </div>
                  </div>
                ),
              }
            ))}
          />
        )}
      </div>

      {/* Append Progression Modal */}
      <Modal
        open={modalVisible}
        title="Ghi Nhận Diễn Tiến Điều Trị Mới (Append-Only)"
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddProgression}
          initialValues={{
            bloodPressure: '120/80',
            heartRate: 75,
            temperature: 36.6,
            spO2: 98,
          }}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <Form.Item name="bloodPressure" label="Huyết áp" rules={[{ required: true }]}>
              <Input placeholder="120/80" />
            </Form.Item>
            <Form.Item name="heartRate" label="Mạch (ck/p)" rules={[{ required: true }]}>
              <InputNumber min={40} max={200} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="temperature" label="Nhiệt độ (°C)" rules={[{ required: true }]}>
              <InputNumber min={35} max={42} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="spO2" label="SpO2 (%)" rules={[{ required: true }]}>
              <InputNumber min={70} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="clinicalEvolution"
            label={<span style={{ fontWeight: 500 }}>Diễn tiến lâm sàng & Triệu chứng ghi nhận</span>}
            rules={[{ required: true, message: 'Nhập diễn tiến lâm sàng' }]}
          >
            <TextArea rows={3} placeholder="Mô tả tình trạng người bệnh, phản ứng thuốc, triệu chứng mới..." />
          </Form.Item>

          <Form.Item
            name="treatmentCare"
            label={<span style={{ fontWeight: 500 }}>Y lệnh điều trị & Chăm sóc</span>}
            rules={[{ required: true, message: 'Nhập y lệnh điều trị' }]}
          >
            <TextArea rows={2} placeholder="Điều chỉnh liều thuốc, chế độ dinh dưỡng, theo dõi..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: '#0891b2' }}
            >
              Ký On-Chain & Lưu Diễn Tiến
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};
