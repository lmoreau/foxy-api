import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import './ResidualCheck.css';

interface Account {
  accountid: string;
  name: string;
  foxy_basecheck: string;
  foxy_basechecknotes: string;
  foxy_basecustomer: string;
  foxy_cable: boolean;
  foxy_datacentre: boolean;
  foxy_duns: string;
  foxy_fibreinternet: boolean;
  foxy_gpon: boolean;
  foxy_microsoft365: boolean;
  foxy_res: boolean;
  foxyflow_residualstotal: string;
  foxyflow_residualsnotes: string;
  foxy_ritaresidualnotes: string;
  foxy_sip: boolean;
  foxy_unison: boolean;
  foxy_wirelinemrr: string;
  foxyflow_wirelineresiduals: string;
}

const serviceColors = {
  Cable: 'blue',
  Fibre: 'green',
  GPON: 'cyan',
  MS365: 'purple',
  RES: 'magenta',
  SIP: 'orange',
  Unison: 'geekblue',
  DataCentre: 'volcano',
};

const ResidualCheck: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('http://localhost:7071/api/listAccountsForResidualCheck');
        setAccounts(response.data.value);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Error fetching accounts. Please check the console for more details.');
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const columns: ColumnsType<Account> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Base Check',
      dataIndex: 'foxy_basecheck',
      key: 'foxy_basecheck',
    },
    {
      title: 'Base Check Notes',
      dataIndex: 'foxy_basechecknotes',
      key: 'foxy_basechecknotes',
    },
    {
      title: 'Base Customer',
      dataIndex: 'foxy_basecustomer',
      key: 'foxy_basecustomer',
    },
    {
      title: 'Services',
      key: 'services',
      render: (_, record) => (
        <>
          {record.foxy_cable && <Tag color={serviceColors.Cable}>Cable</Tag>}
          {record.foxy_datacentre && <Tag color={serviceColors.DataCentre}>DataCentre</Tag>}
          {record.foxy_fibreinternet && <Tag color={serviceColors.Fibre}>Fibre</Tag>}
          {record.foxy_gpon && <Tag color={serviceColors.GPON}>GPON</Tag>}
          {record.foxy_microsoft365 && <Tag color={serviceColors.MS365}>MS365</Tag>}
          {record.foxy_res && <Tag color={serviceColors.RES}>RES</Tag>}
          {record.foxy_sip && <Tag color={serviceColors.SIP}>SIP</Tag>}
          {record.foxy_unison && <Tag color={serviceColors.Unison}>Unison</Tag>}
        </>
      ),
    },
    {
      title: 'DUNS',
      dataIndex: 'foxy_duns',
      key: 'foxy_duns',
    },
    {
      title: 'Residuals Total',
      dataIndex: 'foxyflow_residualstotal',
      key: 'foxyflow_residualstotal',
    },
    {
      title: 'Residuals Notes',
      dataIndex: 'foxyflow_residualsnotes',
      key: 'foxyflow_residualsnotes',
    },
    {
      title: 'RITA Residual Notes',
      dataIndex: 'foxy_ritaresidualnotes',
      key: 'foxy_ritaresidualnotes',
    },
    {
      title: 'Wireline MRR',
      dataIndex: 'foxy_wirelinemrr',
      key: 'foxy_wirelinemrr',
    },
    {
      title: 'Wireline Residuals',
      dataIndex: 'foxyflow_wirelineresiduals',
      key: 'foxyflow_wirelineresiduals',
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="residual-check-container">
      <h2>Accounts for Residual Check</h2>
      <Table columns={columns} dataSource={accounts} rowKey="accountid" />
    </div>
  );
};

export default ResidualCheck;
