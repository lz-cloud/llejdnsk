import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Space, Typography, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { OAuth2Config, OAuth2ConfigPayload } from '../../types/admin';

const { Title } = Typography;
const { TextArea } = Input;

const OAuth2ConfigPage = () => {
  const [configs, setConfigs] = useState<OAuth2Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<OAuth2Config | null>(null);
  const [form] = Form.useForm();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.listOAuth2Configs();
      setConfigs(data);
    } catch (error: any) {
      message.error('获取OAuth2配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleOpenModal = (config?: OAuth2Config) => {
    setEditingConfig(config || null);
    if (config) {
      form.setFieldsValue({
        ...config,
        scope: config.scope?.join(', ') || '',
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

  const handleSave = async (values: OAuth2ConfigPayload & { scope?: string }) => {
    try {
      const scopeArray = values.scope
        ? values.scope.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const payload = editingConfig
        ? { ...values, id: editingConfig.id, scope: scopeArray }
        : { ...values, scope: scopeArray };
      await adminService.createOrUpdateOAuth2Config(payload);
      message.success('保存成功');
      handleCloseModal();
      fetchConfigs();
    } catch (error: any) {
      message.error(error.response?.data?.message || '保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteOAuth2Config(id);
      message.success('删除成功');
      fetchConfigs();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const handleToggle = async (record: OAuth2Config, checked: boolean) => {
    try {
      await adminService.toggleOAuth2Config(record.id, checked);
      message.success(`已${checked ? '启用' : '禁用'}OAuth2配置`);
      setConfigs((prev) => prev.map((config) => (config.id === record.id ? { ...config, isActive: checked } : config)));
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新状态失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    { 
      title: '提供商', 
      dataIndex: 'provider', 
      key: 'provider',
      width: 120,
      render: (provider: string) => {
        const colors: Record<string, string> = {
          GOOGLE: 'orange',
          GITHUB: 'purple',
          CUSTOM: 'blue',
        };
        return <Tag color={colors[provider] || 'default'}>{provider}</Tag>;
      },
    },
    { title: 'Client ID', dataIndex: 'clientId', key: 'clientId', width: 200, ellipsis: true },
    { 
      title: 'Client Secret', 
      dataIndex: 'clientSecret', 
      key: 'clientSecret',
      width: 150,
      render: (secret: string) => '••••••••',
    },
    { title: 'Callback URL', dataIndex: 'callbackUrl', key: 'callbackUrl', width: 250, ellipsis: true },
    {
      title: 'Scope',
      dataIndex: 'scope',
      key: 'scope',
      width: 180,
      render: (scope: string[]) => (
        <Space size="small" wrap>
          {scope.map((s, idx) => (
            <Tag key={idx} color="geekblue">{s}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (_: boolean, record: OAuth2Config) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggle(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: OAuth2Config) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="确认删除此OAuth2配置？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>OAuth2 配置管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增配置
        </Button>
      </div>

      <Table 
        dataSource={configs} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title={editingConfig ? '编辑OAuth2配置' : '新增OAuth2配置'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item 
            label="配置名称" 
            name="name" 
            rules={[{ required: true, message: '请输入配置名称' }]}
          >
            <Input placeholder="例如：Google OAuth" />
          </Form.Item>

          <Form.Item 
            label="提供商标识" 
            name="provider" 
            rules={[{ required: true, message: '请输入提供商标识' }]}
          >
            <Input placeholder="例如：GOOGLE, GITHUB, CUSTOM" />
          </Form.Item>

          <Form.Item 
            label="Client ID" 
            name="clientId" 
            rules={[{ required: true, message: '请输入Client ID' }]}
          >
            <Input placeholder="从OAuth2提供商获取" />
          </Form.Item>

          <Form.Item 
            label="Client Secret" 
            name="clientSecret" 
            rules={[{ required: true, message: '请输入Client Secret' }]}
          >
            <Input.Password placeholder="从OAuth2提供商获取" />
          </Form.Item>

          <Form.Item 
            label="Callback URL" 
            name="callbackUrl" 
            rules={[{ required: true, message: '请输入Callback URL' }]}
          >
            <Input placeholder="例如：http://localhost:5000/api/auth/oauth2/google/callback" />
          </Form.Item>

          <Form.Item label="授权URL (可选)" name="authUrl">
            <Input placeholder="例如：https://accounts.google.com/o/oauth2/v2/auth" />
          </Form.Item>

          <Form.Item label="Token URL (可选)" name="tokenUrl">
            <Input placeholder="例如：https://oauth2.googleapis.com/token" />
          </Form.Item>

          <Form.Item label="用户信息URL (可选)" name="userInfoUrl">
            <Input placeholder="例如：https://www.googleapis.com/oauth2/v2/userinfo" />
          </Form.Item>

          <Form.Item label="Scope (逗号分隔)" name="scope">
            <TextArea 
              rows={3}
              placeholder="例如：profile, email, openid"
            />
          </Form.Item>

          <Form.Item label="启用" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={handleCloseModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OAuth2ConfigPage;
