import React from 'react';
import { Form, Row, Col, Typography, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { getBaseCustomerLabel } from '../../utils/baseCustomerMapper';
import { getOpportunityTypeLabel } from '../../utils/opportunityTypeMapper';

const { Text, Link } = Typography;

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
  opportunityId?: string;
  quoteId?: string;
  foxyQuoteId?: string;
}

const labelStyle = {
  fontWeight: 600  // Makes labels bold
};

const DetailsTab: React.FC<DetailsTabProps> = ({ 
  opportunity, 
  account, 
  subject, 
  opportunityId,
  quoteId,
  foxyQuoteId 
}) => {
  const opportunityUrl = opportunityId ? 
    `https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&forceUCI=1&pagetype=entityrecord&etn=opportunity&id=${opportunityId}` 
    : undefined;

  const quoteUrl = quoteId ?
    `https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&forceUCI=1&pagetype=entityrecord&etn=foxy_foxyquoterequest&id=${quoteId}`
    : undefined;

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
        <div style={{ 
          background: '#fff', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label={<span style={labelStyle}>Opportunity Name</span>}
                  style={{ marginBottom: '24px' }}
                >
                  {opportunityId ? (
                    <Link href={opportunityUrl} target="_self">
                      {opportunity?.name || '-'}
                    </Link>
                  ) : (
                    <Text>{opportunity?.name || '-'}</Text>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span style={labelStyle}>Salesforce Opportunity ID</span>}>
                  <Text>{opportunity?.foxy_sfdcoppid || '-'}</Text>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span style={labelStyle}>Estimated Close Date</span>}>
                  <Text>
                    {opportunity?.estimatedclosedate 
                      ? dayjs(opportunity.estimatedclosedate).format('MMMM D, YYYY')
                      : '-'}
                  </Text>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span style={labelStyle}>Opportunity Type</span>}>
                  {opportunity?.foxy_opportunitytype ? (
                    <Tag color="blue" style={{ fontWeight: 600, fontSize: '14px' }}>
                      {getOpportunityTypeLabel(opportunity.foxy_opportunitytype)}
                    </Tag>
                  ) : (
                    <Text>-</Text>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span style={labelStyle}>DUNS Number</span>}>
                  <Text>{account?.foxy_duns || '-'}</Text>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span style={labelStyle}>Base Customer Status</span>}>
                  {account?.foxy_basecustomer ? (
                    <Tag color="green" style={{ fontWeight: 600, fontSize: '14px' }}>
                      {getBaseCustomerLabel(account.foxy_basecustomer)}
                    </Tag>
                  ) : (
                    <Text>-</Text>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label={<span style={labelStyle}>Foxy Quote</span>}
                  style={{ marginBottom: '24px' }}
                >
                  {quoteId ? (
                    <Link href={quoteUrl} target="_self">
                      {foxyQuoteId || '-'}
                    </Link>
                  ) : (
                    <Text>{foxyQuoteId || '-'}</Text>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default DetailsTab; 