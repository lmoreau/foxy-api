import React from 'react';
import { Space, Tag, Tooltip } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { formatCurrency } from '../../utils/formatters';
import { getRenewalDisposition } from '../../utils/constants/renewalDispositionMapper';
import { getInPaymentStatus } from '../../utils/constants/inPaymentStatusMapper';
import { getRevenueType } from '../../utils/constants/revenueTypeMapper';
import { GroupedData, WonService, isGroupData } from '../../types/wonServices';

export const getWonServicesColumns = (): TableProps<GroupedData | WonService>['columns'] => [
    {
        title: 'Product',
        dataIndex: ['foxy_Product', 'name'],
        key: 'product_name',
        width: 400,
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
            colSpan: isGroupData(record) ? 15 : 1,
            style: isGroupData(record) ? { 
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
                padding: '8px 16px'
            } : {}
        }),
        render: (text: string, record: GroupedData | WonService) => {
            if (isGroupData(record)) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Space size="small">
                            <Tag color="blue">{record.foxy_sfdcoppid}</Tag>
                            <Tag color="green">{record.actualclosedate}</Tag>
                            <Tag color="blue">{formatCurrency(record.actualvalue)}</Tag>
                        </Space>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            {record.children?.[0]?.foxy_Account?.name || ''}
                        </div>
                        <div>
                            {record.opportunity_name}
                        </div>
                    </div>
                );
            }
            const revenueType = getRevenueType(record.foxy_revenuetype || 0);
            let tagColor = 'default';
            let tagText = revenueType;
            let tooltipText = text;

            switch (revenueType) {
                case 'New':
                case 'Net New':
                    tagColor = 'green';
                    break;
                case 'Upsell':
                    tagColor = 'blue';
                    break;
                case 'Renewal':
                    tagColor = 'purple';
                    if (record.foxy_renewaltype === 'Early Renewal') {
                        tagText = 'Early Renewal';
                        tagColor = 'red';
                        tooltipText = `${text}\nRenewal Type: ${record.foxy_renewaltype}`;
                    }
                    break;
            }

            return (
                <Tooltip title={tooltipText}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text || '-'} <Tag color={tagColor}>{tagText}</Tag>
                    </div>
                </Tooltip>
            );
        },
    },
    {
        title: 'Address',
        dataIndex: ['foxy_AccountLocation', 'foxy_Building', 'foxy_fulladdress'],
        key: 'address',
        width: 250,
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
                maxWidth: '250px'
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
        title: 'Qty',
        dataIndex: 'foxy_quantity',
        key: 'foxy_quantity',
        width: 80,
        sorter: (a: any, b: any) => (a.foxy_quantity || 0) - (b.foxy_quantity || 0),
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
        title: 'Existing',
        dataIndex: 'crc9f_existingmrr',
        key: 'crc9f_existingmrr',
        width: 120,
        sorter: (a: any, b: any) => (a.crc9f_existingmrr || 0) - (b.crc9f_existingmrr || 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
        render: (value: number | null) => value ? formatCurrency(value) : '-',
    },
    {
        title: 'Delta',
        dataIndex: 'foxy_mrruptick',
        key: 'foxy_mrruptick',
        width: 120,
        sorter: (a: any, b: any) => (a.foxy_mrruptick || 0) - (b.foxy_mrruptick || 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
        render: (value: number | null) => value ? formatCurrency(value) : '-',
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
        title: 'Expected',
        dataIndex: 'foxy_expectedcomp',
        key: 'foxy_expectedcomp',
        width: 120,
        sorter: (a: any, b: any) => (a.foxy_expectedcomp || 0) - (b.foxy_expectedcomp || 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
        render: (value: number, record: GroupedData | WonService) => {
            if (isGroupData(record)) return value ? formatCurrency(value) : '-';
            
            const wonService = record as WonService;
            return (
                <Tooltip title={wonService.crc9f_expectedcompbreakdown} placement="topLeft">
                    <div>{value ? formatCurrency(value) : '-'}</div>
                </Tooltip>
            );
        },
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
    {
        title: 'In Payment Status',
        dataIndex: 'foxy_inpaymentstatus',
        key: 'foxy_inpaymentstatus',
        width: 150,
        sorter: (a: any, b: any) => {
            const aStatus = getInPaymentStatus(a.foxy_inpaymentstatus || 0);
            const bStatus = getInPaymentStatus(b.foxy_inpaymentstatus || 0);
            return aStatus.localeCompare(bStatus);
        },
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
        render: (value: number) => getInPaymentStatus(value),
    },
];
