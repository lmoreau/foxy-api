import React, { useState } from 'react';
import { Timeline, Card, Spin, Typography, Button, Row, Col } from 'antd';
import { MessageOutlined, FileTextOutlined, PlusOutlined, FileOutlined } from '@ant-design/icons';
import { useTimelineData } from '../../hooks/useTimelineData';
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

const formatPostContent = (text: string) => {
  // Split content and attachment
  const [content, attachment] = text.split('[ATTACHMENT]');
  
  if (!attachment) {
    return formatMentions(content);
  }

  const [fileName, fileUrl] = attachment.replace('[/ATTACHMENT]', '').split('|');

  return (
    <>
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
        {formatMentions(content)}
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <FileOutlined /> {fileName}
        </a>
      </div>
    </>
  );
};

const TimelineTab: React.FC<TimelineTabProps> = ({ id }) => {
  const { timelineItems, loading, createPost } = useTimelineData(id);
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

  return (
    <div>
      {/* Simple create button */}
      <Row justify="center">
        <Col xs={24} sm={24} md={20} lg={16} xl={14} style={{ textAlign: 'right', marginBottom: '20px' }}>
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
      <Row justify="center">
        <Col xs={24} sm={24} md={20} lg={16} xl={14}>
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
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {formatPostContent(item.text)}
                  </div>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        </Col>
      </Row>

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
