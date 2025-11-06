import { useEffect, useState } from 'react';
import { Card, Typography, message, Spin } from 'antd';
import adminService from '../../services/adminService';
import { AccessAnalytics } from '../../types/admin';

const { Title, Text } = Typography;

const AccessAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AccessAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getAccessAnalytics();
        setAnalytics(data);
      } catch (error: any) {
        message.error('获取访问分析失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={3}>访问分析</Title>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: 24 }}>
        {analytics.map((item) => (
          <Card key={item.knowledgeBaseId}>
            <div>
              <Text strong>知识库 ID:</Text> <Text>{item.knowledgeBaseId}</Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text>访问次数: {item._count.id}</Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text>总时长: {item._sum.accessDuration || 0} 秒</Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccessAnalyticsPage;
