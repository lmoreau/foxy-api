import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, message } from 'antd';
import { listWonServices, calculateWonServicesComp } from '../utils/api';
import { groupWonServicesByOpportunity } from '../utils/wonServicesUtils';
import { GroupedData, WonService } from '../types/wonServices';
import WonServicesFilters from './WonServices/WonServicesFilters';
import WonServicesTable from './WonServices/WonServicesTable';
import { AxiosError } from 'axios';

const WonServicesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
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
            message.error('Failed to fetch won services');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateComp = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one service to calculate compensation');
            return;
        }

        setCalculating(true);
        try {
            const result = await calculateWonServicesComp(selectedRowKeys as string[]);
            console.log('Calculation result:', result);
            message.success('Successfully calculated compensation');
            await fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error calculating compensation:', error);
            const axiosError = error as AxiosError<{ error: string }>;
            if (axiosError.response?.data?.error) {
                message.error(`Failed to calculate compensation: ${axiosError.response.data.error}`);
            } else {
                message.error('Failed to calculate compensation');
            }
        } finally {
            setCalculating(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const matchesSearch = (item: WonService, searchLower: string) => 
        item.foxy_serviceid?.toLowerCase().includes(searchLower) ||
        item.foxy_Product?.name?.toLowerCase().includes(searchLower) ||
        item.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress?.toLowerCase().includes(searchLower) ||
        item.foxy_Opportunity?.foxy_sfdcoppid?.toLowerCase().includes(searchLower);

    const filterData = (sourceData: GroupedData[], search: string, statuses: number[], strict: boolean) => {
        let filtered = sourceData;

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(group => 
                group.children?.some(item => matchesSearch(item, searchLower))
            );

            if (strict) {
                // In strict mode, only show matching records
                filtered = filtered.map(group => ({
                    ...group,
                    children: group.children?.filter(item => matchesSearch(item, searchLower))
                }));
            }
        }

        // Apply payment status filter
        if (statuses.length > 0) {
            filtered = filtered.filter(group => 
                group.children?.some(item => statuses.includes(item.foxy_inpaymentstatus))
            );

            if (strict) {
                // In strict mode, only show matching records
                filtered = filtered.map(group => ({
                    ...group,
                    children: group.children?.filter(item => statuses.includes(item.foxy_inpaymentstatus))
                }));
            }
        }

        // Remove any groups that ended up with no children
        filtered = filtered.filter(group => group.children && group.children.length > 0);

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
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    data={filteredData}
                />
                {selectedRowKeys.length > 0 && (
                    <Button 
                        type="primary"
                        onClick={handleCalculateComp}
                        loading={calculating}
                    >
                        Calculate Compensation ({selectedRowKeys.length} selected)
                    </Button>
                )}
            </div>
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
