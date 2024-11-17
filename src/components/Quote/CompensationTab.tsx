import React, { useState } from 'react';
import { Typography, Input, Card, Space, Row, Col } from 'antd';
import { formatCurrency } from '../../utils/formatters';
import { calculateExpectedComp } from '../../utils/compensationUtils';
import { QuoteLineItem, QuoteLocation } from '../../types';

const { Text } = Typography;

export interface CompensationTabProps {
  lineItems?: { [key: string]: QuoteLineItem[] };
  locations?: QuoteLocation[];
}

const CompensationTab: React.FC<CompensationTabProps> = ({ lineItems = {}, locations = [] }) => {
  const [assumedMargin, setAssumedMargin] = useState(60);

  // Calculate total potential compensation
  let totalComp = 0;

  return (
    <Row gutter={[0, 16]}>
      <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '16px', display: 'block' }}>
            Potential Compensation Calculator
          </Text>
          <Space>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '14px',
                display: 'inline-block'
              }}
            >
              This calculator provides an estimate of potential compensation. Actual compensation may vary based on final margins and other factors.
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
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space align="center">
              <Text>Assumed Margin:</Text>
              <Input
                type="number"
                value={assumedMargin}
                onChange={(e) => setAssumedMargin(Number(e.target.value))}
                style={{ width: '100px' }}
                suffix="%"
                min={0}
                max={100}
              />
            </Space>

            {locations.map(location => {
              const locationItems = lineItems[location.foxy_foxyquoterequestlocationid] || [];
              if (locationItems.length === 0) return null;

              let locationTotal = 0;

              return (
                <Card 
                  key={location.foxy_foxyquoterequestlocationid}
                  title={location.foxy_Building.foxy_fulladdress}
                  style={{ marginBottom: '16px' }}
                >
                  {locationItems.map(item => {
                    const { comp, explanation } = calculateExpectedComp(item, assumedMargin);
                    locationTotal += comp;
                    totalComp += comp;

                    return (
                      <div key={item.foxy_foxyquoterequestlineitemid} style={{ marginBottom: '16px' }}>
                        <Text strong>{item.foxy_Product?.name}</Text>
                        <div style={{ marginLeft: '24px' }}>
                          <Text type="secondary" style={{ whiteSpace: 'pre-line' }}>{explanation}</Text>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                    <Text strong>Location Total: {formatCurrency(locationTotal)}</Text>
                  </div>
                </Card>
              );
            })}

            <Card>
              <Text strong style={{ fontSize: '16px' }}>
                Total Potential Compensation: {formatCurrency(totalComp)}
              </Text>
            </Card>
          </Space>
        </div>
      </Col>
    </Row>
  );
};

export default CompensationTab;
