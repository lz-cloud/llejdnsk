import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { SSOConfig, SSOConfigPayload } from '../../types/admin';

const { Title } = Typography;

const SSOConfigPage = () => {
  const [configs, setConfigs] = useState<SSOConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SSOConfig | null>(null);
  const [form] = Form.useForm();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.listSSOConfigs();
      setConfigs(data);
    } catch (error: any) {
      message.error('获取SSO配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleOpenModal = (config?: SSOConfig) => {
    setEditingConfig(config || null);
    if (config) {
      form.setFieldsValue({
        ...config,
        allowedIPs: config.allowedIPs?.join(', '),
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingConfig(null);
    form.resetFields();
  };

  const handleSave = async (values: SSOConfigPayload & { allowedIPs?: string }) => {
    try {
      const allowedIPsArray = values.allowedIPs
        ? values.allowedIPs.split(',').map((ip) => ip.trim()).filter(Boolean)
        : [];
      const payload = editingConfig
        ? { ...values, id: editingConfig.id, allowedIPs: allowedIPsArray }
        : { ...values, allowedIPs: allowedIPsArray };
      await adminService.saveSSOConfig(payload);
      message.success('保存成功');
      handleCloseModal();
      fetchConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.message || '保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteSSOConfig(id);
      message.success('删除成功');
      fetchConfigs();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'DES Key', dataIndex: 'desKey', key: 'desKey' },
    { title: 'DES IV', dataIndex: 'desIV', key: 'desIV' },
    { title: 'Padding', dataIndex: 'desPadding', key: 'desPadding' },
    { title: '模式', dataIndex: 'desMode', key: 'desMode' },
    { title: '有效期(分钟)', dataIndex: 'tokenValidity', key: 'tokenValidity' },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (isActive ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: SSOConfig) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>SSO 配置管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增配置
        </Button>
      </div>

      <Table dataSource={configs} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editingConfig ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="DES Key" name="desKey" rules={[{ required: true, len: 8 }]}> <Input /> </Form.Item>
          <Form.Item label="DES IV" name="desIV" rules={[{ required: true, len: 8 }]}> <Input /> </Form.Item>
          <Form.Item label="Padding" name="desPadding" initialValue="pkcs5padding"> <Input /> </Form.Item>
          <Form.Item label="模式" name="desMode" initialValue="CBC"> <Input /> </Form.Item>
          <Form.Item label="有效期(分钟)" name="tokenValidity" initialValue={5}> <InputNumber min={1} max={30} style={{ width: '100%' }} /> </Form.Item>
          <Form.Item label="允许IP" name="allowedIPs"> <Input.TextArea placeholder="逗号分隔的IP地址" /> </Form.Item>
          <Form.Item label="启用" name="isActive" valuePropName="checked" initialValue={true}> <Switch /> </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={handleCloseModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SSOConfigPage;
