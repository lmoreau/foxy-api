import React from 'react';
import { Space, Input, DatePicker, Button } from 'antd';
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';

const { Search } = Input;

interface WonServicesFiltersProps {
    startDate: Dayjs;
    endDate: Dayjs;
    onStartDateChange: (date: Dayjs | null) => void;
    onEndDateChange: (date: Dayjs | null) => void;
    onSearch: (value: string) => void;
    onToggleExpand: () => void;
    isExpanded: boolean;
}

const WonServicesFilters: React.FC<WonServicesFiltersProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onSearch,
    onToggleExpand,
    isExpanded,
}) => {
    return (
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
            <h1>Won Services</h1>
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
                <Search
                    placeholder="Search by Opp ID, Service ID, Product, or Address"
                    allowClear
                    enterButton
                    size="large"
                    onSearch={onSearch}
                    onChange={e => onSearch(e.target.value)}
                    style={{ width: 400 }}
                />
                <Button
                    type="primary"
                    onClick={onToggleExpand}
                    icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                >
                    {isExpanded ? 'Collapse All' : 'Expand All'}
                </Button>
            </Space>
        </Space>
    );
};

export default WonServicesFilters;