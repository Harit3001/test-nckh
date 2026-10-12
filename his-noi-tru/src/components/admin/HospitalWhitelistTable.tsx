import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, Typography, message } from 'antd';
import { BankOutlined, PlusOutlined, SafetyCertificateFilled, ReloadOutlined } from '@ant-design/icons';
import { HospitalOrganization } from '../../types/access';
import { MockApi } from '../../services/mockApi';
import { useWeb3 } from '../../context/Web3Context';
import { truncateAddress } from '../../services/web3Service';

const { Text } = Typography;
const { Option } = Select;

export const HospitalWhitelistTable: React.FC = () => {
  const { executeTransaction, walletAddress } = useWeb3();
  const [hospitals, setHospitals] = useState<HospitalOrganization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const data = await MockApi.getHospitalWhitelist();
      setHospitals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (values: any) => {
    setLoading(true);
    try {
      // 1. Simulate on-chain transaction: WHITELIST_HOSPITAL
      await executeTransaction(
        'WHITELIST_HOSPITAL',
        walletAddress || '0xSuperAdminWallet',
        `Thêm bệnh viện ${values.name} (${values.code}) vào Whitelist On-chain`
      );

      // 2. Persist
      await MockApi.whitelistHospital({
        name: values.name,
        code: values.code,
        walletAddress: values.walletAddress,
        tier: values.tier,
        contactEmail: values.contactEmail,
      });

      message.success(`Đã thêm ${values.name} vào Whitelist Smart Contract thành công!`);
      setModalVisible(false);
      form.resetFields();
      await fetchHospitals();
    } catch (e: any) {
      message.error(e.message || 'Lỗi khi thêm bệnh viện.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên Cơ Sở Y Tế / Bệnh Viện',
      key: 'name',
      render: (_: any, r: HospitalOrganization) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Mã định danh: <Tag color="blue" style={{ margin: 0 }}>{r.code}</Tag> | {r.contactEmail}
          </div>
        </div>
      ),
    },
    {
      title: 'Tuyến Kỹ Thuật',
      dataIndex: 'tier',
      key: 'tier',
      render: (t: string) => <Tag color={t.includes('Trung Ương') ? 'purple' : 'cyan'}>{t}</Tag>,
    },
    {
      title: 'Địa Chỉ Ví Tổ Chức (Multi-Sig)',
      dataIndex: 'walletAddress',
      key: 'walletAddress',
      render: (w: string) => (
        <Text copyable={{ text: w }} style={{ fontFamily: 'monospace', color: '#0891b2', fontWeight: 600 }}>
          {truncateAddress(w, 10, 8)}
        </Text>
      ),
    },
    {
      title: 'Trạng Thái On-Chain',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => (
        <Tag color="success" icon={<SafetyCertificateFilled />}>
          WHITELISTED
        </Tag>
      ),
    },
    {
      title: 'Ngày Kích Hoạt',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
    },
  ];

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <BankOutlined style={{ color: '#0891b2' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Quản Lý Mạng Lưới Bệnh Viện Đối Tác & Whitelist Ví Đa Chữ Ký
              </span>
            </Space>

            <Space>
              <Button size="small" icon={<ReloadOutlined spin={loading} />} onClick={fetchHospitals}>
                Làm mới
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                style={{ background: '#0891b2' }}
              >
                Thêm Bệnh Viện Whitelist
              </Button>
            </Space>
          </div>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
      >
        <Table
          dataSource={hospitals}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      {/* Add Hospital Whitelist Modal */}
      <Modal
        open={modalVisible}
        title="Thêm Bệnh Viện & Whitelist Địa Chỉ Ví On-Chain"
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddHospital}
          initialValues={{
            tier: 'Tuyến Trung Ương',
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 500 }}>Tên đầy đủ bệnh viện</span>}
            rules={[{ required: true, message: 'Nhập tên bệnh viện' }]}
          >
            <Input placeholder="Bệnh Viện Trung Ương Huế" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="code"
              label={<span style={{ fontWeight: 500 }}>Mã viết tắt</span>}
              rules={[{ required: true, message: 'Nhập mã viết tắt' }]}
            >
              <Input placeholder="BV-HUE" />
            </Form.Item>

            <Form.Item
              name="tier"
              label={<span style={{ fontWeight: 500 }}>Tuyến kỹ thuật</span>}
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Tuyến Trung Ương">Tuyến Trung Ương</Option>
                <Option value="Tuyến Tỉnh / Thành Phố">Tuyến Tỉnh / Thành Phố</Option>
                <Option value="Tuyến Huyện">Tuyến Huyện</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="walletAddress"
            label={<span style={{ fontWeight: 500 }}>Địa chỉ ví tổ chức (Smart Contract / Safe Multi-Sig)</span>}
            rules={[
              { required: true, message: 'Nhập địa chỉ ví 0x...' },
              { pattern: /^0x[a-fA-F0-9]{40}$/, message: 'Địa chỉ ví Ethereum không hợp lệ' },
            ]}
          >
            <Input placeholder="0x5E6F708192a3b4c5d6e7f8091a2b3c4d5E6F7081" />
          </Form.Item>

          <Form.Item
            name="contactEmail"
            label={<span style={{ fontWeight: 500 }}>Email liên hệ đại diện</span>}
            rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}
          >
            <Input placeholder="contact@bvhue.vn" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#0891b2' }}>
              Ký Giao Dịch & Whitelist
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
