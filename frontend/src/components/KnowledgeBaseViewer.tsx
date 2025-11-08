import { Modal, Button, Space, Typography } from 'antd';
import { LeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { KnowledgeBase } from '../types/portal';

interface KnowledgeBaseViewerProps {
  open: boolean;
  knowledgeBase: KnowledgeBase | null;
  onClose: () => void;
}

const KnowledgeBaseViewer = ({ open, knowledgeBase, onClose }: KnowledgeBaseViewerProps) => {
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (open && knowledgeBase) {
      setIframeKey((prev) => prev + 1);
    }
  }, [open, knowledgeBase?.id, knowledgeBase?.url]);

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
      <div className="knowledge-base-viewer">
        <div className="knowledge-base-viewer__header">
          <Space size="middle">
            <Button type="text" icon={<LeftOutlined />} onClick={onClose}>
              返回
            </Button>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {knowledgeBase?.name}
            </Typography.Title>
          </Space>
          <Button type="text" icon={<ReloadOutlined />} onClick={() => setIframeKey((prev) => prev + 1)}>
            刷新
          </Button>
        </div>
        <div className="knowledge-base-viewer__body">
          {knowledgeBase && (
            <iframe
              key={iframeKey}
              src={knowledgeBase.url}
              title={knowledgeBase.name}
              frameBorder={0}
              allowFullScreen
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default KnowledgeBaseViewer;
