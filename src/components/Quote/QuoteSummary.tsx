import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Button, Space, Input, message, Tag } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { getQuoteStageLabel } from '../../utils/quoteStageMapper';
import { getQuoteTypeLabel } from '../../utils/quoteTypeMapper';
import { QuoteSummaryProps } from './types';
import { formatCurrency } from './utils';

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ 
  owner, 
  totalMRR, 
  totalTCV, 
  quoteStage, 
  quoteType,
  opticQuote,
  onOpticQuoteEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(opticQuote);

  const handleSave = async () => {
    try {
      const valueToSave = editValue === 'Q-' ? '' : editValue;
      
      if (!valueToSave || valueToSave.startsWith('Q-')) {
        await onOpticQuoteEdit(valueToSave);
        setIsEditing(false);
      } else {
        message.error('OptiC Quote must be empty or start with Q-');
      }
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleEditStart = () => {
    setEditValue(opticQuote || 'Q-');
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const getQuoteStageColor = (stage: number): string => {
    switch (stage) {
      case 612100000: return 'default';     // Draft
      case 612100001: return 'processing';   // In Queue
      case 612100002: return 'warning';      // Pending Sales
      case 612100003: return 'blue';         // Submitted to SA
      case 612100004: return 'purple';       // Pending COR
      case 612100005: return 'cyan';         // Pending 3rd Party/MAT
      case 612100006: return 'geekblue';     // NIKA Requested
      case 612100007: return 'volcano';      // Finance Review
      case 612100008: return 'orange';       // Waiting on CSE
      case 755280001: return 'magenta';      // MAT with DBM
      case 612100009: return 'success';      // Completed
      case 612100010: return 'gold';         // Technical Review
      default: return 'default';
    }
  };

  const getQuoteTypeColor = (type: number): string => {
    switch (type) {
      case 612100000: return 'blue';      // Wireline
      case 612100001: return 'green';     // Wireless
      case 612100002: return 'purple';    // Data Centre
      case 612100003: return 'cyan';      // IoT
      case 612100004: return 'magenta';   // Small Business
      default: return 'default';
    }
  };

  return (
    <Card size="small">
      <Row gutter={[8, 8]} align="middle" justify="space-between">
        <Col flex="1">
          <Statistic
            title="Owner"
            value={owner}
            prefix={<UserOutlined />}
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col flex="1">
          <div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>OptiC Quote</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {isEditing ? (
                <Space>
                  <Input
                    value={editValue}
                    onChange={handleChange}
                    onPressEnter={handleSave}
                    onBlur={handleSave}
                    autoFocus
                  />
                </Space>
              ) : (
                <Space>
                  {opticQuote || '-'}
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEditStart}
                    style={{ marginLeft: 8 }}
                    disabled={quoteStage === 612100000}
                  />
                </Space>
              )}
            </div>
          </div>
        </Col>
        <Col flex="1">
          <div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', marginBottom: '8px' }}>Quote Type</div>
            <Tag color={getQuoteTypeColor(quoteType)} style={{ margin: 0 }}>
              {getQuoteTypeLabel(quoteType)}
            </Tag>
          </div>
        </Col>
        <Col flex="1">
          <div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', marginBottom: '8px' }}>Quote Stage</div>
            <Tag color={getQuoteStageColor(quoteStage)} style={{ margin: 0 }}>
              {getQuoteStageLabel(quoteStage)}
            </Tag>
          </div>
        </Col>
        <Col flex="1">
          <Statistic
            title="Total MRR"
            value={formatCurrency(totalMRR)}
            valueStyle={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col flex="1">
          <Statistic
            title="Total TCV"
            value={formatCurrency(totalTCV)}
            valueStyle={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default QuoteSummary;
