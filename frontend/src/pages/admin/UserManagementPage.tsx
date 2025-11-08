import { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, message, Modal, Form, Input, Select, Switch, Space, Popconfirm, Divider, Alert, Checkbox } from 'antd';
import { PlusOutlined, StopOutlined, ImportOutlined, ExportOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { User, UserPayload, UserGroup, BulkUserImportResult } from '../../types/admin';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkGroupModalVisible, setBulkGroupModalVisible] = useState(false);
  const [bulkImportModalVisible, setBulkImportModalVisible] = useState(false);
  const [bulkImportForm] = Form.useForm();
  const [bulkGroupForm] = Form.useForm();
  const [importResult, setImportResult] = useState<BulkUserImportResult | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkGroupUpdating, setBulkGroupUpdating] = useState(false);

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

  const fetchGroups = async () => {
    try {
      const data = await adminService.listGroups();
      setGroups(data);
    } catch (error: any) {
      message.error('获取用户组列表失败');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
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
        groups: user.groups?.map((group) => group.id) || [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, groups: [] });
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
      fetchGroups();
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

  const handleExportUsers = async () => {
    try {
      const data = await adminService.exportUsers();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error: any) {
      message.error('导出失败');
    }
  };

  const handleBulkImport = () => {
    setBulkImportModalVisible(true);
    setImportResult(null);
    bulkImportForm.resetFields();
  };

  const handleBulkImportSubmit = async (values: { jsonData: string }) => {
    try {
      setBulkImporting(true);
      const users = JSON.parse(values.jsonData);
      if (!Array.isArray(users)) {
        message.error('数据格式错误，请提供用户数组');
        return;
      }
      const result = await adminService.bulkImportUsers(users);
      setImportResult(result);
      if (result.success.length > 0) {
        message.success(`成功导入 ${result.success.length} 个用户`);
        fetchUsers();
      }
      if (result.failed.length > 0) {
        message.warning(`${result.failed.length} 个用户导入失败`);
      }
    } catch (error: any) {
      message.error('导入失败: ' + (error.message || '未知错误'));
    } finally {
      setBulkImporting(false);
    }
  };

  const handleBulkUpdateGroups = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要修改的用户');
      return;
    }
    setBulkGroupModalVisible(true);
    bulkGroupForm.resetFields();
  };

  const handleBulkGroupSubmit = async (values: { groupIds: string[]; replace: boolean }) => {
    try {
      setBulkGroupUpdating(true);
      await adminService.bulkUpdateUserGroups({
        userIds: selectedRowKeys,
        groupIds: values.groupIds,
        replace: values.replace,
      });
      message.success(`成功更新 ${selectedRowKeys.length} 个用户的分组`);
      setBulkGroupModalVisible(false);
      setSelectedRowKeys([]);
      fetchUsers();
    } catch (error: any) {
      message.error('批量更新失败');
    } finally {
      setBulkGroupUpdating(false);
    }
  };

  const handleBulkGroupCancel = () => {
    setBulkGroupModalVisible(false);
    bulkGroupForm.resetFields();
  };

  const handleBulkImportCancel = () => {
    setBulkImportModalVisible(false);
    setImportResult(null);
    bulkImportForm.resetFields();
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
      title: '用户组',
      dataIndex: 'groups',
      key: 'groups',
      width: 220,
      render: (groupList: User['groups']) =>
        groupList && groupList.length ? (
          <Space size="small" wrap>
            {groupList.map((group) => (
              <Tag key={group.id} color="geekblue">
                {group.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">未分组</Text>
        ),
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: (string | number)[]) => setSelectedRowKeys(keys as string[]),
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>用户管理</Title>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button
              icon={<UsergroupAddOutlined />}
              onClick={handleBulkUpdateGroups}
            >
              批量修改分组 ({selectedRowKeys.length})
            </Button>
          )}
          <Button icon={<ImportOutlined />} onClick={handleBulkImport}>
            批量导入
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExportUsers}>
            导出用户
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            新增用户
          </Button>
        </Space>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
        rowSelection={rowSelection}
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

          <Form.Item label="用户组" name="groups">
            <Select
              mode="multiple"
              placeholder="选择用户所属用户组"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {groups.map((group) => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
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

      <Modal
        title="批量导入用户"
        open={bulkImportModalVisible}
        onCancel={handleBulkImportCancel}
        footer={null}
        width={700}
      >
        <Alert
          message="导入说明"
          description={
            <div>
              <p>请提供JSON格式的用户数据数组，每个用户对象包含以下字段：</p>
              <ul>
                <li><strong>email</strong>（必填）: 用户邮箱</li>
                <li><strong>displayName</strong>（可选）: 显示名称</li>
                <li><strong>role</strong>（可选）: USER 或 ADMIN，默认 USER</li>
                <li><strong>password</strong>（可选）: 密码，不填则自动生成默认密码</li>
                <li><strong>erpUserCode</strong>（可选）: ERP用户编码</li>
                <li><strong>groups</strong>（可选）: 用户组ID数组</li>
              </ul>
              <p>示例：</p>
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
{`[
  {
    "email": "user1@example.com",
    "displayName": "用户1",
    "role": "USER",
    "password": "Password123!",
    "groups": []
  }
]`}
              </pre>
            </div>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />

        {importResult && (
          <>
            {importResult.success.length > 0 && (
              <Alert
                message={`成功导入 ${importResult.success.length} 个用户`}
                description={importResult.success.join(', ')}
                type="success"
                style={{ marginBottom: 12 }}
              />
            )}
            {importResult.failed.length > 0 && (
              <Alert
                message={`${importResult.failed.length} 个用户导入失败`}
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {importResult.failed.map((item, idx) => (
                      <li key={idx}>
                        {item.email}: {item.reason}
                      </li>
                    ))}
                  </ul>
                }
                type="error"
                style={{ marginBottom: 12 }}
              />
            )}
            <Divider />
          </>
        )}

        <Form form={bulkImportForm} layout="vertical" onFinish={handleBulkImportSubmit}>
          <Form.Item
            label="JSON数据"
            name="jsonData"
            rules={[{ required: true, message: '请输入JSON数据' }]}
          >
            <TextArea
              rows={10}
              placeholder='[{"email": "user@example.com", "displayName": "用户名"}]'
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={bulkImporting}>
                导入
              </Button>
              <Button onClick={handleBulkImportCancel}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`批量修改用户组 (已选择 ${selectedRowKeys.length} 个用户)`}
        open={bulkGroupModalVisible}
        onCancel={handleBulkGroupCancel}
        footer={null}
        width={500}
      >
        <Form form={bulkGroupForm} layout="vertical" onFinish={handleBulkGroupSubmit}>
          <Form.Item
            label="用户组"
            name="groupIds"
            rules={[{ required: true, message: '请选择至少一个用户组' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择用户组"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {groups.map((group) => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="replace" valuePropName="checked" initialValue={false}>
            <Checkbox>替换现有分组（如果不勾选，将追加到现有分组）</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={bulkGroupUpdating}>
                确认修改
              </Button>
              <Button onClick={handleBulkGroupCancel}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
