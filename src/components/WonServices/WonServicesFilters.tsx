import React, { ReactNode, useEffect, useState } from 'react';
import { Space, Input, DatePicker, Button, Select, Switch, Tooltip, Typography } from 'antd';
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { inPaymentStatusMapper } from '../../utils/constants/inPaymentStatusMapper';
import { GroupedData } from '../../types/wonServices';
import { formatCurrency } from '../../utils/formatters';
import { checkUserAccess, UserAccessLevel } from '../../auth/authService';

const { Search } = Input;
const { Title, Text } = Typography;

export interface WonServicesFiltersProps {
    startDate: Dayjs;
    endDate: Dayjs;
    onStartDateChange: (date: Dayjs | null) => void;
    onEndDateChange: (date: Dayjs | null) => void;
    onSearch: (value: string) => void;
    onToggleExpand: () => void;
    isExpanded: boolean;
    paymentStatuses?: number[];
    onPaymentStatusChange?: (values: number[]) => void;
    strictMode: boolean;
    onStrictModeChange: (checked: boolean) => void;
    data: GroupedData[];
    actionButton?: ReactNode;
}

const WonServicesFilters: React.FC<WonServicesFiltersProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onSearch,
    onToggleExpand,
    isExpanded,
    paymentStatuses = [],
    onPaymentStatusChange,
    strictMode,
    onStrictModeChange,
    data,
    actionButton
}) => {
    const [userAccess, setUserAccess] = useState<UserAccessLevel>('none');

    useEffect(() => {
        const fetchUserAccess = async () => {
            const access = await checkUserAccess();
            setUserAccess(access);
        };
        fetchUserAccess();
    }, []);

    const paymentStatusOptions = Object.entries(inPaymentStatusMapper).map(([value, label]) => ({
        value: parseInt(value),
        label
    }));

    const opportunityCount = data.length;
    const serviceCount = data.reduce((sum, group) => sum + (group.children?.length || 0), 0);
    const totalExpected = data.reduce((sum, group) => 
        sum + (group.children?.reduce((groupSum, service) => 
            groupSum + (service.foxy_expectedcomp || 0), 0) || 0), 0);

    return (
        <Space direction="vertical" style={{ width: '100%' }} size={0}>
            <Title level={4} style={{ marginBottom: '4px' }}>Won Services</Title>
            <Text type="secondary" style={{ marginBottom: '16px' }}>
                Opportunities: {opportunityCount} · Won Services: {serviceCount}
                {userAccess === 'admin' && ` · Total Expected: ${formatCurrency(totalExpected)}`}
            </Text>
            <Space size="middle" align="start" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Space size="middle">
                    <DatePicker
                        value={startDate}
                        onChange={onStartDateChange}
                        placeholder="Start Date"
                    />
                    <DatePicker
                        value={endDate}
                        onChange={onEndDateChange}
                        placeholder="End Date"
                    />
                    <Select
                        placeholder="Payment Status"
                        style={{ width: 300 }}
                        allowClear
                        mode="multiple"
                        options={paymentStatusOptions}
                        value={paymentStatuses}
                        onChange={onPaymentStatusChange}
                        maxTagCount="responsive"
                    />
                    <Space>
                        <Search
                            placeholder="Search by Opp ID, Service ID, Product, or Address"
                            allowClear
                            enterButton
                            onSearch={onSearch}
                            onChange={e => onSearch(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Tooltip title={strictMode ? "Show exact matches only" : "Show all related records"}>
                            <Switch
                                checkedChildren="Exact"
                                unCheckedChildren="All"
                                checked={strictMode}
                                onChange={onStrictModeChange}
                            />
                        </Tooltip>
                    </Space>
                    <Button
                        type="primary"
                        onClick={onToggleExpand}
                        icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                    >
                        {isExpanded ? 'Collapse All' : 'Expand All'}
                    </Button>
                </Space>
                {actionButton}
            </Space>
        </Space>
    );
};

export default WonServicesFilters;
