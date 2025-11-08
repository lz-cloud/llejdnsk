import { useEffect, useState } from 'react';
import { List, Typography, Button, Card, Tag, Empty, Spin, message } from 'antd';
import { ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { RecentAccess, KnowledgeBase } from '../types/portal';
import portalService from '../services/portalService';
import dayjs from 'dayjs';
import KnowledgeBaseViewer from '../components/KnowledgeBaseViewer';

const { Title, Text } = Typography;

const RecentAccessPage = () => {
  const [recentAccess, setRecentAccess] = useState<RecentAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);

  useEffect(() => {
    const fetchRecentAccess = async () => {
      try {
        const data = await portalService.getRecentAccess();
        setRecentAccess(data);
      } catch (error: any) {
        message.error('获取最近访问失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAccess();
  }, []);

  const handleOpenKnowledgeBase = async (kb: RecentAccess) => {
    setSelectedKnowledgeBase(kb.knowledgeBase);
    try {
      await portalService.recordAccess(kb.knowledgeBaseId);
    } catch (error: any) {
      message.error(error.response?.data?.message || '记录访问失败');
    }
  };

  const handleCloseViewer = () => {
    setSelectedKnowledgeBase(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!recentAccess.length) {
    return <Empty description="暂无访问记录" style={{ marginTop: 80 }} />;
  }

  return (
    <div>
      <Title level={3}>最近访问</Title>

      <List
        dataSource={recentAccess}
        renderItem={(item) => (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={5}>{item.knowledgeBase.name}</Title>
                <Text type="secondary">{item.knowledgeBase.description}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">{item.knowledgeBase.category || '未分类'}</Tag>
                  <Text type="secondary">
                    <ClockCircleOutlined /> 访问时间：{dayjs(item.accessTime).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </div>
              </div>
              <Button type="primary" icon={<GlobalOutlined />} onClick={() => handleOpenKnowledgeBase(item)}>
                访问
              </Button>
            </div>
          </Card>
        )}
      />

      <KnowledgeBaseViewer
        open={!!selectedKnowledgeBase}
        knowledgeBase={selectedKnowledgeBase}
        onClose={handleCloseViewer}
      />
    </div>
  );
};

export default RecentAccessPage;
