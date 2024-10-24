import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Table, Tag, Tooltip } from 'antd';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
import { getAccountById, listWirelineResidualRows, listRogersWirelineRecords, updateAccountWirelineResiduals, listOpportunityRows as fetchOpportunities } from '../utils/api';
import { AccountData, ResidualRecord, WirelineRecord, OpportunityRecord } from '../types/residualTypes';
import { combineResidualData } from '../utils/residualUtils';
import { ResidualTable } from './ResidualTable';
import { ResidualStatusModal } from './ResidualStatusModal';
import { formatCurrency } from '../utils/formatters';
import { getStatusCodeLabel } from '../utils/statusCodeMapper';
import { getOpportunityTypeInfo } from '../utils/opportunityTypeMapper';

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [residualData, setResidualData] = useState<ResidualRecord[]>([]);
  const [wirelineData, setWirelineData] = useState<WirelineRecord[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
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

        // Fetch opportunities
        const opportunitiesResponse = await fetchOpportunities(id);
        setOpportunities(opportunitiesResponse.value);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setOpportunitiesLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const combinedData = React.useMemo(() => {
    return combineResidualData(residualData, wirelineData);
  }, [residualData, wirelineData]);

  const opportunityColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Actual Value',
      dataIndex: 'actualvalue',
      key: 'actualvalue',
      render: (value: number) => formatCurrency(value) || 'N/A',
    },
    {
      title: 'SFDC Opportunity ID',
      dataIndex: 'foxy_sfdcoppid',
      key: 'foxy_sfdcoppid',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Opportunity Type',
      dataIndex: 'foxy_opportunitytype',
      key: 'foxy_opportunitytype',
      render: (code: number) => {
        const { label, color } = getOpportunityTypeInfo(code);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'statuscode',
      key: 'statuscode',
      render: (code: number) => getStatusCodeLabel(code) || 'N/A',
    },
    {
      title: 'Actual Close Date',
      dataIndex: 'actualclosedate',
      key: 'actualclosedate',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Foxy Stage',
      dataIndex: 'foxy_foxystage',
      key: 'foxy_foxystage',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Step Name',
      dataIndex: 'stepname',
      key: 'stepname',
      render: (text: string) => text || 'N/A',
    },
  ];

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
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Edit Status
        </Button>
      </div>
      <p>Wireline Residuals: {getWirelineResidualsLabel(accountData.foxyflow_wirelineresiduals)}</p>
      <div style={{ marginTop: '20px' }}>
        <ResidualTable data={combinedData} />
      </div>
      <h2>Opportunities</h2>
      {opportunitiesLoading ? (
        <div>Loading opportunities...</div>
      ) : opportunitiesError ? (
        <div>Error loading opportunities: {opportunitiesError}</div>
      ) : (
        <Table
          columns={opportunityColumns}
          dataSource={opportunities}
          rowKey={(record) => record.opportunityid}
          pagination={false}
          size="middle"
        />
      )}
      <ResidualStatusModal
        isVisible={isModalVisible}
        selectedValue={selectedValue}
        onValueChange={setSelectedValue}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        updating={updating}
      />
    </div>
  );
};
