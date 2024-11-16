import React, { useState } from 'react';
import { Timeline, Card, Spin, Typography, Button, Row, Col } from 'antd';
import { MessageOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { useTimelineData } from '../../hooks/useTimelineData';
import { useQuoteData } from '../../hooks/useQuoteData';
import CreatePostModal from './CreatePostModal';
import './timeline.css';

const { Text } = Typography;

interface TimelineTabProps {
  id: string;
}

// Function to format @ mentions
const formatMentions = (text: string) => {
  const parts = [];
  let lastIndex = 0;
  const mentionRegex = /@\[8,[^,]*,"([^"]*)"\]/g;
  
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the formatted mention
    parts.push(<Text key={match.index} style={{ color: '#1890ff' }}>@{match[1]}</Text>);
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
};

const TimelineTab: React.FC<TimelineTabProps> = ({ id }) => {
  const { timelineItems, loading, createPost } = useTimelineData(id);
  const { rawQuoteData } = useQuoteData(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePost = async (text: string) => {
    try {
      setSubmitting(true);
      await createPost(text);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  const quoteId = rawQuoteData?.quoteRequest?.foxy_quoteid || id;

  return (
    <div>
      {/* Header section matching main quote page */}
      <Row gutter={[0, 16]}>
        <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <Text strong style={{ fontSize: '16px', display: 'block' }}>Posts & Notes</Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Foxy Timeline for {quoteId}
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Post
          </Button>
        </Col>
      </Row>

      {/* Timeline content */}
      <Timeline className="timeline-custom">
        {timelineItems.map((item) => (
          <Timeline.Item 
            key={item.id}
            dot={item.type === 'post' ? 
              <MessageOutlined style={{ fontSize: '16px', color: '#1890ff' }} /> : 
              <FileTextOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            }
          >
            <Card 
              size="small" 
              title={
                <span>
                  {item.type === 'post' ? 'Post' : 'Note'} by{' '}
                  <Text style={{ color: '#1890ff' }}>{item.createdBy}</Text>
                  {' - '}
                  {new Date(item.modifiedOn).toLocaleString()}
                </span>
              }
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {formatMentions(item.text)}
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>

      <CreatePostModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
        loading={submitting}
      />
    </div>
  );
};

export default TimelineTab;
