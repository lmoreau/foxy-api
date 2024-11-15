import React, { useState } from 'react';
import { Typography, Input, Card, Space } from 'antd';
import { formatCurrency } from '../../utils/formatters';
import { QuoteLineItem, QuoteLocation } from '../../types';

const { Title, Text, Paragraph } = Typography;

export interface CompensationTabProps {
  lineItems?: { [key: string]: QuoteLineItem[] };
  locations?: QuoteLocation[];
}

function getCommissionRate(marginPercent: number): number {
  if (marginPercent < 5) return 0;
  if (marginPercent < 15) return 0.06;
  if (marginPercent < 30) return 0.10;
  if (marginPercent < 50) return 0.14;
  if (marginPercent < 60) return 0.20;
  return 0.22;
}

function calculateExpectedComp(
  item: QuoteLineItem,
  assumedMarginPercent: number
): { comp: number; explanation: string } {
  // For quotes, we'll use the assumed margin percentage since actual margins aren't known yet
  const marginPercent = assumedMarginPercent;
  
  // NEW or NET NEW
  if (item.foxy_revenuetype === 612100000 || item.foxy_revenuetype === 612100001) {
    const rate = getCommissionRate(marginPercent);
    const comp = item.foxy_linetcv * rate;
    return {
      comp,
      explanation: `${formatCurrency(item.foxy_mrr)}/mo * ${item.foxy_term} months * ${(rate * 100).toFixed(0)}% = ${formatCurrency(comp)}`
    };
  }

  // UPSELL or RENEWAL
  if (item.foxy_revenuetype === 612100002 || item.foxy_revenuetype === 612100003) {
    // Early Renewal gets no compensation
    if (item.foxy_renewaltype === "Early Renewal") {
      return {
        comp: 0,
        explanation: "Early Renewal - No compensation"
      };
    }

    // Calculate MRR uptick if we have existing MRR
    const mrrUptick = item.foxy_existingmrr 
      ? item.foxy_mrr - item.foxy_existingmrr
      : 0;

    // If there's a positive MRR uptick, split the calculation
    if (mrrUptick > 0) {
      const existingMRR = item.foxy_existingmrr || 0;
      const existingTCV = existingMRR * item.foxy_term;
      const existingComp = existingTCV * 0.05;

      const newTCV = mrrUptick * item.foxy_term;
      const newRate = getCommissionRate(marginPercent);
      const newComp = newTCV * newRate;

      return {
        comp: existingComp + newComp,
        explanation: `Existing: ${formatCurrency(existingMRR)}/mo * ${item.foxy_term} months * 5% = ${formatCurrency(existingComp)}\nNew: ${formatCurrency(mrrUptick)}/mo * ${item.foxy_term} months * ${(newRate * 100).toFixed(0)}% = ${formatCurrency(newComp)}`
      };
    }

    // Regular renewal or upsell without uptick gets 5%
    const comp = item.foxy_linetcv * 0.05;
    const type = item.foxy_revenuetype === 612100002 ? "Upsell (no uptick)" : "Regular Renewal";
    return {
      comp,
      explanation: `${type}: ${formatCurrency(item.foxy_mrr)}/mo * ${item.foxy_term} months * 5% = ${formatCurrency(comp)}`
    };
  }

  return {
    comp: 0,
    explanation: "No matching compensation rules"
  };
}

const CompensationTab: React.FC<CompensationTabProps> = ({ lineItems = {}, locations = [] }) => {
  const [assumedMargin, setAssumedMargin] = useState(20);

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
