import React from 'react';
import { Timeline, Card, Spin } from 'antd';
import { useTimelineData, TimelineItem } from '../../hooks';

interface TimelineTabProps {
  id: string;
}

const TimelineTab: React.FC<TimelineTabProps> = ({ id }) => {
  const { timelineItems, loading } = useTimelineData(id);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Timeline>
        {timelineItems.map((item: TimelineItem) => (
          <Timeline.Item key={item.id}>
            <Card size="small" title={item.type === 'post' ? 'Post' : 'Note'}>
              {item.text}
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default TimelineTab;
