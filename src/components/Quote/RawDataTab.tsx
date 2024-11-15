import React from 'react';

interface RawDataTabProps {
  data: any;
}

const RawDataTab: React.FC<RawDataTabProps> = ({ data }) => (
  <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
    {JSON.stringify(data, null, 2)}
  </pre>
);

export default RawDataTab;
