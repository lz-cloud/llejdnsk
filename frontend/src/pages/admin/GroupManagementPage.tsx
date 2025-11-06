import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography, Card, Select, Space } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { UserGroup, KnowledgeBase } from '../../types/admin';

const { Title } = Typography;
const { Option } = Select;

const GroupManagementPage = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await adminService.listGroups();
      setGroups(data);
    } catch (error: any) {
      message.error('获取用户组失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeBases = async () => {
    try {
      const data = await adminService.listKnowledgeBases();
      setKnowledgeBases(data);
    } catch (error: any) {
      message.error('获取知识库列表失败');
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchKnowledgeBases();
  }, []);

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      await adminService.createGroup(values.name, values.description);
      message.success('创建成功');
      form.resetFields();
      setModalVisible(false);
      fetchGroups();
    } catch (error: any) {
      message.error('创建失败');
    }
  };

  const handleOpenPermissionModal = (group: UserGroup) => {
    setSelectedGroup(group);
    const existingPermissions = group.permissions?.map((p) => p.knowledgeBaseId) || [];
    const existingLevel = group.permissions?.[0]?.accessLevel || 'READ';
    permissionForm.setFieldsValue({
      knowledgeBaseIds: existingPermissions,
      accessLevel: existingLevel,
    });
    setPermissionModalVisible(true);
  };

  const handleSavePermissions = async (values: any) => {
    if (!selectedGroup) return;

    try {
      await adminService.assignBulkPermissions({
        groupId: selectedGroup.id,
        knowledgeBaseIds: values.knowledgeBaseIds,
        accessLevel: values.accessLevel,
      });
      message.success('权限设置成功');
      setPermissionModalVisible(false);
      fetchGroups();
    } catch (error: any) {
      message.error('权限设置失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '成员数量',
      dataIndex: 'members',
      key: 'members',
      width: 120,
      render: (members: any[]) => members?.length || 0,
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 120,
      render: (permissions: any[]) => permissions?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: UserGroup) => (
        <Button
          icon={<SettingOutlined />}
          onClick={() => handleOpenPermissionModal(record)}
          size="small"
        >
          配置权限
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>用户组管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建用户组
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Typography.Paragraph>
          <strong>说明：</strong>用户组可以批量管理用户权限。将用户加入用户组后，该用户将自动获得该组的所有知识库访问权限。
        </Typography.Paragraph>
      </Card>

      <Table
        dataSource={groups}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title="新建用户组"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入用户组名称' }]}
          >
            <Input placeholder="例如：技术部、市场部" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="简要描述该用户组的用途" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`配置权限 - ${selectedGroup?.name}`}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={permissionForm} layout="vertical" onFinish={handleSavePermissions}>
          <Form.Item
            label="选择知识库"
            name="knowledgeBaseIds"
            rules={[{ required: true, message: '请选择至少一个知识库' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择该组可以访问的知识库"
              showSearch
              optionFilterProp="children"
            >
              {knowledgeBases.map((kb) => (
                <Option key={kb.id} value={kb.id}>
                  {kb.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="访问级别"
            name="accessLevel"
            initialValue="READ"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="READ">只读</Option>
              <Option value="WRITE">读写</Option>
              <Option value="ADMIN">管理</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setPermissionModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupManagementPage;
