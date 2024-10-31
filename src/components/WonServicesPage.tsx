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

    const fetchData = async () => {
        try {
            const response = await listWonServices(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD')
            );
            if (response.value) {
                const grouped = groupWonServicesByOpportunity(response.value as WonService[]);
                setData(grouped);
                setFilteredData(grouped);
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

    const handleSearch = (value: string) => {
        const searchLower = value.toLowerCase();
        const filtered = data.filter(group => 
            group.foxy_sfdcoppid.toLowerCase().includes(searchLower) ||
            group.opportunity_name.toLowerCase().includes(searchLower) ||
            group.children?.some(item =>
                item.foxy_serviceid?.toLowerCase().includes(searchLower) ||
                item.foxy_Product?.name?.toLowerCase().includes(searchLower) ||
                item.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress?.toLowerCase().includes(searchLower)
            )
        );
        setFilteredData(filtered);
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
