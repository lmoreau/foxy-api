import React from 'react';
import { Space, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import { formatCurrency } from '../../utils/formatters';
import { getRenewalDisposition } from '../../utils/constants/renewalDispositionMapper';
import { GroupedData, WonService, isGroupData } from '../../types/wonServices';

export const getWonServicesColumns = (): TableProps<GroupedData | WonService>['columns'] => [
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
            colSpan: isGroupData(record) ? 17 : 1,
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
        title: 'Renewal Disposition',
        dataIndex: 'foxy_renewaldisposition',
        key: 'foxy_renewaldisposition',
        width: 150,
        sorter: (a: any, b: any) => {
            const aDisp = getRenewalDisposition(a.foxy_renewaldisposition || 0);
            const bDisp = getRenewalDisposition(b.foxy_renewaldisposition || 0);
            return aDisp.localeCompare(bDisp);
        },
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
        render: (value: number) => getRenewalDisposition(value),
    },
    {
        title: 'Infusion Payment Status',
        dataIndex: 'foxy_infusionpaymentstatus',
        key: 'foxy_infusionpaymentstatus',
        width: 150,
        sorter: (a: any, b: any) => (a.foxy_infusionpaymentstatus || 0) - (b.foxy_infusionpaymentstatus || 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
    },
    {
        title: 'Renewal Type',
        dataIndex: 'foxy_renewaltype',
        key: 'foxy_renewaltype',
        width: 200,
        sorter: (a: any, b: any) => {
            const aType = a.foxy_renewaltype || '';
            const bType = b.foxy_renewaltype || '';
            return aType.localeCompare(bType);
        },
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
    },
    {
        title: 'Solo Line',
        dataIndex: 'foxy_sololine',
        key: 'foxy_sololine',
        width: 100,
        sorter: (a: any, b: any) => (a.foxy_sololine ? 1 : 0) - (b.foxy_sololine ? 1 : 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
        render: (value: boolean) => value ? 'Yes' : 'No',
    },
    {
        title: 'Revenue Type',
        dataIndex: 'foxy_revenuetype',
        key: 'foxy_revenuetype',
        width: 120,
        sorter: (a: any, b: any) => (a.foxy_revenuetype || 0) - (b.foxy_revenuetype || 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
    },
    {
        title: 'In Payment Status',
        dataIndex: 'foxy_inpaymentstatus',
        key: 'foxy_inpaymentstatus',
        width: 150,
        sorter: (a: any, b: any) => (a.foxy_inpaymentstatus || 0) - (b.foxy_inpaymentstatus || 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
    },
    {
        title: 'MRR Uptick',
        dataIndex: 'foxy_mrruptick',
        key: 'foxy_mrruptick',
        width: 120,
        sorter: (a: any, b: any) => (a.foxy_mrruptick || 0) - (b.foxy_mrruptick || 0),
        onCell: (record) => ({
            colSpan: isGroupData(record) ? 0 : 1
        }),
        render: (value: number | null) => value ? formatCurrency(value) : '-',
    },
];
