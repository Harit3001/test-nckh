import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Tag } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  TransactionOutlined,
  FireOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { MockApi } from '../../services/mockApi';

const { Title, Text } = Typography;

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await MockApi.getAnalyticsData();
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* KPI Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
              border: '1px solid #bae6fd',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#0369a1', fontWeight: 600 }}>TỔNG BỆNH NHÂN (PHID)</span>}
              value={data.kpis.totalPatients}
              prefix={<UserOutlined style={{ color: '#0284c7' }} />}
              suffix={<Tag color="cyan">+12%</Tag>}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Đã định danh và liên kết ví thông minh
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
              border: '1px solid #a5f3fc',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#0e7490', fontWeight: 600 }}>BÁC SĨ HOẠT ĐỘNG</span>}
              value={data.kpis.activeDoctors}
              prefix={<MedicineBoxOutlined style={{ color: '#0891b2' }} />}
              suffix={<Tag color="blue">86 BV</Tag>}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Đã xác thực chứng chỉ hành nghề Bộ Y Tế
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #bbf7d0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#15803d', fontWeight: 600 }}>BỆNH ÁN NEO ON-CHAIN</span>}
              value={data.kpis.recordsAnchored}
              prefix={<SafetyCertificateOutlined style={{ color: '#16a34a' }} />}
              suffix={<Tag color="green">100% Khớp</Tag>}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              SHA-256 bảo toàn tính bất biến tuyệt đối
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fde68a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#b45309', fontWeight: 600 }}>GIAO DỊCH 24H (SEPOLIA)</span>}
              value={data.kpis.transactions24h}
              prefix={<TransactionOutlined style={{ color: '#d97706' }} />}
              suffix={<Tag color="gold">Gas: {data.kpis.gasUsedTotalEth}</Tag>}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Smart Contract EMR & Access Control
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        {/* Daily Record Anchors Bar Chart */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#0891b2' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Số Lượng Bệnh Án Tạo & Neo On-Chain 7 Ngày Gần Nhất
                </span>
              </Space>
            }
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyRecords} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" name="Số ca khám bệnh" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="anchored" name="Đã neo On-Chain" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Specialty Distribution Pie Chart */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <MedicineBoxOutlined style={{ color: '#0891b2' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Phân Bổ Ca Bệnh Theo Chuyên Khoa
                </span>
              </Space>
            }
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.specialtyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.specialtyDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} bệnh án`, 'Số lượng']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Access Permission Dynamics Line Chart */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Xu Hướng Cấp Quyền & Thu Hồi Quyền Truy Cập (Access Control Activity)
            </span>
            <Tag color="cyan">Mạng lưới liên viện</Tag>
          </div>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
      >
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.accessTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="granted"
                name="Cấp quyền thành công"
                stroke="#0891b2"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="revoked"
                name="Thu hồi quyền"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
