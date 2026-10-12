import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, Space, Button, Typography } from 'antd';
import {
  AuditOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { SystemAuditEntry } from '../../types/blockchain';
import { MockApi } from '../../services/mockApi';

const { Text } = Typography;
const { Option } = Select;

export const SystemAuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<SystemAuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await MockApi.getSystemAuditLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionMeta: Record<string, { label: string; color: string }> = {
    VIEW_RECORD: { label: 'Xem Bệnh Án', color: 'blue' },
    CREATE_RECORD: { label: 'Tạo Bệnh Án', color: 'green' },
    UPDATE_PROGRESSION: { label: 'Thêm Diễn Tiến', color: 'cyan' },
    GRANT_ACCESS: { label: 'Cấp Quyền Truy Cập', color: 'purple' },
    REVOKE_ACCESS: { label: 'Thu Hồi Quyền', color: 'red' },
    LOGIN_SUCCESS: { label: 'Đăng Nhập Thành Công', color: 'success' },
    LOGIN_FAILED: { label: 'Đăng Nhập Thất Bại', color: 'error' },
    EXPORT_PDF: { label: 'Xuất PDF Bệnh Án', color: 'gold' },
  };

  const filteredLogs = logs.filter((log) => {
    const matchAction = filterAction === 'ALL' || log.actionType === filterAction;
    const matchSearch =
      !searchKeyword ||
      log.userEmail.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.ipAddress.includes(searchKeyword) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchAction && matchSearch;
  });

  const columns = [
    {
      title: 'Thời Gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 170,
      render: (t: string) => new Date(t).toLocaleString('vi-VN'),
    },
    {
      title: 'Hành Động / Thao Tác',
      dataIndex: 'actionType',
      key: 'actionType',
      render: (act: string) => {
        const meta = actionMeta[act] || { label: act, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Người Thực Hiện (Actor)',
      key: 'user',
      render: (_: any, r: SystemAuditEntry) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.userEmail}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Vai trò: <Tag color="geekblue" style={{ margin: 0 }}>{r.userRole}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Tài Nguyên / Đối Tượng',
      dataIndex: 'resourceId',
      key: 'resourceId',
      render: (res: string) => res ? <Tag color="cyan">{res}</Tag> : <span style={{ color: '#94a3b8' }}>-</span>,
    },
    {
      title: 'Địa Chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip: string) => <span style={{ fontFamily: 'monospace' }}>{ip}</span>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'SUCCESS') return <Tag color="success">THÀNH CÔNG</Tag>;
        if (st === 'WARNING') return <Tag color="warning">CẢNH BÁO</Tag>;
        return <Tag color="error">BỊ TỪ CHỐI</Tag>;
      },
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <AuditOutlined style={{ color: '#0891b2' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              Nhật Ký Truy Cập & Thao Tác Hệ Thống (System Audit Log)
            </span>
          </Space>
          <Button size="small" icon={<ReloadOutlined spin={loading} />} onClick={fetchLogs}>
            Làm mới
          </Button>
        </div>
      }
      style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
    >
      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Tìm kiếm Email, IP, Mã bệnh án..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 260 }}
          allowClear
        />

        <Select
          value={filterAction}
          onChange={(v) => setFilterAction(v)}
          style={{ width: 220 }}
        >
          <Option value="ALL">Tất cả loại thao tác</Option>
          <Option value="VIEW_RECORD">Xem Bệnh Án</Option>
          <Option value="CREATE_RECORD">Tạo Bệnh Án</Option>
          <Option value="GRANT_ACCESS">Cấp Quyền Truy Cập</Option>
          <Option value="REVOKE_ACCESS">Thu Hồi Quyền</Option>
          <Option value="LOGIN_SUCCESS">Đăng Nhập Thành Công</Option>
          <Option value="LOGIN_FAILED">Đăng Nhập Thất Bại</Option>
        </Select>
      </div>

      <Table
        dataSource={filteredLogs}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
};
