import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Tag, Tooltip, Select, Row, Col, Input, Switch } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { SortOrder } from 'antd/es/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { listAccountsForResidualCheck } from '../utils/api';
import wirelineResidualsMap, { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
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
  crc9f_residuallastscrub: string;
  crc9f_totalwonoppstcv: string;
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

const formatCurrency = (value: string | null | undefined) => {
  if (!value) return '$0.00';
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const mapWirelineResiduals = (value: string) => {
  return getWirelineResidualsLabel(value);
};

const ResidualCheck: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('selectedServices') || '[]');
  });
  const [selectedResiduals, setSelectedResiduals] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('selectedResiduals') || '[]');
  });
  const [searchTerm, setSearchTerm] = useState<string>(() => {
    return localStorage.getItem('searchTerm') || '';
  });
  const [showNeedsScrubbing, setShowNeedsScrubbing] = useState<boolean>(() => {
    return JSON.parse(localStorage.getItem('showNeedsScrubbing') || 'false');
  });
  const [pagination, setPagination] = useState<TablePaginationConfig>(() => {
    return JSON.parse(localStorage.getItem('pagination') || '{"current": 1, "pageSize": 50}');
  });
  const [sortOrder, setSortOrder] = useState<{ columnKey: string; order: SortOrder }>(() => {
    return JSON.parse(localStorage.getItem('sortOrder') || '{"columnKey": "", "order": null}');
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await listAccountsForResidualCheck();
        setAccounts(response.value);
        setLoading(false);
      } catch (err) {
        setError('Error fetching accounts. Please try again later.');
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    let filtered = [...accounts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by services
    if (selectedServices.length > 0) {
      filtered = filtered.filter(account => 
        selectedServices.some(service => account[`foxy_${service.replace(' ', '').toLowerCase()}` as keyof Account])
      );
    }

    // Filter by residuals
    if (selectedResiduals.length > 0) {
      filtered = filtered.filter(account => {
        const accountResidualValue = account.foxyflow_wirelineresiduals?.toString();
        return selectedResiduals.includes(accountResidualValue);
      });
    }

    // Filter by last scrubbed date
    if (showNeedsScrubbing) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 120);

      filtered = filtered.filter(account => {
        if (!account.crc9f_residuallastscrub) return true;
        const scrubDate = new Date(account.crc9f_residuallastscrub);
        return scrubDate < cutoffDate;
      });
    }

    return filtered;
  }, [selectedServices, selectedResiduals, searchTerm, accounts, showNeedsScrubbing]);

  const handleServiceChange = useCallback((value: string[]) => {
    setSelectedServices(value);
    localStorage.setItem('selectedServices', JSON.stringify(value));
  }, []);

  const handleResidualChange = useCallback((value: string[]) => {
    setSelectedResiduals(value);
    localStorage.setItem('selectedResiduals', JSON.stringify(value));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    localStorage.setItem('searchTerm', e.target.value);
  }, []);

  const handleScrubToggleChange = useCallback((checked: boolean) => {
    setShowNeedsScrubbing(checked);
    localStorage.setItem('showNeedsScrubbing', JSON.stringify(checked));
  }, []);

  const handleRowClick = useCallback((record: Account) => {
    navigate(`/residual-details/${record.accountid}`);
  }, [navigate]);

  const handleTableChange = useCallback((pagination: TablePaginationConfig, filters: any, sorter: any) => {
    setPagination(pagination);
    setSortOrder({ columnKey: sorter.field, order: sorter.order });
    localStorage.setItem('pagination', JSON.stringify(pagination));
    localStorage.setItem('sortOrder', JSON.stringify({ columnKey: sorter.field, order: sorter.order }));
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
      sorter: (a, b) => parseFloat(a.foxyflow_residualstotal || '0') - parseFloat(b.foxyflow_residualstotal || '0'),
      sortOrder: sortOrder.columnKey === 'foxyflow_residualstotal' ? sortOrder.order : undefined,
    },
    {
      title: 'Wireline MRR',
      dataIndex: 'foxy_wirelinemrr',
      key: 'foxy_wirelinemrr',
      width: '15%',
      ellipsis: true,
      render: (value) => formatCurrency(value),
      sorter: (a, b) => parseFloat(a.foxy_wirelinemrr || '0') - parseFloat(b.foxy_wirelinemrr || '0'),
      sortOrder: sortOrder.columnKey === 'foxy_wirelinemrr' ? sortOrder.order : undefined,
    },
    {
      title: 'Won TCV',
      dataIndex: 'crc9f_totalwonoppstcv',
      key: 'crc9f_totalwonoppstcv',
      width: '15%',
      ellipsis: true,
      render: (value) => formatCurrency(value),
      sorter: (a, b) => parseFloat(a.crc9f_totalwonoppstcv || '0') - parseFloat(b.crc9f_totalwonoppstcv || '0'),
      sortOrder: sortOrder.columnKey === 'crc9f_totalwonoppstcv' ? sortOrder.order : undefined,
    },
    {
      title: 'Residual Status',
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
    {
      title: 'Last Scrubbed',
      dataIndex: 'crc9f_residuallastscrub',
      key: 'crc9f_residuallastscrub',
      width: '15%',
      ellipsis: true,
      render: (value) => formatDate(value),
      sorter: (a, b) => {
        const dateA = a.crc9f_residuallastscrub ? new Date(a.crc9f_residuallastscrub).getTime() : 0;
        const dateB = b.crc9f_residuallastscrub ? new Date(b.crc9f_residuallastscrub).getTime() : 0;
        return dateA - dateB;
      },
      sortOrder: sortOrder.columnKey === 'crc9f_residuallastscrub' ? sortOrder.order : undefined,
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="residual-check-container">
      <h2>Accounts for Residual Check</h2>
      <div style={{ color: '#666', fontSize: '14px', marginTop: '-8px', marginBottom: '16px' }}>
        Displaying {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'}
      </div>
      <Row gutter={16}>
        <Col span={6}>
          <Input
            placeholder="Search by company name"
            prefix={<SearchOutlined />}
            onChange={handleSearchChange}
            value={searchTerm}
            style={{ width: '100%', marginBottom: '16px' }}
          />
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Filter by Services"
            onChange={handleServiceChange}
            allowClear
            value={selectedServices}
          >
            {Object.keys(serviceColors).map(service => (
              <Option key={service} value={service}>{service}</Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Filter by Residual Status"
            onChange={handleResidualChange}
            allowClear
            value={selectedResiduals}
          >
            {wirelineResidualsMap.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch
              checked={showNeedsScrubbing}
              onChange={handleScrubToggleChange}
            />
            <span>Show Needs Scrubbing (120+ days)</span>
          </div>
        </Col>
      </Row>
      <Table 
        columns={columns} 
        dataSource={filteredAccounts} 
        rowKey="accountid"
        scroll={{ x: true }}
        pagination={pagination}
        size="small"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ResidualCheck;
