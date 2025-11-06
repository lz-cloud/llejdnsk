import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { KnowledgeBase, KnowledgeBasePayload } from '../../types/admin';

const { Title } = Typography;

const KnowledgeBaseManagementPage = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKB, setEditingKB] = useState<KnowledgeBase | null>(null);
  const [form] = Form.useForm();

  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      const data = await adminService.listKnowledgeBases();
      setKnowledgeBases(data);
    } catch (error: any) {
      message.error('获取知识库列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const handleOpenModal = (kb?: KnowledgeBase) => {
    setEditingKB(kb || null);
    if (kb) {
      form.setFieldsValue(kb);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingKB(null);
    form.resetFields();
  };

  const handleSave = async (values: KnowledgeBasePayload) => {
    try {
      if (editingKB) {
        await adminService.updateKnowledgeBase(editingKB.id, values);
        message.success('知识库更新成功');
      } else {
        await adminService.createKnowledgeBase(values);
        message.success('知识库创建成功');
      }
      handleCloseModal();
      fetchKnowledgeBases();
    } catch (error: any) {
      message.error(error.response?.data?.message || '保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteKnowledgeBase(id);
      message.success('知识库删除成功');
      fetchKnowledgeBases();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '排序', dataIndex: 'displayOrder', key: 'displayOrder', width: 80 },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (isActive ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: any, record: KnowledgeBase) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>知识库管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增知识库
        </Button>
      </div>

      <Table dataSource={knowledgeBases} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editingKB ? '编辑知识库' : '新增知识库'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="URL" name="url" rules={[{ required: true, type: 'url' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Input />
          </Form.Item>
          <Form.Item label="图标URL" name="icon">
            <Input />
          </Form.Item>
          <Form.Item label="排序" name="displayOrder" initialValue={0}>
            <InputNumber style={{ width: '100%' }} />
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

export default KnowledgeBaseManagementPage;
