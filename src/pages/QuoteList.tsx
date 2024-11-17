import React, { useEffect, useState } from 'react';
import { Select, Table } from 'antd';
import type { TableProps } from 'antd';
import { listQuoteRequests } from '../utils/api';
import { quoteStageMap } from '../utils/quoteStageMapper';

const EXCLUDED_STAGES = [612100000, 612100002, 612100009]; // Draft, Pending Sales, Completed

interface QuoteData {
    foxy_quotestatus: number;
    foxy_opticquote: string;
    foxy_quotestage: number;
    foxy_quotetype: number;
    foxy_quoteid: string;
    foxy_primaryquote: boolean;
    createdon: string;
    foxyflow_submittedon: string;
    foxy_subject: string;
    foxy_Account: {
        name: string;
    };
    foxy_Opportunity: {
        name: string;
    };
}

const QuoteList: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedStages, setSelectedStages] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const columns: TableProps<QuoteData>['columns'] = [
        {
            title: 'Quote ID',
            dataIndex: 'foxy_quoteid',
            key: 'foxy_quoteid',
            fixed: 'left',
            width: 100
        },
        {
            title: 'Account',
            dataIndex: ['foxy_Account', 'name'],
            key: 'accountName',
            width: 250,
            ellipsis: true
        },
        {
            title: 'Opportunity',
            dataIndex: ['foxy_Opportunity', 'name'],
            key: 'opportunityName',
            width: 250,
            ellipsis: true
        },
        {
            title: 'Optic Quote',
            dataIndex: 'foxy_opticquote',
            key: 'foxy_opticquote',
            width: 120
        },
        {
            title: 'Subject',
            dataIndex: 'foxy_subject',
            key: 'foxy_subject',
            width: 350,
            ellipsis: true
        },
        {
            title: 'Stage',
            dataIndex: 'foxy_quotestage',
            key: 'foxy_quotestage',
            width: 180,
            render: (stage: number) => quoteStageMap[stage] || stage
        },
        {
            title: 'Primary',
            dataIndex: 'foxy_primaryquote',
            key: 'foxy_primaryquote',
            width: 100,
            render: (primary: boolean) => primary ? 'Yes' : 'No'
        },
        {
            title: 'Created',
            dataIndex: 'createdon',
            key: 'createdon',
            width: 180,
            render: (date: string) => new Date(date).toLocaleString()
        },
        {
            title: 'Submitted',
            dataIndex: 'foxyflow_submittedon',
            key: 'foxyflow_submittedon',
            width: 180,
            render: (date: string) => date ? new Date(date).toLocaleString() : '-'
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // If no stages selected, use default filter (all except excluded)
                const stagesToFilter = selectedStages.length > 0
                    ? selectedStages
                    : Object.keys(quoteStageMap)
                        .map(Number)
                        .filter(stage => !EXCLUDED_STAGES.includes(stage));

                const response = await listQuoteRequests(stagesToFilter);
                setData(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedStages]);

    const handleStageChange = (values: number[]) => {
        setSelectedStages(values);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    const tableData = data?.value || [];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Quote List</h1>
            <div style={{ marginBottom: '20px' }}>
                <Select
                    mode="multiple"
                    style={{ width: 500 }}
                    placeholder="Select Quote Stages"
                    allowClear
                    onChange={handleStageChange}
                    maxTagCount="responsive"
                >
                    {Object.entries(quoteStageMap).map(([value, label]) => (
                        <Select.Option key={value} value={parseInt(value)}>
                            {label}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            <Table
                columns={columns}
                dataSource={tableData}
                rowKey="foxy_foxyquoterequestid"
                loading={loading}
                scroll={{ x: 1710, y: 'calc(100vh - 300px)' }}
                pagination={{
                    pageSize: 50,
                    showSizeChanger: true,
                    showQuickJumper: true
                }}
                size="small"
            />
        </div>
    );
};

export default QuoteList;
