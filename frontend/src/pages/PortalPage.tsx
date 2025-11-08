import { useCallback, useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Button, Tag, Empty, Input, Radio, Space, Spin, message } from 'antd';
import { StarTwoTone, StarOutlined, GlobalOutlined } from '@ant-design/icons';
import { KnowledgeBase } from '../types/portal';
import portalService from '../services/portalService';
import { useAppSelector } from '../store';
import KnowledgeBaseViewer from '../components/KnowledgeBaseViewer';

const { Title, Paragraph, Text } = Typography;

const PortalPage = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [filteredKnowledgeBases, setFilteredKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const auth = useAppSelector((state) => state.auth);

  const fetchKnowledgeBases = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await portalService.getKnowledgeBases();
      setKnowledgeBases(data);
      setFilteredKnowledgeBases(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取知识库失败');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await portalService.getFavorites();
      const favoritesMap: Record<string, boolean> = {};
      data.forEach((fav) => {
        favoritesMap[fav.knowledgeBaseId] = true;
      });
      setFavorites(favoritesMap);
    } catch (error) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBases();
    fetchFavorites();
    const interval = setInterval(() => {
      fetchKnowledgeBases(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchFavorites, fetchKnowledgeBases]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchKnowledgeBases(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchKnowledgeBases]);

  useEffect(() => {
    const filtered = knowledgeBases.filter((kb) => {
      const keyword = search.toLowerCase();
      return (
        kb.name.toLowerCase().includes(keyword) ||
        (kb.description?.toLowerCase().includes(keyword) ?? false) ||
        (kb.category?.toLowerCase().includes(keyword) ?? false)
      );
    });

    setFilteredKnowledgeBases(filtered);
  }, [search, knowledgeBases]);

  const handleOpenKnowledgeBase = async (knowledgeBase: KnowledgeBase) => {
    setSelectedKnowledgeBase(knowledgeBase);
    try {
      await portalService.recordAccess(knowledgeBase.id);
    } catch (error: any) {
      message.error(error.response?.data?.message || '记录访问失败');
    }
  };

  const handleCloseViewer = () => {
    setSelectedKnowledgeBase(null);
  };

  const handleToggleFavorite = async (knowledgeBase: KnowledgeBase) => {
    try {
      const response = await portalService.toggleFavorite(knowledgeBase.id);
      setFavorites((prev) => ({ ...prev, [knowledgeBase.id]: response.favorited }));
      message.success(response.favorited ? '已添加收藏' : '已取消收藏');
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新收藏失败');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!knowledgeBases.length) {
    return <Empty description="暂无知识库" style={{ marginTop: 80 }} />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>您好，{auth.user?.displayName || auth.user?.email}</Title>
        <Paragraph type="secondary">
          欢迎访问公司知识库门户。您可以浏览、搜索并访问您有权限的所有知识库。
        </Paragraph>
        <Space style={{ marginTop: 16 }} wrap>
          <Input.Search
            placeholder="搜索知识库名称、描述或分类"
            allowClear
            size="large"
            style={{ width: 360 }}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="large"
          >
            <Radio.Button value="grid">卡片视图</Radio.Button>
            <Radio.Button value="list">列表视图</Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      {viewMode === 'grid' ? (
        <Row gutter={[24, 24]}>
          {filteredKnowledgeBases.map((knowledgeBase) => (
            <Col xs={24} sm={12} lg={8} key={knowledgeBase.id}>
              <Card
                className="knowledge-base-card"
                cover={knowledgeBase.icon ? <img src={knowledgeBase.icon} alt={knowledgeBase.name} /> : undefined}
                actions={[
                  <Button type="link" onClick={() => handleOpenKnowledgeBase(knowledgeBase)} key="open">
                    <GlobalOutlined /> 访问知识库
                  </Button>,
                  <Button type="link" onClick={() => handleToggleFavorite(knowledgeBase)} key="favorite">
                    {favorites[knowledgeBase.id] ? <StarTwoTone twoToneColor="#fadb14" /> : <StarOutlined />} 收藏
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={knowledgeBase.name}
                  description={knowledgeBase.description || '暂无描述'}
                />
                <Space style={{ marginTop: 16 }} size="middle" wrap>
                  <Tag color="blue">{knowledgeBase.category || '未分类'}</Tag>
                  {knowledgeBase.isPublic && <Tag color="green">公开访问</Tag>}
                  <Text type="secondary">
                    权限：{knowledgeBase.isPublic ? '公开访问' : (knowledgeBase.accessLevel ?? 'READ')}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div>
          {filteredKnowledgeBases.map((kb) => (
            <Card key={kb.id} style={{ marginBottom: 16 }}>
              <Row align="middle" gutter={16}>
                <Col flex="auto">
                  <Title level={4}>{kb.name}</Title>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }}>{kb.description}</Paragraph>
                  <Space size="large" wrap>
                    <Tag>{kb.category || '未分类'}</Tag>
                    {kb.isPublic && <Tag color="green">公开</Tag>}
                    <Text type="secondary">权限：{kb.isPublic ? '公开访问' : (kb.accessLevel ?? 'READ')}</Text>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button type="primary" onClick={() => handleOpenKnowledgeBase(kb)}>访问</Button>
                    <Button icon={favorites[kb.id] ? <StarTwoTone twoToneColor="#fadb14" /> : <StarOutlined />} onClick={() => handleToggleFavorite(kb)}>
                      收藏
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      )}

      <KnowledgeBaseViewer
        open={!!selectedKnowledgeBase}
        knowledgeBase={selectedKnowledgeBase}
        onClose={handleCloseViewer}
      />
    </div>
  );
};

export default PortalPage;
