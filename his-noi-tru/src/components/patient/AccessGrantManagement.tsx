import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  Popconfirm,
  Badge,
  Drawer,
  Typography,
  message,
  Tooltip,
} from 'antd';
import {
  KeyOutlined,
  PlusOutlined,
  StopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  UserOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { AccessGrant, AccessRequest, HospitalOrganization } from '../../types/access';
import { MockApi } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { truncateAddress } from '../../services/web3Service';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

interface AccessGrantManagementProps {
  onGrantChanged?: () => void;
}

export const AccessGrantManagement: React.FC<AccessGrantManagementProps> = ({ onGrantChanged }) => {
  const { patientProfile } = useAuth();
  const { executeTransaction, walletAddress } = useWeb3();

  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [hospitals, setHospitals] = useState<HospitalOrganization[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal & Drawer states
  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [requestsDrawerVisible, setRequestsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [grantType, setGrantType] = useState<'DOCTOR' | 'HOSPITAL'>('DOCTOR');
  const [durationOption, setDurationOption] = useState<number>(168); // 7 days in hours

  const fetchData = async () => {
    setLoading(true);
    try {
      const [g, r, h, d] = await Promise.all([
        MockApi.getAccessGrants(),
        MockApi.getAccessRequests(),
        MockApi.getHospitalWhitelist(),
        MockApi.getDoctorApplications(),
      ]);
      setGrants(g);
      setRequests(r);
      setHospitals(h);
      setDoctorsList(d.filter((doc) => doc.status === 'ACTIVE'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGrant = async (values: any) => {
    if (!patientProfile) return;

    setLoading(true);
    try {
      let docName = values.doctorName;
      let docAddress = values.doctorAddress;
      let docId = values.doctorId;
      let hospName = values.hospitalName || 'Bệnh Viện Đa Khoa';

      if (grantType === 'DOCTOR') {
        const foundDoc = doctorsList.find((d) => d.doctorId === values.selectedDoctorId);
        if (foundDoc) {
          docName = foundDoc.fullName;
          docAddress = foundDoc.walletAddress;
          docId = foundDoc.doctorId;
          hospName = foundDoc.hospitalName;
        }
      } else {
        // Cross-Hospital organization grant
        const foundHosp = hospitals.find((h) => h.id === values.selectedHospitalId);
        if (foundHosp) {
          docName = `Toàn bộ Bác sĩ - ${foundHosp.name}`;
          docAddress = foundHosp.walletAddress;
          docId = foundHosp.code;
          hospName = foundHosp.name;
        }
      }

      // Simulate on-chain transaction: grantAccess
      await executeTransaction(
        'GRANT_ACCESS',
        walletAddress || patientProfile.walletAddress || '0xPatientWallet',
        `Phân quyền ${values.permissionLevel} cho ${docName} (${durationOption} giờ)`
      );

      await MockApi.grantAccess({
        patientId: patientProfile.id,
        patientPhid: patientProfile.phid,
        doctorAddress: docAddress,
        doctorId: docId,
        doctorName: docName,
        hospitalName: hospName,
        durationHours: durationOption,
        permissionLevel: values.permissionLevel,
      });

      message.success('Đã cấp quyền truy cập và neo Smart Contract thành công!');
      setGrantModalVisible(false);
      form.resetFields();
      await fetchData();
      onGrantChanged?.();
    } catch (err: any) {
      message.error(err.message || 'Cấp quyền thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (grant: AccessGrant) => {
    try {
      // Simulate on-chain revokeAccess tx
      await executeTransaction(
        'REVOKE_ACCESS',
        walletAddress || '0xPatientWallet',
        `Thu hồi quyền truy cập của ${grant.doctorName}`
      );

      await MockApi.revokeAccess(grant.id, 'Bệnh nhân chủ động thu hồi quyền');
      message.success(`Đã thu hồi quyền truy cập của ${grant.doctorName}!`);
      await fetchData();
      onGrantChanged?.();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi thu hồi quyền.');
    }
  };

  const handleRequestResponse = async (reqId: string, approve: boolean) => {
    try {
      if (approve) {
        await executeTransaction(
          'GRANT_ACCESS',
          walletAddress || '0xPatientWallet',
          'Chấp thuận yêu cầu truy cập hồ sơ từ Bác sĩ'
        );
      }
      await MockApi.respondAccessRequest(reqId, approve);
      message.success(approve ? 'Đã phê duyệt yêu cầu cấp quyền!' : 'Đã từ chối yêu cầu.');
      await fetchData();
      onGrantChanged?.();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi phản hồi yêu cầu.');
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  const columns = [
    {
      title: 'Bác Sĩ / Đơn Vị Được Phân Quyền',
      key: 'doctor',
      render: (_: any, record: AccessGrant) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.doctorName}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            <BankOutlined style={{ marginRight: 4 }} />
            {record.hospitalName}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#0891b2' }}>
            {truncateAddress(record.doctorAddress, 10, 6)}
          </div>
        </div>
      ),
    },
    {
      title: 'Phạm Vi Quyền',
      dataIndex: 'permissionLevel',
      key: 'permissionLevel',
      render: (level: string) => {
        const color = level === 'FULL_ACCESS' ? 'purple' : level === 'READ_WRITE' ? 'blue' : 'cyan';
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: 'Thời Gian Cấp',
      dataIndex: 'grantedAt',
      key: 'grantedAt',
      render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời Hạn Còn Lại',
      key: 'expires',
      render: (_: any, record: AccessGrant) => {
        if (record.status === 'REVOKED') {
          return <Tag color="error">ĐÃ THU HỒI</Tag>;
        }
        const now = dayjs();
        const exp = dayjs(record.expiresAt);
        if (exp.isBefore(now)) {
          return <Tag color="default">ĐÃ HẾT HẠN</Tag>;
        }
        const diffHours = exp.diff(now, 'hour');
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Còn {diffHours > 24 ? `${Math.floor(diffHours / 24)} ngày` : `${diffHours} giờ`}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'ACTIVE') return <Tag color="success">CÒN HIỆU LỰC</Tag>;
        if (status === 'EXPIRED') return <Tag color="warning">HẾT HẠN</Tag>;
        return <Tag color="error">ĐÃ THU HỒI</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_: any, record: AccessGrant) => {
        if (record.status !== 'ACTIVE') {
          return <span style={{ color: '#94a3b8', fontSize: 12 }}>Đã kết thúc</span>;
        }
        return (
          <Popconfirm
            title="Xác nhận thu hồi quyền truy cập?"
            description="Bác sĩ sẽ bị ngắt quyền đọc/ghi hồ sơ bệnh án ngay lập tức trên Smart Contract."
            okText="Thu Hồi Ngay"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleRevoke(record)}
          >
            <Button danger size="small" icon={<StopOutlined />}>
              Thu hồi
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <KeyOutlined style={{ color: '#0891b2' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Quản Lý Phân Quyền Truy Cập On-Chain</span>
          </Space>

          <Space>
            <Badge count={pendingRequestsCount} offset={[-4, 2]}>
              <Button
                icon={<NotificationOutlined />}
                onClick={() => setRequestsDrawerVisible(true)}
              >
                Yêu cầu chờ duyệt
              </Button>
            </Badge>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setGrantModalVisible(true)}
              style={{ background: '#0891b2' }}
            >
              Cấp Quyền Mới
            </Button>
          </Space>
        </div>
      }
      style={{
        borderRadius: 12,
        border: '1px solid #e2e8f0',
      }}
    >
      <Table
        dataSource={grants}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Grant Access Modal */}
      <Modal
        open={grantModalVisible}
        title="Cấp Quyền Truy Cập Hồ Sơ Bệnh Án (Grant Access)"
        onCancel={() => setGrantModalVisible(false)}
        footer={null}
        width={540}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateGrant}
          initialValues={{
            permissionLevel: 'READ_WRITE',
            duration: 168,
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item label={<span style={{ fontWeight: 500 }}>Hình thức phân quyền</span>}>
            <Radio.Group
              value={grantType}
              onChange={(e) => setGrantType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="DOCTOR">Bác Sĩ Cụ Thể</Radio.Button>
              <Radio.Button value="HOSPITAL">Liên Bệnh Viện (Cross-Hospital)</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {grantType === 'DOCTOR' ? (
            <Form.Item
              name="selectedDoctorId"
              label={<span style={{ fontWeight: 500 }}>Chọn Bác sĩ điều trị</span>}
              rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
            >
              <Select placeholder="Chọn bác sĩ có chứng chỉ hành nghề">
                {doctorsList.map((doc) => (
                  <Option key={doc.doctorId} value={doc.doctorId}>
                    {doc.fullName} - {doc.specialty} ({doc.hospitalName})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="selectedHospitalId"
              label={<span style={{ fontWeight: 500 }}>Chọn Cơ sở y tế / Bệnh viện đối tác</span>}
              rules={[{ required: true, message: 'Vui lòng chọn bệnh viện' }]}
            >
              <Select placeholder="Chọn bệnh viện được Whitelist">
                {hospitals.map((hosp) => (
                  <Option key={hosp.id} value={hosp.id}>
                    {hosp.name} - Ví đa chữ ký: {truncateAddress(hosp.walletAddress, 8, 6)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="permissionLevel"
            label={<span style={{ fontWeight: 500 }}>Phạm vi quyền được cấp</span>}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="READ_ONLY">Chỉ xem (Xem bệnh án, kết quả CLS)</Radio>
              <Radio value="READ_WRITE">Đọc & Ghi (Kê đơn, ghi diễn tiến)</Radio>
              <Radio value="FULL_ACCESS">Toàn quyền (Đầy đủ hồ sơ lịch sử)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 500 }}>Thời hạn hiệu lực truy cập</span>}>
            <Space wrap style={{ marginBottom: 10 }}>
              <Tag
                color={durationOption === 24 ? 'cyan' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}
                onClick={() => setDurationOption(24)}
              >
                24 Giờ
              </Tag>
              <Tag
                color={durationOption === 168 ? 'cyan' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}
                onClick={() => setDurationOption(168)}
              >
                7 Ngày
              </Tag>
              <Tag
                color={durationOption === 720 ? 'cyan' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}
                onClick={() => setDurationOption(720)}
              >
                30 Ngày
              </Tag>
              <Tag
                color={durationOption === 8760 ? 'cyan' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}
                onClick={() => setDurationOption(8760)}
              >
                1 Năm
              </Tag>
            </Space>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Quyền sẽ tự động hết hạn và bị vô hiệu hóa trên Smart Contract sau thời gian này.
            </div>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setGrantModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: '#0891b2' }}
            >
              Ký MetaMask & Cấp Quyền
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Pending Access Requests Drawer */}
      <Drawer
        title="Danh Sách Yêu Cầu Truy Cập Đang Chờ Duyệt"
        open={requestsDrawerVisible}
        onClose={() => setRequestsDrawerVisible(false)}
        width={460}
      >
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            Không có yêu cầu nào đang chờ
          </div>
        ) : (
          requests.map((req) => (
            <Card
              key={req.id}
              size="small"
              style={{
                marginBottom: 12,
                borderRadius: 10,
                border: req.status === 'PENDING' ? '1px solid #0891b2' : '1px solid #e2e8f0',
                background: req.status === 'PENDING' ? '#f0fdfa' : '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13 }}>
                  {req.doctorName}
                </Text>
                <Tag color={req.status === 'PENDING' ? 'gold' : req.status === 'APPROVED' ? 'green' : 'default'}>
                  {req.status === 'PENDING' ? 'CHỜ DUYỆT' : req.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}
                </Tag>
              </div>

              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                {req.hospitalName} | Ví: {truncateAddress(req.doctorAddress, 8, 4)}
              </div>

              <div style={{ fontSize: 12, color: '#334155', background: '#ffffff', padding: 8, borderRadius: 6, marginBottom: 8 }}>
                <strong>Lý do khám:</strong> {req.reason}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Yêu cầu: {req.durationHours / 24} ngày ({req.permissionRequested})
                </Text>

                {req.status === 'PENDING' && (
                  <Space>
                    <Button
                      size="small"
                      danger
                      onClick={() => handleRequestResponse(req.id, false)}
                    >
                      Từ chối
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      style={{ background: '#059669' }}
                      onClick={() => handleRequestResponse(req.id, true)}
                    >
                      Đồng ý
                    </Button>
                  </Space>
                )}
              </div>
            </Card>
          ))
        )}
      </Drawer>
    </Card>
  );
};
