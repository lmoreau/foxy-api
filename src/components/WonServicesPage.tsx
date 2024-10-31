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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await listWonServices();
                console.log('Full API Response:', response);
                if (response.value && response.value.length > 0) {
                    console.log('First item:', response.value[0]);
                    console.log('Product name:', response.value[0]?.foxy_Product?.name);
                    console.log('Opportunity:', response.value[0]?.foxy_Opportunity);
                    console.log('Building address:', response.value[0]?.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress);
                }
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
            title: 'Product',
            dataIndex: ['foxy_Product', 'name'],
            key: 'product_name',
            width: 200,
            render: (text: string) => text || '-',
        },
        {
            title: 'Opportunity',
            dataIndex: ['foxy_Opportunity', 'name'],
            key: 'opportunity_name',
            width: 200,
            render: (text: string) => text || '-',
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
