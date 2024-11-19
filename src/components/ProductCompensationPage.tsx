import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tabs, Select, Space, Statistic, Row, Col, Card, Switch, ConfigProvider, theme } from 'antd';
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
    const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
    const [usePerUnitCalculation, setUsePerUnitCalculation] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    // Get unique terms for the filter based on current product filter
    const termOptions = useMemo(() => {
        const dataToFilter = selectedProduct 
            ? data.filter(item => item.foxy_Product?.name === selectedProduct)
            : data;

        const uniqueTerms = new Set(
            dataToFilter
                .filter(item => item.foxy_term != null)
                .map(item => item.foxy_term)
        );
        return Array.from(uniqueTerms)
            .sort((a, b) => a - b)
            .map(term => ({
                label: `${term} months`,
                value: term,
            }));
    }, [data, selectedProduct]);

    // Reset term selection if the selected term is no longer in the options
    useEffect(() => {
        if (selectedTerm && !termOptions.some(option => option.value === selectedTerm)) {
            setSelectedTerm(null);
        }
    }, [termOptions, selectedTerm]);

    // Filter data based on selected filters
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesProduct = !selectedProduct || item.foxy_Product?.name === selectedProduct;
            const matchesTerm = !selectedTerm || item.foxy_term === selectedTerm;
            return matchesProduct && matchesTerm;
        });
    }, [data, selectedProduct, selectedTerm]);

    // Calculate statistics for total payments
    const paymentStats = useMemo(() => {
        const validPayments = filteredData
            .filter(item => item.foxy_totalinpayments != null && item.foxy_totalinpayments > 0);

        const payments = validPayments
            .map(item => {
                const payment = item.foxy_totalinpayments!;
                if (usePerUnitCalculation && item.foxy_quantity && item.foxy_quantity > 0) {
                    return payment / item.foxy_quantity;
                }
                return payment;
            });

        if (payments.length === 0) {
            return {
                average: 0,
                highest: 0,
                lowest: 0,
                count: 0,
                total: 0
            };
        }

        return {
            average: payments.reduce((a, b) => a + b, 0) / payments.length,
            highest: Math.max(...payments),
            lowest: Math.min(...payments),
            count: payments.length,
            // Always calculate total from original payments, not per-unit
            total: validPayments.reduce((sum, item) => sum + item.foxy_totalinpayments!, 0)
        };
    }, [filteredData, usePerUnitCalculation]);

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
            title: 'Account',
            dataIndex: ['foxy_Account', 'name'],
            key: 'account_name',
            width: 250,
            ellipsis: true,
            sorter: (a: WonService, b: WonService) => {
                const aName = a.foxy_Account?.name || '';
                const bName = b.foxy_Account?.name || '';
                return aName.localeCompare(bName);
            },
        },
        {
            title: 'Quantity',
            dataIndex: 'foxy_quantity',
            key: 'foxy_quantity',
            width: 100,
            sorter: (a: WonService, b: WonService) => (a.foxy_quantity || 0) - (b.foxy_quantity || 0),
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
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Space size="large">
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
                                <Select
                                    allowClear
                                    style={{ width: 150 }}
                                    placeholder="Filter by Term"
                                    options={termOptions}
                                    onChange={setSelectedTerm}
                                    value={selectedTerm}
                                />
                                <Space>
                                    <Switch
                                        checked={usePerUnitCalculation}
                                        onChange={setUsePerUnitCalculation}
                                    />
                                    <span>Calculate per-unit payments</span>
                                </Space>
                            </Space>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title="Total Payments"
                                            value={paymentStats.total}
                                            precision={2}
                                            formatter={(value) => formatCurrency(value as number)}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title={`${usePerUnitCalculation ? 'Per-Unit ' : ''}Average Payment (${paymentStats.count} records)`}
                                            value={paymentStats.average}
                                            precision={2}
                                            formatter={(value) => formatCurrency(value as number)}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title={`${usePerUnitCalculation ? 'Per-Unit ' : ''}Highest Payment`}
                                            value={paymentStats.highest}
                                            precision={2}
                                            formatter={(value) => formatCurrency(value as number)}
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title={`${usePerUnitCalculation ? 'Per-Unit ' : ''}Lowest Payment`}
                                            value={paymentStats.lowest}
                                            precision={2}
                                            formatter={(value) => formatCurrency(value as number)}
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
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
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    borderRadius: 6,
                }
            }}
        >
            <div style={{ 
                background: isDarkMode ? '#141414' : '#ffffff',
                minHeight: '100vh',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                boxSizing: 'border-box',
                padding: '32px',
            }}>
                <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            width: '100%', 
                            marginBottom: '24px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px'
                            }}>
                                <img 
                                    src="/foxylogo.png" 
                                    alt="Foxy Logo" 
                                    style={{ 
                                        height: '32px',
                                        width: 'auto'
                                    }} 
                                />
                                <h1 style={{ 
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 600,
                                    color: isDarkMode ? '#ffffff' : '#000000'
                                }}>
                                    Product Profit Dashboard
                                </h1>
                            </div>
                            <Switch
                                checked={isDarkMode}
                                onChange={setIsDarkMode}
                                checkedChildren="🌙"
                                unCheckedChildren="☀️"
                            />
                        </div>
                        <Tabs 
                            defaultActiveKey="1" 
                            items={items}
                        />
                    </Space>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ProductCompensationPage;
