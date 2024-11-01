import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { listWonServices } from '../utils/api';
import { groupWonServicesByOpportunity } from '../utils/wonServicesUtils';
import { GroupedData, WonService } from '../types/wonServices';
import WonServicesFilters from './WonServices/WonServicesFilters';
import WonServicesTable from './WonServices/WonServicesTable';

const WonServicesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GroupedData[]>([]);
    const [filteredData, setFilteredData] = useState<GroupedData[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
    const [endDate, setEndDate] = useState(dayjs());
    const [paymentStatuses, setPaymentStatuses] = useState<number[]>([]);
    const [strictMode, setStrictMode] = useState(false);
    const [searchText, setSearchText] = useState('');

    const fetchData = async () => {
        try {
            const response = await listWonServices(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD')
            );
            if (response.value) {
                const grouped = groupWonServicesByOpportunity(response.value as WonService[]);
                setData(grouped);
                filterData(grouped, searchText, paymentStatuses, strictMode);
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

    const matchesSearch = (item: WonService, searchLower: string) => 
        item.foxy_serviceid?.toLowerCase().includes(searchLower) ||
        item.foxy_Product?.name?.toLowerCase().includes(searchLower) ||
        item.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress?.toLowerCase().includes(searchLower);

    const filterData = (sourceData: GroupedData[], search: string, statuses: number[], strict: boolean) => {
        let filtered = sourceData;

        if (search) {
            const searchLower = search.toLowerCase();
            if (strict) {
                // In strict mode, only show exact matches
                filtered = filtered.map(group => ({
                    ...group,
                    children: group.children?.filter(item => matchesSearch(item, searchLower))
                })).filter(group => group.children && group.children.length > 0);
            } else {
                // In non-strict mode, show all children in groups that have at least one match
                filtered = filtered.filter(group => 
                    group.children?.some(item => matchesSearch(item, searchLower))
                );
            }
        }

        if (statuses.length > 0) {
            if (strict) {
                // In strict mode, only show exact matches
                filtered = filtered.map(group => ({
                    ...group,
                    children: group.children?.filter(item =>
                        statuses.includes(item.foxy_inpaymentstatus)
                    )
                })).filter(group => group.children && group.children.length > 0);
            } else {
                // In non-strict mode, show all children in groups that have at least one match
                filtered = filtered.filter(group => 
                    group.children?.some(item => statuses.includes(item.foxy_inpaymentstatus))
                );
            }
        }

        setFilteredData(filtered);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        filterData(data, value, paymentStatuses, strictMode);
    };

    const handlePaymentStatusChange = (values: number[]) => {
        setPaymentStatuses(values);
        filterData(data, searchText, values, strictMode);
    };

    const handleStrictModeChange = (checked: boolean) => {
        setStrictMode(checked);
        filterData(data, searchText, paymentStatuses, checked);
    };

    const toggleExpandAll = () => {
        if (expandedKeys.length > 0) {
            setExpandedKeys([]);
        } else {
            setExpandedKeys(filteredData.map(g => g.key));
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <WonServicesFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(date) => date && setStartDate(date)}
                onEndDateChange={(date) => date && setEndDate(date)}
                onSearch={handleSearch}
                onToggleExpand={toggleExpandAll}
                isExpanded={expandedKeys.length > 0}
                paymentStatuses={paymentStatuses}
                onPaymentStatusChange={handlePaymentStatusChange}
                strictMode={strictMode}
                onStrictModeChange={handleStrictModeChange}
            />
            <WonServicesTable
                data={filteredData}
                loading={loading}
                expandedKeys={expandedKeys}
                selectedRowKeys={selectedRowKeys}
                onExpandedRowsChange={setExpandedKeys}
                onSelectionChange={setSelectedRowKeys}
            />
        </div>
    );
};

export default WonServicesPage;
