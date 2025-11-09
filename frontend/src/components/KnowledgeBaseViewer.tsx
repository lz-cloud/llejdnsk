import { Modal, Button, Space, Typography, Spin, message, Tooltip } from 'antd';
import { 
  LeftOutlined, 
  ReloadOutlined, 
  FullscreenOutlined, 
  FullscreenExitOutlined,
  LinkOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useEffect, useState, useCallback, useRef } from 'react';
import { KnowledgeBase } from '../types/portal';

interface KnowledgeBaseViewerProps {
  open: boolean;
  knowledgeBase: KnowledgeBase | null;
  onClose: () => void;
}

const KnowledgeBaseViewer = ({ open, knowledgeBase, onClose }: KnowledgeBaseViewerProps) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && knowledgeBase) {
      setIframeKey((prev) => prev + 1);
      setLoading(true);
      setHasError(false);
    }
  }, [open, knowledgeBase?.id, knowledgeBase?.url]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!open && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, [open]);

  const handleIframeLoad = () => {
    setLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setHasError(true);
    message.error('加载知识库页面失败');
  };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  }, []);

  const handleCopyUrl = async () => {
    if (!knowledgeBase?.url) {
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(knowledgeBase.url);
      } else {
        const input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.value = knowledgeBase.url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      message.success('已复制链接到剪贴板');
    } catch (error) {
      message.error('复制链接失败');
    }
  };

  const handleOpenNewTab = () => {
    if (knowledgeBase?.url) {
      window.open(knowledgeBase.url, '_blank');
    }
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      message.error('全屏切换失败');
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        handleRefresh();
      } else if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, handleRefresh, toggleFullscreen]);

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      width="100%"
      style={{ top: 0 }}
      wrapClassName="knowledge-base-viewer-modal"
      maskClosable={false}
    >
      <div className="knowledge-base-viewer" ref={containerRef}>
        <div className="knowledge-base-viewer__header">
          <Space size="middle" style={{ flex: 1, overflow: 'hidden' }}>
            <Button type="text" icon={<LeftOutlined />} onClick={onClose}>
              返回
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Typography.Title level={5} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                {knowledgeBase?.name}
              </Typography.Title>
              {knowledgeBase?.url && (
                <Tooltip title={knowledgeBase.url}>
                  <Typography.Text 
                    type="secondary" 
                    style={{ 
                      fontSize: '12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '400px'
                    }}
                  >
                    {knowledgeBase.url}
                  </Typography.Text>
                </Tooltip>
              )}
            </div>
          </Space>
          <Space>
            <Tooltip title="复制链接">
              <Button type="text" icon={<LinkOutlined />} onClick={handleCopyUrl}>
                复制链接
              </Button>
            </Tooltip>
            <Tooltip title="在新标签页打开">
              <Button type="text" icon={<GlobalOutlined />} onClick={handleOpenNewTab}>
                新标签页
              </Button>
            </Tooltip>
            <Tooltip title="刷新">
              <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh}>
                刷新
              </Button>
            </Tooltip>
            <Tooltip title={isFullscreen ? '退出全屏' : '全屏显示'}>
              <Button 
                type="text" 
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                onClick={toggleFullscreen}
              >
                {isFullscreen ? '退出全屏' : '全屏'}
              </Button>
            </Tooltip>
          </Space>
        </div>
        <div className="knowledge-base-viewer__body">
          {loading && (
            <div className="knowledge-base-viewer__loading">
              <Spin size="large" tip="正在加载知识库..." />
            </div>
          )}
          {hasError && (
            <div className="knowledge-base-viewer__error">
              <Typography.Text type="danger">
                加载失败，请检查网络连接或稍后重试
              </Typography.Text>
              <Button type="primary" onClick={handleRefresh} style={{ marginTop: 16 }}>
                重新加载
              </Button>
            </div>
          )}
          {knowledgeBase && (
            <iframe
              key={iframeKey}
              src={knowledgeBase.url}
              title={knowledgeBase.name}
              frameBorder={0}
              allowFullScreen
              allow="fullscreen; clipboard-read; clipboard-write"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ display: loading || hasError ? 'none' : 'block' }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default KnowledgeBaseViewer;
