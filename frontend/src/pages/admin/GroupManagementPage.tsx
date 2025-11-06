import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography } from 'antd';
import adminService from '../../services/adminService';
import { UserGroup } from '../../types/admin';

const { Title } = Typography;

const GroupManagementPage = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  useEffect(() => {
    fetchGroups();
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

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>用户组管理</Title>
        <Button type="primary" onClick={() => setModalVisible(true)}>新建用户组</Button>
      </div>

      <Table dataSource={groups} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title="新建用户组"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="描述" name="description"> <Input.TextArea /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupManagementPage;
