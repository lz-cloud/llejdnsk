import { useEffect, useState } from 'react';
import { Card, Typography, Button, Empty, Spin, message } from 'antd';
import { GlobalOutlined, DeleteOutlined } from '@ant-design/icons';
import { Favorite } from '../types/portal';
import portalService from '../services/portalService';

const { Title, Paragraph } = Typography;

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await portalService.getFavorites();
      setFavorites(data);
    } catch (error: any) {
      message.error('获取收藏失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleOpenKnowledgeBase = (url: string) => {
    window.open(url, '_blank');
  };

  const handleRemoveFavorite = async (id: string) => {
    const favorite = favorites.find((fav) => fav.id === id);
    if (!favorite) return;

    try {
      await portalService.toggleFavorite(favorite.knowledgeBaseId);
      message.success('已移除收藏');
      loadFavorites();
    } catch (error: any) {
      message.error('移除收藏失败');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!favorites.length) {
    return <Empty description="暂无收藏" style={{ marginTop: 80 }} />;
  }

  return (
    <div>
      <Title level={3}>我的收藏</Title>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: 16 }}>
        {favorites.map((favorite) => (
          <Card
            key={favorite.id}
            actions={[
              <Button type="link" icon={<GlobalOutlined />} onClick={() => handleOpenKnowledgeBase(favorite.knowledgeBase.url)}>
                访问
              </Button>,
              <Button type="link" icon={<DeleteOutlined />} danger onClick={() => handleRemoveFavorite(favorite.id)}>
                移除
              </Button>,
            ]}
          >
            <Title level={4}>{favorite.knowledgeBase.name}</Title>
            <Paragraph type="secondary">{favorite.knowledgeBase.description}</Paragraph>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
