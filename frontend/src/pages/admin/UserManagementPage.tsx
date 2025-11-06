import { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, message, Modal, Form, Input, Select, Switch, Space, Popconfirm } from 'antd';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { User, UserPayload } from '../../types/admin';

const { Title } = Typography;
const { Option } = Select;

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (error: any) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    setEditingUser(user || null);
    if (user) {
      form.setFieldsValue({
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        erpUserCode: user.erpUserCode,
        isActive: user.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSave = async (values: UserPayload) => {
    try {
      await adminService.createOrUpdateUser(values);
      message.success(editingUser ? '用户更新成功' : '用户创建成功');
      handleCloseModal();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '保存失败');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await adminService.deactivateUser(id);
      message.success('用户已禁用');
      fetchUsers();
    } catch (error: any) {
      message.error('禁用失败');
    }
  };

  const columns = [
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
    { title: '显示名', dataIndex: 'displayName', key: 'displayName', width: 150 },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>,
    },
    {
      title: '认证方式',
      dataIndex: 'authProvider',
      key: 'authProvider',
      width: 120,
      render: (provider: string) => {
        const colors: Record<string, string> = {
          LOCAL: 'default',
          GOOGLE: 'orange',
          GITHUB: 'purple',
          SSO: 'green',
        };
        return <Tag color={colors[provider]}>{provider}</Tag>;
      },
    },
    { title: 'ERP用户编码', dataIndex: 'erpUserCode', key: 'erpUserCode', width: 150 },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? '活跃' : '禁用'}</Tag>,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space>
          <Button size="small" onClick={() => handleOpenModal(record)}>
            编辑
          </Button>
          {record.isActive && (
            <Popconfirm title="确认禁用此用户？" onConfirm={() => handleDeactivate(record.id)}>
              <Button size="small" danger icon={<StopOutlined />}>
                禁用
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>用户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增用户
        </Button>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item label="显示名" name="displayName">
            <Input />
          </Form.Item>

          <Form.Item label="角色" name="role" initialValue="USER">
            <Select>
              <Option value="USER">普通用户</Option>
              <Option value="ADMIN">管理员</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码', min: 6 }]}
            >
              <Input.Password placeholder="至少6个字符" />
            </Form.Item>
          )}

          <Form.Item label="ERP用户编码" name="erpUserCode">
            <Input placeholder="用于SSO登录的用户编码" />
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

export default UserManagementPage;
