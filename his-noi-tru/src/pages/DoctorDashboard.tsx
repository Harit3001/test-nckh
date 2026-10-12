import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Typography,
  Modal,
  Drawer,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { MedicalRecord, ProgressionNote } from '../types/emr';
import { AccessGrant } from '../types/access';
import { MockApi } from '../services/mockApi';
import { CreateRecordModal } from '../components/doctor/CreateRecordModal';
import { RecordDetailModal } from '../components/doctor/RecordDetailModal';
import { ProgressionTimeline } from '../components/doctor/ProgressionTimeline';
import { RequestAccessModal } from '../components/doctor/RequestAccessModal';
import { IntegrityBadge } from '../components/common/IntegrityBadge';
import { IntegrityVerifyModal } from '../components/audit/IntegrityVerifyModal';
import { truncateAddress } from '../services/web3Service';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const DoctorDashboard: React.FC = () => {
  const { doctorProfile, user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters with Debounce [US-REC-05]
  const [searchInput, setSearchInput] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [department, setDepartment] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchInput);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Progression Drawer
  const [progressionDrawerVisible, setProgressionDrawerVisible] = useState(false);
  const [activeProgressionRecord, setActiveProgressionRecord] = useState<MedicalRecord | null>(null);

  // Verification modal
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [recordToVerify, setRecordToVerify] = useState<MedicalRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [data, g] = await Promise.all([
        MockApi.getRecords({
          keyword,
          department: department === 'ALL' ? undefined : department,
          dateRange,
        }),
        MockApi.getAccessGrants(),
      ]);
      setRecords(data);
      setGrants(g);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [keyword, department, dateRange]);

  const handleOpenDetail = (rec: MedicalRecord) => {
    setSelectedRecord(rec);
    setDetailModalVisible(true);
  };

  const handleOpenProgressions = (rec: MedicalRecord) => {
    setActiveProgressionRecord(rec);
    setProgressionDrawerVisible(true);
  };

  const handleOpenVerify = (rec: MedicalRecord) => {
    setRecordToVerify(rec);
    setVerifyModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã Bệnh Án & Ngày Khám',
      key: 'code',
      render: (_: any, r: MedicalRecord) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.recordCode}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {new Date(r.examinationDate).toLocaleString('vi-VN')}
          </div>
        </div>
      ),
    },
    {
      title: 'Bệnh Nhân & PHID',
      key: 'patient',
      render: (_: any, r: MedicalRecord) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.patientName}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            PHID: <Tag color="cyan" style={{ margin: 0 }}>{r.patientPhid}</Tag>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>CCCD: {r.patientCccd}</div>
        </div>
      ),
    },
    {
      title: 'Chẩn Đoán & Chuyên Khoa',
      key: 'diagnosis',
      render: (_: any, r: MedicalRecord) => (
        <div>
          <Text strong style={{ color: '#0891b2' }}>
            {r.diagnosis}
          </Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Mã ICD-10: <Tag style={{ margin: 0 }}>{r.icd10Code}</Tag>
          </div>
          <Tag color="blue" style={{ marginTop: 2, fontSize: 10 }}>
            {r.department}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Diễn Tiến (Append-Only)',
      key: 'progressions',
      render: (_: any, r: MedicalRecord) => (
        <Button
          size="small"
          type="link"
          icon={<HistoryOutlined />}
          onClick={() => handleOpenProgressions(r)}
          style={{ padding: 0, color: '#0891b2' }}
        >
          {r.progressions.length} lượt ghi chú (v{r.version})
        </Button>
      ),
    },
    {
      title: 'Quyền Truy Cập',
      key: 'accessStatus',
      width: 170,
      render: (_: any, r: MedicalRecord) => {
        const docId = doctorProfile?.doctorId || 'BS-TIM-01';
        const docAddr = (doctorProfile?.walletAddress || '').toLowerCase();
        const grant = grants.find(
          (g) =>
            g.patientPhid === r.patientPhid &&
            (g.doctorId === docId ||
              g.doctorAddress?.toLowerCase() === docAddr ||
              g.doctorId === r.doctorId)
        );
        const status = grant?.status || (r.doctorId === docId ? 'ACTIVE' : 'EXPIRED');

        if (status === 'ACTIVE') {
          return (
            <Badge
              status="success"
              text={
                <span style={{ color: '#16a34a', fontWeight: 600 }}>
                  Đang được cấp quyền
                </span>
              }
            />
          );
        }
        if (status === 'REVOKED') {
          return (
            <Badge
              status="error"
              text={
                <span style={{ color: '#dc2626', fontWeight: 600 }}>
                  Bị thu hồi
                </span>
              }
            />
          );
        }
        return (
          <Badge
            status="default"
            text={
              <span style={{ color: '#64748b', fontWeight: 500 }}>
                Đã hết hạn
              </span>
            }
          />
        );
      },
    },
    {
      title: 'Trạng Thái On-Chain',
      key: 'integrity',
      render: (_: any, r: MedicalRecord) => (
        <IntegrityBadge status={r.onChainStatus} onClick={() => handleOpenVerify(r)} />
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, r: MedicalRecord) => {
        const docId = doctorProfile?.doctorId || 'BS-TIM-01';
        const docAddr = (doctorProfile?.walletAddress || '').toLowerCase();
        const grant = grants.find(
          (g) =>
            g.patientPhid === r.patientPhid &&
            (g.doctorId === docId ||
              g.doctorAddress?.toLowerCase() === docAddr ||
              g.doctorId === r.doctorId)
        );
        const isPermitted = (grant?.status === 'ACTIVE') || (r.doctorId === docId);

        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(r)}
              style={{ background: '#0891b2' }}
            >
              Chi tiết
            </Button>
            {isPermitted ? (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenProgressions(r)}
              >
                Ghi diễn tiến
              </Button>
            ) : (
              <Button
                size="small"
                icon={<SendOutlined />}
                onClick={() => setRequestModalVisible(true)}
                style={{ borderColor: '#f59e0b', color: '#d97706' }}
              >
                Yêu cầu quyền
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Banner with Doctor Info & Primary Actions */}
      <Card
        style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                Bàn Khám Bệnh Điện Tử & Ghi Bệnh Án On-Chain
              </Title>
              <Tag color="cyan" style={{ fontWeight: 600 }}>
                {doctorProfile?.specialty || 'Tim Mạch Can Thiệp'}
              </Tag>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Bác sĩ: <strong>{doctorProfile?.fullName || 'BS. CKI Trần Minh Tuấn'}</strong> | CCHN: {doctorProfile?.licenseNumber || '003412/BYT-CCHN'} | Cơ sở: {doctorProfile?.hospitalName || 'BV Bạch Mai'}
            </div>
          </div>

          <Space size="middle">
            <Button
              icon={<SendOutlined />}
              onClick={() => setRequestModalVisible(true)}
              style={{ borderColor: '#0891b2', color: '#0891b2' }}
            >
              Yêu Cầu Quyền Truy Cập
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              style={{ background: '#0891b2', height: 38 }}
            >
              Tạo Bệnh Án Mới (Neo Hash)
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Records Table Card [US-REC-02] */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <MedicineBoxOutlined style={{ color: '#0891b2' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Danh Sách Hồ Sơ Bệnh Án Được Phân Quyền ({records.length})
              </span>
            </Space>
          </div>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
      >
        {/* Multi-criteria Search Toolbar [US-REC-05] */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm tên bệnh nhân, CCCD, PHID, chẩn đoán..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />

          <Select
            value={department}
            onChange={(v) => setDepartment(v)}
            style={{ width: 220 }}
          >
            <Option value="ALL">Tất cả chuyên khoa</Option>
            <Option value="Khoa Tim Mạch Can Thiệp">Khoa Tim Mạch Can Thiệp</Option>
            <Option value="Khoa Nội Thần Kinh">Khoa Nội Thần Kinh</Option>
            <Option value="Khoa Nội Tiêu Hóa">Khoa Nội Tiêu Hóa</Option>
          </Select>

          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={(dates, dateStrings) => {
              if (dates && dateStrings[0] && dateStrings[1]) {
                setDateRange([dateStrings[0], dateStrings[1]]);
              } else {
                setDateRange(undefined);
              }
            }}
          />

          <Button onClick={() => { setSearchInput(''); setDepartment('ALL'); setDateRange(undefined); }}>
            Đặt lại
          </Button>
        </div>

        <Table
          dataSource={records}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      {/* Create Medical Record Modal [US-REC-01] */}
      <CreateRecordModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onRecordCreated={fetchRecords}
      />

      {/* Request Access Modal [US-ACC-05] */}
      <RequestAccessModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        onSuccess={fetchRecords}
      />

      {/* Record Detail Modal */}
      <RecordDetailModal
        visible={detailModalVisible}
        record={selectedRecord}
        onClose={() => setDetailModalVisible(false)}
        onRecordUpdated={fetchRecords}
      />

      {/* Progression Notes Drawer [US-REC-03] */}
      <Drawer
        title={`Diễn Tiến Điều Trị Append-Only - ${activeProgressionRecord?.recordCode}`}
        open={progressionDrawerVisible}
        onClose={() => setProgressionDrawerVisible(false)}
        width={560}
      >
        {activeProgressionRecord && (
          <ProgressionTimeline
            recordId={activeProgressionRecord.id}
            progressions={activeProgressionRecord.progressions}
            canEdit={true}
            onProgressionAdded={() => {
              fetchRecords();
              // Update local state in drawer
              MockApi.getRecordById(activeProgressionRecord.id).then((updated) => {
                if (updated) setActiveProgressionRecord(updated);
              });
            }}
          />
        )}
      </Drawer>

      {/* Integrity Verification Modal */}
      <IntegrityVerifyModal
        visible={verifyModalVisible}
        record={recordToVerify}
        onClose={() => setVerifyModalVisible(false)}
        onRecordUpdated={fetchRecords}
      />
    </div>
  );
};
