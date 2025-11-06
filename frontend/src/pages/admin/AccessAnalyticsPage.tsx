import { useEffect, useState } from 'react';
import { Card, Typography, message, Spin, Row, Col, Table, Tag } from 'antd';
import { EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { AccessAnalytics } from '../../types/admin';

const { Title, Text } = Typography;

interface KnowledgeBaseWithAnalytics {
  id: string;
  name: string;
  accessCount: number;
  totalDuration: number;
  avgDuration: number;
}

const AccessAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AccessAnalytics[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrichedData, setEnrichedData] = useState<KnowledgeBaseWithAnalytics[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, kbData] = await Promise.all([
          adminService.getAccessAnalytics(),
          adminService.listKnowledgeBases(),
        ]);
        setAnalytics(analyticsData);
        setKnowledgeBases(kbData);

        const enriched = analyticsData.map((item) => {
          const kb = kbData.find((k) => k.id === item.knowledgeBaseId);
          const accessCount = item._count.id;
          const totalDuration = item._sum.accessDuration || 0;
          const avgDuration = accessCount > 0 ? Math.round(totalDuration / accessCount) : 0;

          return {
            id: item.knowledgeBaseId,
            name: kb?.name || '未知知识库',
            accessCount,
            totalDuration,
            avgDuration,
          };
        });

        enriched.sort((a, b) => b.accessCount - a.accessCount);
        setEnrichedData(enriched);
      } catch (error: any) {
        message.error('获取访问分析失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalAccess = enrichedData.reduce((sum, item) => sum + item.accessCount, 0);
  const totalDuration = enrichedData.reduce((sum, item) => sum + item.totalDuration, 0);

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Tag color={index < 3 ? ['gold', 'silver', '#cd7f32'][index] : 'default'}>
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: '知识库',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '访问次数',
      dataIndex: 'accessCount',
      key: 'accessCount',
      width: 120,
      sorter: (a: KnowledgeBaseWithAnalytics, b: KnowledgeBaseWithAnalytics) => a.accessCount - b.accessCount,
      render: (count: number) => (
        <span>
          <EyeOutlined style={{ marginRight: 8 }} />
          {count}
        </span>
      ),
    },
    {
      title: '总访问时长',
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      width: 150,
      sorter: (a: KnowledgeBaseWithAnalytics, b: KnowledgeBaseWithAnalytics) => a.totalDuration - b.totalDuration,
      render: (duration: number) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {Math.round(duration / 60)} 分钟
        </span>
      ),
    },
    {
      title: '平均访问时长',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      width: 150,
      sorter: (a: KnowledgeBaseWithAnalytics, b: KnowledgeBaseWithAnalytics) => a.avgDuration - b.avgDuration,
      render: (duration: number) => `${duration} 秒`,
    },
    {
      title: '访问占比',
      key: 'percentage',
      width: 120,
      render: (_: any, record: KnowledgeBaseWithAnalytics) => {
        const percentage = totalAccess > 0 ? ((record.accessCount / totalAccess) * 100).toFixed(1) : 0;
        return `${percentage}%`;
      },
    },
  ];

  return (
    <div>
      <Title level={3}>访问分析</Title>

      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div>
              <Text type="secondary">总访问次数</Text>
              <div style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>
                {totalAccess.toLocaleString()}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div>
              <Text type="secondary">总访问时长</Text>
              <div style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>
                {Math.round(totalDuration / 60)} 分钟
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div>
              <Text type="secondary">活跃知识库</Text>
              <div style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>
                {enrichedData.length}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={4}>知识库访问排行</Title>
        <Table
          dataSource={enrichedData}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 个知识库`,
          }}
        />
      </Card>
    </div>
  );
};

export default AccessAnalyticsPage;
