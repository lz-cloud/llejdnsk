import { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { User } from '../../types/admin';

const { Title } = Typography;

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.listUsers();
        setUsers(data);
      } catch (error: any) {
        message.error('获取用户列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '显示名', dataIndex: 'displayName', key: 'displayName' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>,
    },
    { title: '认证方式', dataIndex: 'authProvider', key: 'authProvider' },
    { title: 'ERP用户编码', dataIndex: 'erpUserCode', key: 'erpUserCode' },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? '活跃' : '禁用'}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>用户管理</Title>
        <Button type="primary" icon={<PlusOutlined />}>新增用户</Button>
      </div>

      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default UserManagementPage;
