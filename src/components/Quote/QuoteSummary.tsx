import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Button, Space, Input, message } from 'antd';
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
          <Statistic
            title="Quote Type"
            value={getQuoteTypeLabel(quoteType)}
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col flex="1">
          <Statistic
            title="Quote Stage"
            value={getQuoteStageLabel(quoteStage)}
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
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
