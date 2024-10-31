import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { listWonServices } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import './table.css';

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
}

const WonServicesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<WonService[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await listWonServices();
                if (response.value) {
                    setData(response.value);
                }
            } catch (error) {
                console.error('Error fetching won services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        {
            title: 'Service ID',
            dataIndex: 'foxy_serviceid',
            key: 'foxy_serviceid',
            width: 120,
        },
        {
            title: 'Comp Rate',
            dataIndex: 'foxy_comprate',
            key: 'foxy_comprate',
            width: 100,
            render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
        },
        {
            title: 'Expected Comp',
            dataIndex: 'foxy_expectedcomp',
            key: 'foxy_expectedcomp',
            width: 120,
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
        {
            title: 'Term',
            dataIndex: 'foxy_term',
            key: 'foxy_term',
            width: 80,
        },
        {
            title: 'TCV',
            dataIndex: 'foxy_tcv',
            key: 'foxy_tcv',
            width: 120,
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
        {
            title: 'Access',
            dataIndex: 'foxy_access',
            key: 'foxy_access',
            width: 120,
        },
        {
            title: 'MRR',
            dataIndex: 'foxy_mrr',
            key: 'foxy_mrr',
            width: 120,
            render: (value: number) => value ? formatCurrency(value) : '-',
        },
        {
            title: 'Quantity',
            dataIndex: 'foxy_quantity',
            key: 'foxy_quantity',
            width: 80,
        },
        {
            title: 'Line Margin',
            dataIndex: 'foxy_linemargin',
            key: 'foxy_linemargin',
            width: 100,
            render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1>Won Services</h1>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="foxy_wonserviceid"
                scroll={{ x: 'max-content' }}
                className="custom-table"
                size="middle"
                pagination={{ 
                    pageSize: 50,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`
                }}
            />
        </div>
    );
};

export default WonServicesPage;
