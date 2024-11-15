import React, { useState } from 'react';
import { Typography, Input, Card, Space } from 'antd';
import { formatCurrency } from '../../utils/formatters';
import { calculateExpectedComp } from '../../utils/compensationUtils';
import { QuoteLineItem, QuoteLocation } from '../../types';

const { Title, Text, Paragraph } = Typography;

export interface CompensationTabProps {
  lineItems?: { [key: string]: QuoteLineItem[] };
  locations?: QuoteLocation[];
}

const CompensationTab: React.FC<CompensationTabProps> = ({ lineItems = {}, locations = [] }) => {
  const [assumedMargin, setAssumedMargin] = useState(60);

  // Calculate total potential compensation
  let totalComp = 0;

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Potential Compensation Calculator</Title>
          <Paragraph>
            This calculator provides an estimate of potential compensation. Actual compensation may vary based on final margins and other factors.
          </Paragraph>
          
          <Space align="center" style={{ marginBottom: '24px' }}>
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
        </div>

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
          <Title level={4} style={{ margin: 0 }}>
            Total Potential Compensation: {formatCurrency(totalComp)}
          </Title>
        </Card>
      </Space>
    </div>
  );
};

export default CompensationTab;
