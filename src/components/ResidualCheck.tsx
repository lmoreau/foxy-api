import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Tooltip, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileTextOutlined } from '@ant-design/icons';
import ResidualRowsModal from './ResidualRowsModal';
import './ResidualCheck.css';

const { Option } = Select;

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
  'Fibre Internet': 'green',
  GPON: 'cyan',
  'Microsoft 365': 'purple',
  RES: 'magenta',
  SIP: 'orange',
  Unison: 'geekblue',
  'Data Centre': 'volcano',
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
  { value: '947760001', label: 'Legacy Issue' },
];

type WirelineResidualLabel = 
  | 'Active'
  | 'Pending Start'
  | 'Not Eligible'
  | 'Status Unknown'
  | 'Issue - None Paying'
  | 'Issue - Some Paying'
  | 'Issue - Ready to Submit'
  | 'Issue - Clarification Needed'
  | 'Issue - Disputed to Comp'
  | 'Legacy Issue';

const wirelineResidualColors: Record<WirelineResidualLabel, string> = {
  'Active': 'green',
  'Pending Start': 'blue',
  'Not Eligible': 'blue',
  'Status Unknown': 'red',
  'Issue - None Paying': 'red',
  'Issue - Some Paying': 'red',
  'Issue - Ready to Submit': 'red',
  'Issue - Clarification Needed': 'red',
  'Issue - Disputed to Comp': 'red',
  'Legacy Issue': 'red',
};

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const mapWirelineResiduals = (value: string) => {
  const stringValue = value.toString();
  const option = wirelineResidualOptions.find(opt => opt.value === stringValue);
  return option ? option.label : stringValue;
};

const ResidualCheck: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [rogersWirelineData, setRogersWirelineData] = useState<any[]>([]);
  const [rogersWirelineLoading, setRogersWirelineLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('http://localhost:7071/api/listAccountsForResidualCheck');
        setAccounts(response.data.value);
        setFilteredAccounts(response.data.value);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Error fetching accounts. Please check the console for more details.');
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedServices.length === 0) {
      setFilteredAccounts(accounts);
    } else {
      setFilteredAccounts(accounts.filter(account => 
        selectedServices.some(service => account[`foxy_${service.replace(' ', '').toLowerCase()}` as keyof Account])
      ));
    }
  }, [selectedServices, accounts]);

  const handleServiceChange = (value: string[]) => {
    setSelectedServices(value);
  };

  const handleRowClick = async (record: Account) => {
    setIsModalVisible(true);
    setModalLoading(true);
    setRogersWirelineLoading(true);
    
    try {
      // Fetch residual rows
      const residualResponse = await axios.get(`http://localhost:7071/api/listWirelineResidualRows?companyId=${record.accountid}`);
      setModalData(residualResponse.data.value);
      
      // Fetch Rogers Wireline records
      const rogersWirelineResponse = await axios.get(`http://localhost:7071/api/listRogersWirelineRecords?accountId=${record.accountid}`);
      setRogersWirelineData(rogersWirelineResponse.data.value);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setModalLoading(false);
      setRogersWirelineLoading(false);
    }
  };

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
          {record.foxy_datacentre && <Tag color={serviceColors['Data Centre']}>Data Centre</Tag>}
          {record.foxy_fibreinternet && <Tag color={serviceColors['Fibre Internet']}>Fibre Internet</Tag>}
          {record.foxy_gpon && <Tag color={serviceColors.GPON}>GPON</Tag>}
          {record.foxy_microsoft365 && <Tag color={serviceColors['Microsoft 365']}>Microsoft 365</Tag>}
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
      render: (value) => {
        const label = mapWirelineResiduals(value) as WirelineResidualLabel;
        const color = wirelineResidualColors[label] || 'red';
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="residual-check-container">
      <h2>Accounts for Residual Check</h2>
      <Select
        mode="multiple"
        style={{ width: '100%', marginBottom: '16px' }}
        placeholder="Filter by Services"
        onChange={handleServiceChange}
        allowClear
      >
        {Object.keys(serviceColors).map(service => (
          <Option key={service} value={service}>{service}</Option>
        ))}
      </Select>
      <Table 
        columns={columns} 
        dataSource={filteredAccounts} 
        rowKey="accountid"
        scroll={{ x: true }}
        pagination={{ pageSize: 50 }}
        size="small"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
      />
      <ResidualRowsModal
        isVisible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        data={modalData}
        loading={modalLoading}
        rogersWirelineData={rogersWirelineData}
        rogersWirelineLoading={rogersWirelineLoading}
      />
    </div>
  );
};

export default ResidualCheck;
