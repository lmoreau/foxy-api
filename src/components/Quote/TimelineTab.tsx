import React from 'react';
import { Timeline, Card, Spin, Typography, Space } from 'antd';
import { useTimelineData } from '../../hooks/useTimelineData';

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
  const { timelineItems, loading } = useTimelineData(id);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Timeline>
        {timelineItems.map((item) => (
          <Timeline.Item key={item.id}>
            <Card 
              size="small" 
              title={
                <Space>
                  {item.type === 'post' ? 'Post' : 'Note'} by{' '}
                  <Text style={{ color: '#1890ff' }}>{item.createdBy}</Text>
                  {' - '}
                  {new Date(item.modifiedOn).toLocaleString()}
                </Space>
              }
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {formatMentions(item.text)}
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default TimelineTab;
