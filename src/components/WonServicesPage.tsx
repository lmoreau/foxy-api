import React, { useEffect, useState } from 'react';
import { Table, Input, Space, Tag, Tooltip, DatePicker } from 'antd';
import { listWonServices } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import type { TableProps } from 'antd';
import './table.css';
import dayjs from 'dayjs';

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

interface GroupedData {
    key: string;
    foxy_sfdcoppid: string;
    opportunity_name: string;
    actualvalue: number;
    actualclosedate: string;
    children?: WonService[];
    isGroup: true;
}

const isGroupData = (record: any): record is GroupedData => {
    return record && record.isGroup === true;
};

const isWonService = (record: any): record is WonService => {
    return record && 'foxy_wonserviceid' in record;
};

const WonServicesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GroupedData[]>([]);
    const [filteredData, setFilteredData] = useState<GroupedData[]>([]);
    const [searchText, setSearchText] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
    const [endDate, setEndDate] = useState(dayjs());

    const fetchData = async () => {
        try {
            const response = await listWonServices(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD')
            );
            if (response.value) {
                const services = response.value as WonService[];
                // Group the data by SFDC Opp ID
                const grouped = Object.values(
                    services.reduce((acc: { [key: string]: GroupedData }, item: WonService) => {
                        const oppId = item.foxy_Opportunity?.foxy_sfdcoppid;
                        if (!oppId) return acc;

                        if (!acc[oppId]) {
                            acc[oppId] = {
                                key: oppId,
                                foxy_sfdcoppid: oppId,
                                opportunity_name: item.foxy_Opportunity.name,
                                actualvalue: item.foxy_Opportunity.actualvalue,
                                actualclosedate: item.foxy_Opportunity.actualclosedate,
                                children: [],
                                isGroup: true
                            };
                        }
                        acc[oppId].children?.push(item);
                        return acc;
                    }, {})
                );
                // Sort the grouped data by actualclosedate in descending order
                grouped.sort((a, b) => {
                    const dateA = new Date(a.actualclosedate).getTime();
                    const dateB = new Date(b.actualclosedate).getTime();
                    return dateB - dateA;
                });

                setData(grouped);
                setFilteredData(grouped);
                // Set all groups to be expanded by default
                setExpandedKeys(grouped.map(g => g.key));
            }
        } catch (error) {
            console.error('Error fetching won services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleSearch = (value: string) => {
        setSearchText(value);
        const searchLower = value.toLowerCase();
        const filtered = data.filter(group => 
            group.foxy_sfdcoppid.toLowerCase().includes(searchLower) ||
            group.opportunity_name.toLowerCase().includes(searchLower) ||
            group.children?.some(item =>
                item.foxy_serviceid?.toLowerCase().includes(searchLower) ||
                item.foxy_Product?.name?.toLowerCase().includes(searchLower) ||
                item.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress?.toLowerCase().includes(searchLower)
            )
        );
        setFilteredData(filtered);
    };

    const columns: TableProps<GroupedData | WonService>['columns'] = [
        {
            title: 'Product',
            dataIndex: ['foxy_Product', 'name'],
            key: 'product_name',
            width: 350,
            ellipsis: true,
            sorter: (a: any, b: any) => {
                if (isGroupData(a) && isGroupData(b)) {
                    return a.opportunity_name.localeCompare(b.opportunity_name);
                }
                const aName = a.foxy_Product?.name || '';
                const bName = b.foxy_Product?.name || '';
                return aName.localeCompare(bName);
            },
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 10 : 1,
                style: isGroupData(record) ? { 
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold'
                } : {}
            }),
            render: (text: string, record: GroupedData | WonService) => {
                if (isGroupData(record)) {
                    return (
                        <Space size="small">
                            <Tag color="blue">{record.foxy_sfdcoppid}</Tag>
                            <Tag color="green">{record.actualclosedate}</Tag>
                            <span>{record.opportunity_name}</span>
                            <Tag color="blue">{formatCurrency(record.actualvalue)}</Tag>
                        </Space>
                    );
                }
                return (
                    <Tooltip title={text}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {text || '-'}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Address',
            dataIndex: ['foxy_AccountLocation', 'foxy_Building', 'foxy_fulladdress'],
            key: 'address',
            width: 450,
            ellipsis: true,
            sorter: (a: any, b: any) => {
                const aAddress = a.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress || '';
                const bAddress = b.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress || '';
                return aAddress.localeCompare(bAddress);
            },
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1,
                style: { 
                    paddingLeft: '20px',
                    maxWidth: '450px'
                }
            }),
            render: (text: string) => (
                <Tooltip title={text}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text || '-'}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Comp Rate',
            dataIndex: 'foxy_comprate',
            key: 'foxy_comprate',
            width: 100,
            sorter: (a: any, b: any) => (a.foxy_comprate || 0) - (b.foxy_comprate || 0),
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
            render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
        },
        {
            title: 'Expected Comp',
            dataIndex: 'foxy_expectedcomp',
            key: 'foxy_expectedcomp',
            width: 120,
            sorter: (a: any, b: any) => (a.foxy_expectedcomp || 0) - (b.foxy_expectedcomp || 0),
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
        {
            title: 'Term',
            dataIndex: 'foxy_term',
            key: 'foxy_term',
            width: 80,
            sorter: (a: any, b: any) => (a.foxy_term || 0) - (b.foxy_term || 0),
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
        },
        {
            title: 'TCV',
            dataIndex: 'foxy_tcv',
            key: 'foxy_tcv',
            width: 120,
            sorter: (a: any, b: any) => (a.foxy_tcv || 0) - (b.foxy_tcv || 0),
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
        {
            title: 'Access',
            dataIndex: 'foxy_access',
            key: 'foxy_access',
            width: 120,
            sorter: (a: any, b: any) => {
                const aAccess = a.foxy_access || '';
                const bAccess = b.foxy_access || '';
                return aAccess.localeCompare(bAccess);
            },
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
        },
        {
            title: 'MRR',
            dataIndex: 'foxy_mrr',
            key: 'foxy_mrr',
            width: 120,
            sorter: (a: any, b: any) => (a.foxy_mrr || 0) - (b.foxy_mrr || 0),
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
        {
            title: 'Quantity',
            dataIndex: 'foxy_quantity',
            key: 'foxy_quantity',
            width: 80,
            sorter: (a: any, b: any) => (a.foxy_quantity || 0) - (b.foxy_quantity || 0),
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
        },
        {
            title: 'Line Margin',
            dataIndex: 'foxy_linemargin',
            key: 'foxy_linemargin',
            width: 100,
            sorter: (a: any, b: any) => (a.foxy_linemargin || 0) - (b.foxy_linemargin || 0),
            onCell: (record) => ({
                colSpan: isGroupData(record) ? 0 : 1
            }),
            render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
                <h1>Won Services</h1>
                <Space size="middle">
                    <DatePicker
                        value={startDate}
                        onChange={(date) => date && setStartDate(date)}
                        placeholder="Start Date"
                    />
                    <DatePicker
                        value={endDate}
                        onChange={(date) => date && setEndDate(date)}
                        placeholder="End Date"
                    />
                    <Search
                        placeholder="Search by Opp ID, Service ID, Product, or Address"
                        allowClear
                        enterButton
                        size="large"
                        onSearch={handleSearch}
                        onChange={e => handleSearch(e.target.value)}
                        style={{ width: 400 }}
                    />
                </Space>
            </Space>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey={(record: GroupedData | WonService) => 
                    isGroupData(record) ? record.key : record.foxy_wonserviceid
                }
                scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
                className="custom-table"
                size="middle"
                pagination={{ 
                    pageSize: 50,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    showQuickJumper: true
                }}
                expandable={{
                    expandedRowKeys: expandedKeys,
                    onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]),
                }}
            />
        </div>
    );
};

export default WonServicesPage;
