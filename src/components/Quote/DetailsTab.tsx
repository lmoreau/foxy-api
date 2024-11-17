import React from 'react';
import { Form, Input, DatePicker, Row, Col, Typography, Space } from 'antd';
import dayjs from 'dayjs';
import { getBaseCustomerLabel } from '../../utils/baseCustomerMapper';

const { Text } = Typography;

interface DetailsTabProps {
  opportunity?: {
    name?: string;
    foxy_sfdcoppid?: string;
    estimatedclosedate?: string;
    foxy_opportunitytype?: number;
  };
  account?: {
    foxy_duns?: string;
    foxy_basecustomer?: number;
    name?: string;
  };
  subject?: string;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ opportunity, account, subject }) => {
  return (
    <Row gutter={[0, 16]}>
      <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '16px', display: 'block' }}>{account?.name}</Text>
          <Space>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '14px',
                display: 'inline-block'
              }}
            >
              {subject || '-'}
            </Text>
          </Space>
        </div>
      </Col>
      
      <Col span={24}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Opportunity Name">
                <Input 
                  value={opportunity?.name || ''} 
                  readOnly 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Salesforce Opportunity ID">
                <Input 
                  value={opportunity?.foxy_sfdcoppid || ''} 
                  readOnly 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Estimated Close Date">
                <DatePicker 
                  value={opportunity?.estimatedclosedate ? dayjs(opportunity.estimatedclosedate) : null}
                  disabled
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Opportunity Type">
                <Input 
                  value={opportunity?.foxy_opportunitytype?.toString() || ''} 
                  readOnly 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="DUNS Number">
                <Input 
                  value={account?.foxy_duns || ''} 
                  readOnly 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Base Customer Status">
                <Input 
                  value={account?.foxy_basecustomer ? getBaseCustomerLabel(account.foxy_basecustomer) : ''} 
                  readOnly 
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
};

export default DetailsTab; 