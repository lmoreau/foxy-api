import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
import { getAccountById, listWirelineResidualRows, listRogersWirelineRecords, updateAccountWirelineResiduals } from '../utils/api';
import { AccountData, ResidualRecord, WirelineRecord } from '../types/residualTypes';
import { combineResidualData } from '../utils/residualUtils';
import { ResidualTable } from './ResidualTable';
import { ResidualStatusModal } from './ResidualStatusModal';

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [residualData, setResidualData] = useState<ResidualRecord[]>([]);
  const [wirelineData, setWirelineData] = useState<WirelineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        // Fetch account details
        const accountData = await getAccountById(id);
        setAccountData(accountData);

        // Fetch residual rows
        const residualData = await listWirelineResidualRows(id);
        setResidualData(residualData);

        // Fetch wireline records
        const wirelineData = await listRogersWirelineRecords(id);
        setWirelineData(wirelineData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleEdit = () => {
    if (accountData) {
      setSelectedValue(accountData.foxyflow_wirelineresiduals.toString());
      setIsModalVisible(true);
    }
  };

  const handleModalOk = async () => {
    if (!accountData || !selectedValue) return;

    setUpdating(true);
    try {
      await updateAccountWirelineResiduals(accountData.accountid, selectedValue);
      // Refresh account data
      const updatedAccount = await getAccountById(accountData.accountid);
      setAccountData(updatedAccount);
      setIsModalVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const combinedData = React.useMemo(() => {
    return combineResidualData(residualData, wirelineData);
  }, [residualData, wirelineData]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading || !accountData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>{accountData.name}</h1>
        <Button type="primary" onClick={handleEdit}>
          Edit Status
        </Button>
      </div>
      <p>Wireline Residuals: {getWirelineResidualsLabel(accountData.foxyflow_wirelineresiduals)}</p>
      <div style={{ marginTop: '20px' }}>
        <ResidualTable data={combinedData} />
      </div>
      <ResidualStatusModal
        isVisible={isModalVisible}
        selectedValue={selectedValue}
        onValueChange={setSelectedValue}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        updating={updating}
      />
    </div>
  );
};
