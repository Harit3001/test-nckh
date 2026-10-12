import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, Space, Button, Typography, Tooltip, message } from 'antd';
import {
  BlockOutlined,
  SearchOutlined,
  ReloadOutlined,
  LinkOutlined,
  CopyOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { OnChainAuditLog } from '../../types/blockchain';
import { MockApi } from '../../services/mockApi';
import { truncateAddress } from '../../services/web3Service';

const { Text } = Typography;
const { Option } = Select;

export const HospitalOnChainLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<OnChainAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterOperator, setFilterOperator] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await MockApi.getOnChainAuditLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const eventTypeMeta: Record<string, { label: string; color: string }> = {
    RECORD_CREATED: { label: 'TẠO BỆNH ÁN & NEO HASH', color: 'green' },
    RECORD_ACCESSED: { label: 'TRUY CẬP HỒ SƠ', color: 'blue' },
    PROGRESSION_APPENDED: { label: 'THÊM DIỄN TIẾN (APPEND-ONLY)', color: 'cyan' },
    ACCESS_GRANTED: { label: 'CẤP QUYỀN TRUY CẬP', color: 'purple' },
    ACCESS_REVOKED: { label: 'THU HỒI QUYỀN ON-CHAIN', color: 'red' },
    INTEGRITY_VERIFIED: { label: 'XÁC MINH TOÀN VẸN HASH', color: 'gold' },
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${label} vào bộ nhớ tạm!`);
  };

  const openExplorer = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank', 'noopener,noreferrer');
  };

  const filteredLogs = logs.filter((log) => {
    const matchType = filterType === 'ALL' || log.eventType === filterType;
    const matchOperator =
      filterOperator === 'ALL' ||
      log.operatorAddress.toLowerCase() === filterOperator.toLowerCase() ||
      log.operatorRole === filterOperator;
    const matchSearch =
      !searchKeyword ||
      log.txHash.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.recordCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.patientPhid.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      log.operatorName.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchType && matchOperator && matchSearch;
  });

  const columns = [
    {
      title: 'TxHash (Transaction) & Block',
      key: 'txHash',
      width: 260,
      render: (_: any, r: OnChainAuditLog) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: '#0891b2',
                fontSize: 12,
              }}
            >
              {truncateAddress(r.txHash, 8, 6)}
            </Text>
            <Tooltip title="Sao chép TxHash">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                style={{ padding: '0 4px', height: 20 }}
                onClick={() => handleCopy(r.txHash, 'TxHash')}
              />
            </Tooltip>
            <Tooltip title="Mở trên Etherscan Sepolia">
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined />}
                style={{ padding: '0 4px', height: 20, color: '#0284c7' }}
                onClick={() => openExplorer(r.txHash)}
              />
            </Tooltip>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Block <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>#{r.blockNumber}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Thời Gian Ghi Sổ',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 170,
      render: (t: string) => (
        <span style={{ fontSize: 12, color: '#334155' }}>
          {new Date(t).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Sự Kiện Smart Contract',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (evt: string) => {
        const meta = eventTypeMeta[evt] || { label: evt, color: 'default' };
        return <Tag color={meta.color} style={{ fontWeight: 600 }}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Người Thực Hiện (Actor)',
      key: 'operator',
      render: (_: any, r: OnChainAuditLog) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.operatorName}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Vai trò: <Tag style={{ margin: 0, fontSize: 10 }}>{r.operatorRole}</Tag>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#0e7490' }}>
            Ví: {truncateAddress(r.operatorAddress, 6, 4)}
          </div>
        </div>
      ),
    },
    {
      title: 'Bệnh Án / PHID',
      key: 'target',
      render: (_: any, r: OnChainAuditLog) => (
        <div>
          <div><Tag color="cyan">{r.recordCode}</Tag></div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            PHID: <span style={{ fontFamily: 'monospace' }}>{r.patientPhid}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Nội Dung & Trạng Thái',
      key: 'notes',
      render: (_: any, r: OnChainAuditLog) => (
        <div>
          <div style={{ fontSize: 12, color: '#475569' }}>{r.notes}</div>
          <div style={{ marginTop: 4 }}>
            <Tag icon={<CheckCircleFilled />} color="success" style={{ fontSize: 10 }}>
              CONFIRMED ON-CHAIN
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Khám Phá Chuỗi',
      key: 'action',
      width: 130,
      render: (_: any, r: OnChainAuditLog) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<LinkOutlined />}
          onClick={() => openExplorer(r.txHash)}
          style={{ borderColor: '#0891b2', color: '#0891b2' }}
        >
          Etherscan
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <BlockOutlined style={{ color: '#0891b2', fontSize: 18 }} />
            <div>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                Nhật Ký Giao Dịch On-Chain Toàn Bệnh Viện (Blockchain Explorer)
              </span>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
                Giám sát các giao dịch neo hash, phân quyền và xác minh trên Ethereum Sepolia
              </div>
            </div>
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
          placeholder="Tìm TxHash, Mã bệnh án, Tên bác sĩ..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />

        <Select
          value={filterType}
          onChange={(v) => setFilterType(v)}
          style={{ width: 240 }}
        >
          <Option value="ALL">Tất cả loại sự kiện On-Chain</Option>
          <Option value="RECORD_CREATED">Tạo bệnh án & Neo Hash</Option>
          <Option value="PROGRESSION_APPENDED">Thêm diễn tiến điều trị</Option>
          <Option value="ACCESS_GRANTED">Cấp quyền truy cập</Option>
          <Option value="ACCESS_REVOKED">Thu hồi quyền On-Chain</Option>
          <Option value="INTEGRITY_VERIFIED">Xác minh toàn vẹn</Option>
        </Select>

        <Select
          value={filterOperator}
          onChange={(v) => setFilterOperator(v)}
          style={{ width: 220 }}
        >
          <Option value="ALL">Tất cả đối tượng thực hiện</Option>
          <Option value="DOCTOR">Chỉ Bác sĩ điều trị</Option>
          <Option value="PATIENT">Chỉ Bệnh nhân</Option>
          <Option value="SUPER_ADMIN">Hệ thống / Giám sát BYT</Option>
          <Option value="0x71C8fb866A37029d0f457739B7CEbe773E72a9A2">BS. Trần Minh Tuấn (0x71C8...)</Option>
          <Option value="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC">BS. Lê Quỳnh Mai (0x3C44...)</Option>
        </Select>

        <Button onClick={() => { setSearchKeyword(''); setFilterType('ALL'); setFilterOperator('ALL'); }}>
          Xóa bộ lọc
        </Button>
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
