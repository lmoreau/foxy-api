import React, { useEffect, useState } from 'react';
import { Table, Input, Space } from 'antd';
import { listWonServices } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import type { TableProps } from 'antd';
import './table.css';

const { Search } = Input;

interface WonService {
    foxy_serviceid: string;
    foxy_comprate: number;
    foxy_expectedcomp: number;
    foxy_term: number;
    foxy_tcv: number;
    foxy_access: string;
    foxy_mrr: number;
    foxy_quantity: number;
    foxy_linemargin: number;
    foxy_wonserviceid: string;
    foxy_Product: {
        name: string;
        productid: string;
    };
    foxy_Account: {
        name: string;
        accountid: string;
    };
    foxy_Opportunity: {
        name: string;
        foxy_sfdcoppid: string;
        actualclosedate: string;
        actualvalue: number;
        opportunityid: string;
    };
    foxy_AccountLocation: {
        foxy_Building: {
            foxy_fulladdress: string;
            foxy_buildingid: string;
        };
    };
}

const WonServicesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<WonService[]>([]);
    const [filteredData, setFilteredData] = useState<WonService[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await listWonServices();
                if (response.value) {
                    setData(response.value);
                    setFilteredData(response.value);
                }
            } catch (error) {
                console.error('Error fetching won services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (value: string) => {
        setSearchText(value);
        const searchLower = value.toLowerCase();
        const filtered = data.filter(item => 
            item.foxy_serviceid?.toLowerCase().includes(searchLower) ||
            item.foxy_Product?.name?.toLowerCase().includes(searchLower) ||
            item.foxy_Opportunity?.name?.toLowerCase().includes(searchLower) ||
            item.foxy_Opportunity?.foxy_sfdcoppid?.toLowerCase().includes(searchLower) ||
            item.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress?.toLowerCase().includes(searchLower)
        );
        setFilteredData(filtered);
    };

    const columns: TableProps<WonService>['columns'] = [
        {
            title: 'Service ID',
            dataIndex: 'foxy_serviceid',
            key: 'foxy_serviceid',
            width: 120,
            sorter: (a, b) => (a.foxy_serviceid || '').localeCompare(b.foxy_serviceid || ''),
        },
        {
            title: 'Product',
            dataIndex: ['foxy_Product', 'name'],
            key: 'product_name',
            width: 200,
            render: (text: string) => text || '-',
            sorter: (a, b) => (a.foxy_Product?.name || '').localeCompare(b.foxy_Product?.name || ''),
        },
        {
            title: 'Opportunity',
            dataIndex: ['foxy_Opportunity', 'name'],
            key: 'opportunity_name',
            width: 200,
            render: (text: string) => text || '-',
            sorter: (a, b) => (a.foxy_Opportunity?.name || '').localeCompare(b.foxy_Opportunity?.name || ''),
        },
        {
            title: 'SFDC Opp ID',
            dataIndex: ['foxy_Opportunity', 'foxy_sfdcoppid'],
            key: 'sfdc_opp_id',
            width: 120,
            render: (text: string) => text || '-',
        },
        {
            title: 'Opp Value',
            dataIndex: ['foxy_Opportunity', 'actualvalue'],
            key: 'actual_value',
            width: 120,
            render: (value: number) => value ? formatCurrency(value) : '-',
            sorter: (a, b) => (a.foxy_Opportunity?.actualvalue || 0) - (b.foxy_Opportunity?.actualvalue || 0),
        },
        {
            title: 'Address',
            dataIndex: ['foxy_AccountLocation', 'foxy_Building', 'foxy_fulladdress'],
            key: 'address',
            width: 300,
            render: (text: string) => text || '-',
        },
        {
            title: 'Comp Rate',
            dataIndex: 'foxy_comprate',
            key: 'foxy_comprate',
            width: 100,
            render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
            sorter: (a, b) => (a.foxy_comprate || 0) - (b.foxy_comprate || 0),
        },
        {
            title: 'Expected Comp',
            dataIndex: 'foxy_expectedcomp',
            key: 'foxy_expectedcomp',
            width: 120,
            render: (value: number) => value ? formatCurrency(value) : '-',
            sorter: (a, b) => (a.foxy_expectedcomp || 0) - (b.foxy_expectedcomp || 0),
        },
        {
            title: 'Term',
            dataIndex: 'foxy_term',
            key: 'foxy_term',
            width: 80,
            sorter: (a, b) => (a.foxy_term || 0) - (b.foxy_term || 0),
        },
        {
            title: 'TCV',
            dataIndex: 'foxy_tcv',
            key: 'foxy_tcv',
            width: 120,
            render: (value: number) => value ? formatCurrency(value) : '-',
            sorter: (a, b) => (a.foxy_tcv || 0) - (b.foxy_tcv || 0),
        },
        {
            title: 'Access',
            dataIndex: 'foxy_access',
            key: 'foxy_access',
            width: 120,
            sorter: (a, b) => (a.foxy_access || '').localeCompare(b.foxy_access || ''),
        },
        {
            title: 'MRR',
            dataIndex: 'foxy_mrr',
            key: 'foxy_mrr',
            width: 120,
            render: (value: number) => value ? formatCurrency(value) : '-',
            sorter: (a, b) => (a.foxy_mrr || 0) - (b.foxy_mrr || 0),
        },
        {
            title: 'Quantity',
            dataIndex: 'foxy_quantity',
            key: 'foxy_quantity',
            width: 80,
            sorter: (a, b) => (a.foxy_quantity || 0) - (b.foxy_quantity || 0),
        },
        {
            title: 'Line Margin',
            dataIndex: 'foxy_linemargin',
            key: 'foxy_linemargin',
            width: 100,
            render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
            sorter: (a, b) => (a.foxy_linemargin || 0) - (b.foxy_linemargin || 0),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
                <h1>Won Services</h1>
                <Search
                    placeholder="Search by Service ID, Product, Opportunity, SFDC ID, or Address"
                    allowClear
                    enterButton
                    size="large"
                    onSearch={handleSearch}
                    onChange={e => handleSearch(e.target.value)}
                    style={{ maxWidth: 600 }}
                />
            </Space>
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="foxy_wonserviceid"
                scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
                className="custom-table"
                size="middle"
                pagination={{ 
                    pageSize: 50,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    showQuickJumper: true
                }}
            />
        </div>
    );
};

export default WonServicesPage;
