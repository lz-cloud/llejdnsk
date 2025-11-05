import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, message } from 'antd';
import { UserOutlined, DatabaseOutlined, SafetyCertificateOutlined, LineChartOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import { SystemStats } from '../../types/admin';

const { Title } = Typography;

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getSystemStats();
        setStats(data);
      } catch (error: any) {
        message.error('获取系统统计信息失败');
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <Title level={3}>系统概览</Title>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats?.userCount ?? 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats?.activeUserCount ?? 0}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="知识库数量"
              value={stats?.knowledgeBaseCount ?? 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SSO 配置"
              value={stats?.ssoConfigCount ?? 0}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="近7日访问次数"
              value={stats?.recentAccessCount ?? 0}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;
