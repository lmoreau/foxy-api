import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileTextOutlined } from '@ant-design/icons';
import './ResidualCheck.css';

interface Account {
  accountid: string;
  name: string;
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

const wirelineResidualOptions = [
  { value: '755280000', label: 'Status Unknown' },
  { value: '755280001', label: 'Not Eligible' },
  { value: '755280002', label: 'Pending Start' },
  { value: '755280003', label: 'Active' },
  { value: '755280004', label: 'Issue - None Paying' },
  { value: '755280005', label: 'Issue - Some Paying' },
  { value: '755280006', label: 'Issue - Ready to Submit' },
  { value: '755280007', label: 'Issue - Clarification Needed' },
  { value: '755280008', label: 'Issue - Disputed to Comp' },
];

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const mapWirelineResiduals = (value: string) => {
  const stringValue = value.toString();
  console.log('Mapping value:', stringValue);
  const option = wirelineResidualOptions.find(opt => opt.value === stringValue);
  console.log('Mapped label:', option ? option.label : stringValue);
  return option ? option.label : stringValue;
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
      width: '20%',
      ellipsis: true,
    },
    {
      title: 'DUNS',
      dataIndex: 'foxy_duns',
      key: 'foxy_duns',
      width: '10%',
      ellipsis: true,
    },
    {
      title: 'Services',
      key: 'services',
      width: '20%',
      ellipsis: true,
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
      title: 'Residuals Total',
      dataIndex: 'foxyflow_residualstotal',
      key: 'foxyflow_residualstotal',
      width: '15%',
      ellipsis: true,
      render: (value) => formatCurrency(value),
      sorter: (a, b) => parseFloat(a.foxyflow_residualstotal) - parseFloat(b.foxyflow_residualstotal),
    },
    {
      title: 'Residuals Notes',
      key: 'foxyflow_residualsnotes',
      width: '5%',
      ellipsis: true,
      render: (_, record) => (
        record.foxyflow_residualsnotes ? 
        <Tooltip title={record.foxyflow_residualsnotes}>
          <FileTextOutlined />
        </Tooltip> : null
      ),
    },
    {
      title: 'RITA Residual Notes',
      key: 'foxy_ritaresidualnotes',
      width: '5%',
      ellipsis: true,
      render: (_, record) => (
        record.foxy_ritaresidualnotes ? 
        <Tooltip title={record.foxy_ritaresidualnotes}>
          <FileTextOutlined />
        </Tooltip> : null
      ),
    },
    {
      title: 'Wireline MRR',
      dataIndex: 'foxy_wirelinemrr',
      key: 'foxy_wirelinemrr',
      width: '15%',
      ellipsis: true,
      render: (value) => formatCurrency(value),
      sorter: (a, b) => parseFloat(a.foxy_wirelinemrr) - parseFloat(b.foxy_wirelinemrr),
    },
    {
      title: 'Wireline Residuals',
      dataIndex: 'foxyflow_wirelineresiduals',
      key: 'foxyflow_wirelineresiduals',
      width: '15%',
      ellipsis: true,
      render: (value) => mapWirelineResiduals(value),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="residual-check-container">
      <h2>Accounts for Residual Check</h2>
      <Table 
        columns={columns} 
        dataSource={accounts} 
        rowKey="accountid"
        scroll={{ x: true }}
        pagination={{ pageSize: 50 }}
        size="small"
      />
    </div>
  );
};

export default ResidualCheck;
