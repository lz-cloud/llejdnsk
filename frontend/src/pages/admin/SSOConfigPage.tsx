import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Typography, message, Alert, Select, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { SSOConfig, SSOConfigPayload } from '../../types/admin';

const { Title, Text, Paragraph } = Typography;

const SSOConfigPage = () => {
  const [configs, setConfigs] = useState<SSOConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SSOConfig | null>(null);
  const [form] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleOpenModal = async (config?: SSOConfig) => {
    if (config) {
      setModalVisible(true);
      setModalLoading(true);
      try {
        const fullConfig = await adminService.getSSOConfig(config.id);
        setEditingConfig(fullConfig);
        form.setFieldsValue({
          ...fullConfig,
          allowedIPs: fullConfig.allowedIPs?.join(', '),
          userCodeParamName: fullConfig.userCodeParamName || 'UserCode',
          userCodeEncryption: fullConfig.userCodeEncryption || 'DES',
          pageUrlParamName: fullConfig.pageUrlParamName || 'PageUrl',
          timestampParamName: fullConfig.timestampParamName || 'iat',
          enableThirdPartyMapping: fullConfig.enableThirdPartyMapping ?? false,
        });
      } catch (error: any) {
        message.error(error.response?.data?.message || '加载配置失败');
        setModalVisible(false);
      } finally {
        setModalLoading(false);
      }
    } else {
      setEditingConfig(null);
      form.resetFields();
      form.setFieldsValue({
        desPadding: 'pkcs5padding',
        desMode: 'CBC',
        tokenValidity: 5,
        isActive: true,
        userCodeParamName: 'UserCode',
        userCodeEncryption: 'DES',
        pageUrlParamName: 'PageUrl',
        timestampParamName: 'iat',
        enableThirdPartyMapping: false,
      });
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingConfig(null);
    setModalLoading(false);
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

  const handleToggle = async (record: SSOConfig, checked: boolean) => {
    try {
      await adminService.toggleSSOConfig(record.id, checked);
      message.success(`已${checked ? '启用' : '禁用'}SSO配置`);
      setConfigs((prev) => prev.map((config) => (config.id === record.id ? { ...config, isActive: checked } : config)));
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新状态失败');
    }
  };

  const handleCopySSOUrl = (config: SSOConfig) => {
    const baseUrl = window.location.origin;
    const ssoUrl = `${baseUrl}/login?config=${config.id}&sso=[加密参数]`;
    navigator.clipboard.writeText(ssoUrl);
    message.success('SSO链接已复制到剪贴板');
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'DES Key', dataIndex: 'desKey', key: 'desKey', width: 120 },
    { title: 'DES IV', dataIndex: 'desIV', key: 'desIV', width: 120 },
    { title: 'Padding', dataIndex: 'desPadding', key: 'desPadding', width: 120 },
    { title: '模式', dataIndex: 'desMode', key: 'desMode', width: 80 },
    { title: '有效期(分钟)', dataIndex: 'tokenValidity', key: 'tokenValidity', width: 120 },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (_: boolean, record: SSOConfig) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggle(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: SSOConfig) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Button icon={<CopyOutlined />} onClick={() => handleCopySSOUrl(record)} title="复制SSO链接" />
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

      <Alert
        message="SSO单点登录配置说明"
        description={
          <div>
            <Paragraph>
              <Text strong>配置要求：</Text>
            </Paragraph>
            <ul style={{ marginBottom: 8 }}>
              <li><Text>DES密钥和偏移量(IV)：必须为8位字符</Text></li>
              <li><Text>加密模式：CBC</Text></li>
              <li><Text>填充模式：pkcs5padding (PKCS7兼容)</Text></li>
              <li><Text>输出格式：Base64</Text></li>
              <li><Text>字符编码：UTF-8</Text></li>
            </ul>
            <Paragraph>
              <Text strong>参数说明：</Text>
            </Paragraph>
            <ul style={{ marginBottom: 0 }}>
              <li><Text>UserCode：用户编码（必须加密）</Text></li>
              <li><Text>iat：Unix时间戳，用于验证有效期（必须加密）</Text></li>
              <li><Text>PageUrl：登录成功后的跳转地址（可选，需URL编码）</Text></li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      <Table dataSource={configs} columns={columns} rowKey="id" loading={loading} scroll={{ x: 1000 }} />

      <Modal
        title={editingConfig ? '编辑SSO配置' : '新增SSO配置'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Alert
          message="注意"
          description="DES密钥和IV必须为8位字符，用于加密传输的用户编码和时间戳。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item 
            label="配置名称" 
            name="name" 
            rules={[{ required: true, message: '请输入配置名称' }]}
            tooltip="为这个SSO配置指定一个易识别的名称"
          >
            <Input placeholder="例如：生产环境SSO" />
          </Form.Item>
          
          <Form.Item 
            label="DES密钥 (Key)" 
            name="desKey" 
            rules={[
              { required: true, message: '请输入DES密钥' },
              { len: 8, message: 'DES密钥必须为8位字符' }
            ]}
            tooltip="用于加密的DES密钥，必须为8位"
          >
            <Input placeholder="8位字符" maxLength={8} />
          </Form.Item>
          
          <Form.Item 
            label="DES偏移量 (IV)" 
            name="desIV" 
            rules={[
              { required: true, message: '请输入DES偏移量' },
              { len: 8, message: 'DES偏移量必须为8位字符' }
            ]}
            tooltip="DES加密的初始化向量，必须为8位"
          >
            <Input placeholder="8位字符" maxLength={8} />
          </Form.Item>
          
          <Form.Item 
            label="填充模式" 
            name="desPadding" 
            initialValue="pkcs5padding"
            tooltip="PKCS5Padding与PKCS7Padding兼容"
          >
            <Select>
              <Select.Option value="pkcs5padding">PKCS5Padding</Select.Option>
              <Select.Option value="pkcs7">PKCS7Padding</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="加密模式" 
            name="desMode" 
            initialValue="CBC"
            tooltip="DES加密模式"
          >
            <Select>
              <Select.Option value="CBC">CBC</Select.Option>
              <Select.Option value="ECB">ECB</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="令牌有效期(分钟)" 
            name="tokenValidity" 
            initialValue={5}
            tooltip="SSO令牌的有效时间，超过此时间令牌将失效"
          >
            <InputNumber min={1} max={30} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            label="允许的IP地址" 
            name="allowedIPs"
            tooltip="限制只有这些IP地址可以使用SSO登录，留空表示不限制"
          >
            <Input.TextArea 
              rows={3}
              placeholder="多个IP地址用逗号分隔，例如：192.168.1.1, 192.168.1.2" 
            />
          </Form.Item>

          <Form.Item
            label="用户编码参数名"
            name="userCodeParamName"
            initialValue="UserCode"
            tooltip="第三方系统传递的用户编码的参数名称"
            rules={[{ required: true, message: '请输入用户编码参数名' }]}
          >
            <Input placeholder="例如：UserCode" />
          </Form.Item>

          <Form.Item
            label="用户编码加密方式"
            name="userCodeEncryption"
            initialValue="DES"
            tooltip="指定用户编码的加密方式"
          >
            <Select>
              <Select.Option value="DES">DES加密</Select.Option>
              <Select.Option value="PLAIN">明文</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="跳转页面参数名"
            name="pageUrlParamName"
            initialValue="PageUrl"
            tooltip="登录成功后的跳转页面参数名称"
          >
            <Input placeholder="例如：PageUrl" />
          </Form.Item>

          <Form.Item
            label="时间戳参数名"
            name="timestampParamName"
            initialValue="iat"
            tooltip="用于校验有效期的Unix时间戳参数名称"
          >
            <Input placeholder="例如：iat" />
          </Form.Item>

          <Form.Item
            label="应用编码参数名"
            name="appCodeParamName"
            tooltip="如需区分子系统，可指定应用编码的参数名称"
          >
            <Input placeholder="例如：appcode" />
          </Form.Item>

          <Form.Item
            label="应用编码固定值"
            name="appCodeValue"
            tooltip="可选，要求第三方系统在请求中携带的应用编码固定值"
          >
            <Input placeholder="例如：0011" />
          </Form.Item>

          <Form.Item
            label="启用第三方系统用户编码对照"
            name="enableThirdPartyMapping"
            valuePropName="checked"
            initialValue={false}
            tooltip="启用后，将使用第三方系统账号对照表进行用户匹配"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item 
            label="启用此配置" 
            name="isActive" 
            valuePropName="checked" 
            initialValue={true}
          >
            <Switch />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存配置</Button>
              <Button onClick={handleCloseModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
        )}
      </Modal>
    </div>
  );
};

export default SSOConfigPage;
