import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Input,
  DatePicker,
  Select,
  Tag,
  Space,
  Typography,
  Skeleton,
  Empty,
  Segmented,
  Timeline,
} from 'antd';
import {
  MedicineBoxOutlined,
  KeyOutlined,
  HistoryOutlined,
  SearchOutlined,
  EyeOutlined,
  FilePdfOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  TableOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { PatientProfileCard } from '../components/patient/PatientProfileCard';
import { AccessGrantManagement } from '../components/patient/AccessGrantManagement';
import { OnChainAuditTimeline } from '../components/audit/OnChainAuditTimeline';
import { RecordDetailModal } from '../components/doctor/RecordDetailModal';
import { IntegrityBadge } from '../components/common/IntegrityBadge';
import { IntegrityVerifyModal } from '../components/audit/IntegrityVerifyModal';
import { MedicalRecord } from '../types/emr';
import { MockApi } from '../services/mockApi';
import { truncateAddress } from '../services/web3Service';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const PatientDashboard: React.FC = () => {
  const { patientProfile, refreshUserData } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'TABLE' | 'TIMELINE'>('TABLE');

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

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [recordToVerify, setRecordToVerify] = useState<MedicalRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await MockApi.getRecords({
        keyword,
        department: department === 'ALL' ? undefined : department,
        dateRange,
      });
      setRecords(data);
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

  const handleOpenVerify = (rec: MedicalRecord) => {
    setRecordToVerify(rec);
    setVerifyModalVisible(true);
  };

  const recordColumns = [
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
      title: 'Cơ Sở Khám & Bác Sĩ',
      key: 'doctor',
      render: (_: any, r: MedicalRecord) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.doctorName}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{r.hospitalName}</div>
          <Tag color="blue" style={{ marginTop: 2, fontSize: 10 }}>
            {r.department}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Chẩn Đoán Xác Định',
      key: 'diagnosis',
      render: (_: any, r: MedicalRecord) => (
        <div>
          <Text strong style={{ color: '#0891b2' }}>
            {r.diagnosis}
          </Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            ICD-10: <Tag style={{ margin: 0 }}>{r.icd10Code}</Tag> | {r.prescriptions.length} loại thuốc
          </div>
        </div>
      ),
    },
    {
      title: 'Bảo Toàn On-Chain',
      key: 'onChain',
      render: (_: any, r: MedicalRecord) => (
        <IntegrityBadge status={r.onChainStatus} onClick={() => handleOpenVerify(r)} />
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, r: MedicalRecord) => (
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
          <Button
            size="small"
            icon={<SafetyCertificateOutlined />}
            onClick={() => handleOpenVerify(r)}
          >
            Kiểm tra
          </Button>
        </Space>
      ),
    },
  ];

  if (!patientProfile) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  const tabItems = [
    {
      key: 'records',
      label: (
        <span>
          <MedicineBoxOutlined />
          Lịch Sử Bệnh Án ({records.length})
        </span>
      ),
      children: (
        <div>
          {/* Advanced Search & Filter Bar [US-REC-05] */}
          <Card size="small" style={{ marginBottom: 16, borderRadius: 8, background: '#f8fafc' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Tìm chẩn đoán, mã bệnh án, triệu chứng..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ width: 280 }}
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
                  Xóa bộ lọc
                </Button>
              </div>

              {/* View Switcher: Table vs Timeline [US-PAT-03] */}
              <Segmented
                value={viewMode}
                onChange={(val) => setViewMode(val as 'TABLE' | 'TIMELINE')}
                options={[
                  { label: 'Dạng Bảng', value: 'TABLE', icon: <TableOutlined /> },
                  { label: 'Dòng Thời Gian', value: 'TIMELINE', icon: <HistoryOutlined /> },
                ]}
              />
            </div>
          </Card>

          {/* Records Display with Empty State [US-PAT-03] */}
          {records.length === 0 && !loading ? (
            <Card style={{ textAlign: 'center', padding: '36px 0', borderRadius: 8 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>
                      Không tìm thấy bệnh án nào phù hợp
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                      Bạn chưa có hồ sơ khám bệnh nào theo bộ lọc đã chọn.
                    </div>
                  </div>
                }
              >
                <Button
                  type="primary"
                  onClick={() => { setSearchInput(''); setDepartment('ALL'); setDateRange(undefined); }}
                  style={{ background: '#0891b2' }}
                >
                  Xóa bộ lọc tìm kiếm
                </Button>
              </Empty>
            </Card>
          ) : viewMode === 'TABLE' ? (
            <Table
              dataSource={records}
              columns={recordColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 6 }}
            />
          ) : (
            /* Antd Timeline sorted DESC [US-PAT-03] */
            <div style={{ padding: '16px 24px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <Timeline
                mode="left"
                items={[...records]
                  .sort(
                    (a, b) =>
                      new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime()
                  )
                  .map((r) => ({
                    dot: (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#ecfeff',
                          border: '2px solid #0891b2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0891b2',
                          fontSize: 16,
                        }}
                      >
                        <MedicineBoxOutlined />
                      </div>
                    ),
                    label: (
                      <div style={{ textAlign: 'right', paddingRight: 12 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                          {new Date(r.examinationDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {new Date(r.examinationDate).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ),
                    children: (
                      <Card
                        size="small"
                        style={{
                          marginBottom: 16,
                          borderRadius: 10,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag color="cyan" style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                {r.recordCode}
                              </Tag>
                              <Tag color="blue">{r.department}</Tag>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#0891b2', marginTop: 4 }}>
                              {r.diagnosis}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              <BankOutlined style={{ marginRight: 4 }} />
                              {r.hospitalName} | Bác sĩ: <strong>{r.doctorName}</strong>
                            </div>
                          </div>

                          <IntegrityBadge status={r.onChainStatus} onClick={() => handleOpenVerify(r)} />
                        </div>

                        <div style={{ fontSize: 13, color: '#334155', marginTop: 8, background: '#f8fafc', padding: '8px 12px', borderRadius: 6 }}>
                          <div><strong>Triệu chứng:</strong> {r.symptoms}</div>
                          {r.secondaryDiagnosis && (
                            <div style={{ marginTop: 2 }}><strong>Bệnh kèm theo:</strong> {r.secondaryDiagnosis}</div>
                          )}
                          <div style={{ marginTop: 4, fontSize: 12, color: '#0284c7' }}>
                            💊 Toa thuốc gồm <strong>{r.prescriptions.length} loại thuốc</strong> chỉ định
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleOpenDetail(r)}
                            style={{ background: '#0891b2' }}
                          >
                            Xem Chi Tiết Bệnh Án & Toa Thuốc
                          </Button>
                          <Button
                            size="small"
                            icon={<SafetyCertificateOutlined />}
                            onClick={() => handleOpenVerify(r)}
                          >
                            Kiểm Tra On-Chain
                          </Button>
                        </div>
                      </Card>
                    ),
                  }))}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'access',
      label: (
        <span>
          <KeyOutlined />
          Quản Lý Phân Quyền (Access Control)
        </span>
      ),
      children: <AccessGrantManagement onGrantChanged={fetchRecords} />,
    },
    {
      key: 'audit',
      label: (
        <span>
          <HistoryOutlined />
          Nhật Ký Kiểm Toán On-Chain (Audit Trail)
        </span>
      ),
      children: <OnChainAuditTimeline />,
    },
  ];

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Patient Profile Card [US-PAT-01 & US-PAT-02] */}
      <PatientProfileCard
        patient={patientProfile}
        onProfileUpdated={() => refreshUserData()}
      />

      {/* Main Tabs */}
      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Tabs defaultActiveKey="records" items={tabItems} />
      </Card>

      {/* Record Detail Modal */}
      <RecordDetailModal
        visible={detailModalVisible}
        record={selectedRecord}
        onClose={() => setDetailModalVisible(false)}
        onRecordUpdated={fetchRecords}
      />

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
