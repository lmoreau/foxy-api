import React, { Dispatch, SetStateAction, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin } from 'antd';
import QuoteHeader from './QuoteHeader';
import QuoteInfo from './QuoteInfo';
import LocationsTable from './LocationsTable';
import AddLocationModal from './AddLocationModal';
import { useQuoteData } from '../hooks/useQuoteData';
import { useModal } from '../hooks/useModal';
import { handleAddLine, calculateTotals } from '../utils/quoteUtils';

interface QuotePageProps {
  setQuoteRequestId: Dispatch<SetStateAction<string | undefined>>;
}

const QuotePage: React.FC<QuotePageProps> = ({ setQuoteRequestId }) => {
  const { id } = useParams<{ id: string }>();
  const { accountName, quoteId, locations, lineItems, error, loading } = useQuoteData(id);
  const { isVisible, show, hide } = useModal();
  const { totalMRR, totalTCV } = calculateTotals(lineItems);
  const [expandAll, setExpandAll] = useState(true);

  React.useEffect(() => {
    setQuoteRequestId(quoteId);
  }, [quoteId, setQuoteRequestId]);

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <QuoteHeader
        accountName={accountName}
        onAddLocation={show}
        onToggleExpand={toggleExpandAll}
        expandAll={expandAll}
      />
      <QuoteInfo
        owner="Bob Smith"
        quoteId={quoteId}
        totalMRR={totalMRR}
        totalTCV={totalTCV}
      />
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <LocationsTable
        data={locations}
        lineItems={lineItems}
        onAddLine={handleAddLine}
        expandAll={expandAll}
      />
      <AddLocationModal
        isVisible={isVisible}
        onOk={hide}
        onCancel={hide}
      />
    </div>
  );
};

export default QuotePage;
