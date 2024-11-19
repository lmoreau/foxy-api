import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tabs, Select, Space } from 'antd';
import { listWonServices } from '../utils/api';
import { WonService } from '../types/wonServices';
import { formatCurrency } from '../utils/formatters';
import dayjs from 'dayjs';
import { checkUserAccess } from '../auth/authService';

const ProductCompensationPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<WonService[]>([]);
    const [userAccess, setUserAccess] = useState<string>('none');
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserAccess = async () => {
            const access = await checkUserAccess();
            setUserAccess(access);
        };
        fetchUserAccess();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const startDate = dayjs().subtract(1, 'year');
                const endDate = dayjs();
                
                const response = await listWonServices(
                    startDate.format('YYYY-MM-DD'),
                    endDate.format('YYYY-MM-DD')
                );
                
                if (response.value) {
                    // Use the raw services data without grouping
                    setData(response.value as WonService[]);
                }
            } catch (error) {
                console.error('Error fetching won services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get unique products for the filter
    const productOptions = useMemo(() => {
        const uniqueProducts = new Set(
            data
                .filter(item => item.foxy_Product?.name)
                .map(item => item.foxy_Product.name)
        );
        return Array.from(uniqueProducts).map(name => ({
            label: name,
            value: name,
        }));
    }, [data]);

    // Filter data based on selected product
    const filteredData = useMemo(() => {
        if (!selectedProduct) return data;
        return data.filter(item => item.foxy_Product?.name === selectedProduct);
    }, [data, selectedProduct]);

    const columns = [
        {
            title: 'Product',
            dataIndex: ['foxy_Product', 'name'],
            key: 'product_name',
            width: 400,
            ellipsis: true,
            sorter: (a: WonService, b: WonService) => {
                const aName = a.foxy_Product?.name || '';
                const bName = b.foxy_Product?.name || '';
                return aName.localeCompare(bName);
            },
        },
        {
            title: 'Address',
            dataIndex: ['foxy_AccountLocation', 'foxy_Building', 'foxy_fulladdress'],
            key: 'address',
            width: 250,
            ellipsis: true,
            sorter: (a: WonService, b: WonService) => {
                const aAddress = a.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress || '';
                const bAddress = b.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress || '';
                return aAddress.localeCompare(bAddress);
            },
        },
        {
            title: 'MRR',
            dataIndex: 'foxy_mrr',
            key: 'foxy_mrr',
            width: 120,
            sorter: (a: WonService, b: WonService) => (a.foxy_mrr || 0) - (b.foxy_mrr || 0),
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
        {
            title: 'Term',
            dataIndex: 'foxy_term',
            key: 'foxy_term',
            width: 80,
            sorter: (a: WonService, b: WonService) => (a.foxy_term || 0) - (b.foxy_term || 0),
        },
        {
            title: 'Total Payments',
            dataIndex: 'foxy_totalinpayments',
            key: 'foxy_totalinpayments',
            width: 120,
            sorter: (a: WonService, b: WonService) => (a.foxy_totalinpayments || 0) - (b.foxy_totalinpayments || 0),
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
    ];

    const items = [
        {
            key: '1',
            label: 'Table View',
            children: (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Space>
                            <Select
                                showSearch
                                allowClear
                                style={{ width: 300 }}
                                placeholder="Filter by Product"
                                options={productOptions}
                                onChange={setSelectedProduct}
                                value={selectedProduct}
                                filterOption={(input, option) =>
                                    (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Space>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        loading={loading}
                        rowKey="foxy_wonserviceid"
                        scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
                        className="custom-table"
                        size="middle"
                        pagination={{ 
                            pageSize: 50,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                            showQuickJumper: true
                        }}
                    />
                </>
            ),
        },
        {
            key: '2',
            label: 'Raw Data',
            children: (
                <div style={{ 
                    padding: '20px', 
                    background: '#f5f5f5', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: 'calc(100vh - 350px)'
                }}>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        margin: 0
                    }}>
                        {JSON.stringify(filteredData, null, 2)}
                    </pre>
                </div>
            ),
        },
    ];

    return (
        <Tabs 
            defaultActiveKey="1" 
            items={items}
            style={{ background: 'white', padding: '24px' }}
        />
    );
};

export default ProductCompensationPage;
