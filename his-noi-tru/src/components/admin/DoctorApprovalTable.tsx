import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Typography, Popconfirm, message, Tooltip } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  FilePdfOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DoctorProfile } from '../../types/auth';
import { MockApi } from '../../services/mockApi';
import { truncateAddress } from '../../services/web3Service';

const { Text } = Typography;

export const DoctorApprovalTable: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [selectedCertDoc, setSelectedCertDoc] = useState<DoctorProfile | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await MockApi.getDoctorApplications();
      setDoctors(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleApprove = async (docId: string) => {
    try {
      await MockApi.approveDoctor(docId);
      message.success('Đã phê duyệt hồ sơ Bác sĩ và kích hoạt trên Smart Contract!');
      await fetchDoctors();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleReject = async (docId: string) => {
    try {
      await MockApi.rejectDoctor(docId);
      message.warning('Đã từ chối hồ sơ đăng ký của Bác sĩ.');
      await fetchDoctors();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleSuspend = async (docId: string) => {
    try {
      await MockApi.suspendDoctor(docId);
      message.error('Đã khóa tài khoản và ngắt quyền On-Chain của Bác sĩ.');
      await fetchDoctors();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const columns = [
    {
      title: 'Bác Sĩ & Mã Định Danh',
      key: 'name',
      render: (_: any, record: DoctorProfile) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.fullName}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Mã: <Tag color="blue" style={{ margin: 0 }}>{record.doctorId}</Tag> | {record.phone}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#0891b2' }}>
            {truncateAddress(record.walletAddress, 8, 6)}
          </div>
        </div>
      ),
    },
    {
      title: 'Chuyên Khoa & Bệnh Viện',
      key: 'hospital',
      render: (_: any, record: DoctorProfile) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.specialty}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.hospitalName}</div>
        </div>
      ),
    },
    {
      title: 'Số CCHN & Tệp Hồ Sơ',
      key: 'license',
      render: (_: any, record: DoctorProfile) => (
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{record.licenseNumber}</div>
          <Button
            type="link"
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => {
              setSelectedCertDoc(record);
              setCertModalVisible(true);
            }}
            style={{ padding: 0, fontSize: 11, color: '#0891b2' }}
          >
            {record.licenseFileName || 'Xem chứng chỉ'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: DoctorProfile['status']) => {
        if (status === 'ACTIVE') return <Tag color="success">ĐÃ PHÊ DUYỆT</Tag>;
        if (status === 'PENDING_APPROVAL') return <Tag color="warning">CHỜ XÉT DUYỆT</Tag>;
        return <Tag color="error">ĐÃ KHÓA</Tag>;
      },
    },
    {
      title: 'Thao Tác Quản Trị',
      key: 'actions',
      render: (_: any, record: DoctorProfile) => (
        <Space size="small">
          {record.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                style={{ background: '#059669' }}
                onClick={() => handleApprove(record.id)}
              >
                Phê duyệt
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Từ chối
              </Button>
            </>
          )}

          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="Khóa tài khoản bác sĩ?"
              description="Khóa quyền ký số và thu hồi quyền xem bệnh án on-chain."
              onConfirm={() => handleSuspend(record.id)}
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<LockOutlined />}>
                Khóa TK
              </Button>
            </Popconfirm>
          )}

          {record.status === 'SUSPENDED' && (
            <Button
              size="small"
              type="primary"
              style={{ background: '#0891b2' }}
              onClick={() => handleApprove(record.id)}
            >
              Mở khóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <SafetyCertificateOutlined style={{ color: '#0891b2' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Quản Lý & Xét Duyệt Hồ Sơ Bác Sĩ (Doctor Directory)
              </span>
            </Space>
            <Button size="small" icon={<ReloadOutlined spin={loading} />} onClick={fetchDoctors}>
              Làm mới
            </Button>
          </div>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
      >
        <Table
          dataSource={doctors}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      {/* Certificate Viewer Modal */}
      <Modal
        open={certModalVisible}
        onCancel={() => setCertModalVisible(false)}
        footer={null}
        width={540}
        title={`Chứng Chỉ Hành Nghề - ${selectedCertDoc?.fullName}`}
      >
        {selectedCertDoc && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                height: 280,
                background: '#f1f5f9',
                border: '2px dashed #cbd5e1',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                textAlign: 'center',
              }}
            >
              <FilePdfOutlined style={{ fontSize: 48, color: '#ef4444', marginBottom: 12 }} />
              <Text strong style={{ fontSize: 14 }}>
                {selectedCertDoc.licenseFileName || 'Chung_Chi_Hanh_Nghe.pdf'}
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                Số hiệu: {selectedCertDoc.licenseNumber} | Cấp bởi: Bộ Y Tế Việt Nam
              </Text>
              <Tag color="green" style={{ marginTop: 12 }}>
                Đã kiểm tra chữ ký số CCHN
              </Tag>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              <Button onClick={() => setCertModalVisible(false)}>Đóng</Button>
              {selectedCertDoc.status === 'PENDING_APPROVAL' && (
                <Button
                  type="primary"
                  style={{ background: '#059669' }}
                  onClick={() => {
                    handleApprove(selectedCertDoc.id);
                    setCertModalVisible(false);
                  }}
                >
                  Xác Nhận Hợp Lệ & Phê Duyệt
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
