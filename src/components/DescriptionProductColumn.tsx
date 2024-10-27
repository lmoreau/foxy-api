import React from 'react';
import { Tag } from 'antd';
import { MergedRecord, WirelineRecord, ResidualRecord } from '../types/residualTypes';

interface DescriptionProductColumnProps {
  record: MergedRecord | WirelineRecord | ResidualRecord;
}

const DescriptionProductColumn: React.FC<DescriptionProductColumnProps> = ({ record }) => {
  const isMerged = record.type === 'merged';
  const isWireline = record.type === 'wireline';
  const mergedRecord = record as MergedRecord;
  const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
  const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

  if (isMerged || isWireline) {
    const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
    const term = r.foxy_contractterm || 0;
    const termDisplay = term <= 1 ? 'MTM' : `${term} months`;

    return (
      <>
        <Tag color={isMerged ? 'purple' : 'green'}>
          {isMerged ? 'Merged' : 'Wireline'}
        </Tag>
        <span>&nbsp;</span>
        {r.foxy_description || 'No Description'}
        {r.foxy_quantity > 1 && ` x ${r.foxy_quantity}`}
        {r.foxy_serviceid && (
          <>
            {' '}
            <Tag color="blue">({r.foxy_serviceid})</Tag>
          </>
        )}
        {' '}
        <Tag color="green">{termDisplay}</Tag>
      </>
    );
  }

  return (
    <>
      <Tag color="blue">Residual</Tag>
      <span>&nbsp;</span>
      {residualRecord?.foxyflow_product}
    </>
  );
};

export default DescriptionProductColumn;
