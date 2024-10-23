import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';

interface AccountData {
  name: string;
  foxyflow_wirelineresiduals: number;
}

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(`http://localhost:7071/api/getAccountById?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch account data');
        }
        const data = await response.json();
        setAccountData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (id) {
      fetchAccount();
    }
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!accountData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{accountData.name}</h1>
      <p>Wireline Residuals: {getWirelineResidualsLabel(accountData.foxyflow_wirelineresiduals)}</p>
    </div>
  );
};
