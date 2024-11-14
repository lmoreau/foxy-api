import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Button, message, Dropdown, Tabs, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import * as XLSX from 'xlsx';
import { listWonServices, calculateWonServicesComp, updateWonService, recalculateWonServicePayments } from '../utils/api';
import { groupWonServicesByOpportunity } from '../utils/wonServicesUtils';
import { GroupedData, WonService } from '../types/wonServices';
import WonServicesFilters from './WonServices/WonServicesFilters';
import WonServicesTable from './WonServices/WonServicesTable';
import OverrideCompModal from './WonServices/OverrideCompModal';
import PaymentStatusModal from './WonServices/PaymentStatusModal';
import DisputeModal from './WonServices/DisputeModal';
import ViewServiceDisputeModal from './WonServices/ViewServiceDisputeModal';
import { AxiosError } from 'axios';
import { getInPaymentStatus } from '../utils/constants/inPaymentStatusMapper';
import { getRevenueType } from '../utils/constants/revenueTypeMapper';

const WonServicesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [data, setData] = useState<GroupedData[]>([]);
    const [rawData, setRawData] = useState<WonService[]>([]);
    const [filteredData, setFilteredData] = useState<GroupedData[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
    const [endDate, setEndDate] = useState(dayjs());
    const [paymentStatuses, setPaymentStatuses] = useState<number[]>([]);
    const [strictMode, setStrictMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [overrideModalVisible, setOverrideModalVisible] = useState(false);
    const [paymentStatusModalVisible, setPaymentStatusModalVisible] = useState(false);
    const [disputeModalVisible, setDisputeModalVisible] = useState(false);
    const [viewDisputeModalVisible, setViewDisputeModalVisible] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<WonService>();

    const filterData = useCallback((sourceData: GroupedData[], search: string, statuses: number[], strict: boolean) => {
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
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const response = await listWonServices(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD')
            );
            if (response.value) {
                const rawServices = response.value as WonService[];
                setRawData(rawServices);
                const grouped = groupWonServicesByOpportunity(rawServices);
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
    }, [startDate, endDate, searchText, paymentStatuses, strictMode, filterData]);

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

    const handleRecalculatePayments = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one service to recalculate payments');
            return;
        }

        setCalculating(true);
        try {
            // Recalculate payments for each selected service
            for (const id of selectedRowKeys) {
                await recalculateWonServicePayments(id as string);
            }
            message.success('Successfully recalculated total received payments');
            await fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error recalculating payments:', error);
            message.error('Failed to recalculate payments');
        } finally {
            setCalculating(false);
        }
    };

    const handleOverrideComp = async (amount: number) => {
        if (selectedRowKeys.length === 0) return;

        setCalculating(true);
        try {
            // Update each selected service
            for (const id of selectedRowKeys) {
                await updateWonService({ 
                    id: id as string, 
                    foxy_expectedcomp: amount 
                });
            }
            message.success('Successfully updated compensation');
            setOverrideModalVisible(false);
            await fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error updating compensation:', error);
            message.error('Failed to update compensation');
        } finally {
            setCalculating(false);
        }
    };

    const handlePaymentStatusChange = async (status: number) => {
        if (selectedRowKeys.length === 0) return;

        setCalculating(true);
        try {
            // Update each selected service
            for (const id of selectedRowKeys) {
                await updateWonService({ 
                    id: id as string, 
                    foxy_inpaymentstatus: status 
                });
            }
            message.success('Successfully updated payment status');
            setPaymentStatusModalVisible(false);
            await fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error updating payment status:', error);
            message.error('Failed to update payment status');
        } finally {
            setCalculating(false);
        }
    };

    const handleCreateDispute = async (internalNotes: string | undefined, disputeNotes: string) => {
        if (selectedRowKeys.length === 0) return;

        setCalculating(true);
        try {
            // Update each selected service
            for (const id of selectedRowKeys) {
                console.log('Creating dispute for service:', id);
                const updateData = {
                    id: id as string,
                    foxyflow_internalnotes: internalNotes,
                    foxyflow_claimnotes: disputeNotes,
                    foxy_inpaymentstatus: 612100008 // Status code for "Dispute Needed"
                };
                console.log('Update data:', updateData);
                await updateWonService(updateData);
            }
            message.success('Successfully created dispute');
            setDisputeModalVisible(false);
            await fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error creating dispute:', error);
            if (error instanceof AxiosError) {
                console.error('API Error details:', error.response?.data);
            }
            message.error('Failed to create dispute');
        } finally {
            setCalculating(false);
        }
    };

    const handleExportToExcel = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one service to export');
            return;
        }

        try {
            // Get selected services with their group data
            const selectedServices: any[] = [];
            filteredData.forEach(group => {
                group.children?.forEach(service => {
                    if (selectedRowKeys.includes(service.foxy_wonserviceid)) {
                        selectedServices.push({
                            // Group level data
                            'SFDC Opp ID': group.foxy_sfdcoppid,
                            'Actual Close Date': group.actualclosedate,
                            'Actual Amount': group.actualvalue,
                            'Account Name': service.foxy_Account?.name,
                            'Opportunity Name': group.opportunity_name,
                            // Service level data
                            'Product': service.foxy_Product?.name,
                            'Revenue Type': getRevenueType(service.foxy_revenuetype || 0),
                            'Payment Status': getInPaymentStatus(service.foxy_inpaymentstatus || 0),
                            'Address': service.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress,
                            'Quantity': service.foxy_quantity,
                            'MRR': service.foxy_mrr,
                            'Existing MRR': service.crc9f_existingmrr,
                            'Delta MRR': service.foxy_mrruptick,
                            'Term': service.foxy_term,
                            'TCV': service.foxy_tcv,
                            'Margin': service.foxy_linemargin,
                            'Expected Comp': service.foxy_expectedcomp,
                            'Total Received': service.foxy_totalinpayments,
                            'Service ID': service.foxy_serviceid,
                            'Contract Start': service.foxy_contractstart,
                            'Contract End': service.foxy_contractend,
                            'Comp Rate': service.foxy_comprate,
                            'Renewal Type': service.foxy_renewaltype,
                            'Internal Notes': service.foxyflow_internalnotes,
                        });
                    }
                });
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(selectedServices);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Won Services');

            // Generate filename with current date
            const filename = `Won_Services_Export_${dayjs().format('YYYY-MM-DD')}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);
            message.success('Successfully exported to Excel');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            message.error('Failed to export to Excel');
        }
    };

    const handleViewDispute = (service: WonService) => {
        setSelectedDispute(service);
        setViewDisputeModalVisible(true);
    };

    const handleDisputeModalClose = async () => {
        setViewDisputeModalVisible(false);
        await fetchData(); // Refresh data after modal closes
    };

    const items: MenuProps['items'] = [
        {
            key: 'calculate',
            label: 'Calculate Compensation',
            onClick: handleCalculateComp,
        },
        {
            key: 'override',
            label: 'Override Expected Comp',
            onClick: () => setOverrideModalVisible(true),
        },
        {
            key: 'payment_status',
            label: 'Change Payment Status',
            onClick: () => setPaymentStatusModalVisible(true),
        },
        {
            key: 'create_dispute',
            label: 'Create Dispute',
            onClick: () => setDisputeModalVisible(true),
        },
        {
            key: 'recalculate_payments',
            label: 'Recalculate Total Received',
            onClick: handleRecalculatePayments,
        },
        {
            key: 'export_excel',
            label: 'Export to Excel',
            onClick: handleExportToExcel,
        },
    ];

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const matchesSearch = (item: WonService, searchLower: string) => 
        item.foxy_serviceid?.toLowerCase().includes(searchLower) ||
        item.foxy_Product?.name?.toLowerCase().includes(searchLower) ||
        item.foxy_AccountLocation?.foxy_Building?.foxy_fulladdress?.toLowerCase().includes(searchLower) ||
        item.foxy_Opportunity?.foxy_sfdcoppid?.toLowerCase().includes(searchLower);

    const handleSearch = (value: string) => {
        setSearchText(value);
        filterData(data, value, paymentStatuses, strictMode);
    };

    const handlePaymentStatusFilter = (values: number[]) => {
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

    const getVisibleSelectedCount = useCallback(() => {
        const visibleIds = new Set<string>();
        filteredData.forEach(group => {
            group.children?.forEach(service => {
                visibleIds.add(service.foxy_wonserviceid);
            });
        });
        
        return selectedRowKeys.filter(key => visibleIds.has(key as string)).length;
    }, [filteredData, selectedRowKeys]);

    const handleClearSelection = () => {
        setSelectedRowKeys([]);
    };

    const mainContent = (
        <>
            <div style={{ marginBottom: '16px' }}>
                <WonServicesFilters
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={(date) => date && setStartDate(date)}
                    onEndDateChange={(date) => date && setEndDate(date)}
                    onSearch={handleSearch}
                    onToggleExpand={toggleExpandAll}
                    isExpanded={expandedKeys.length > 0}
                    paymentStatuses={paymentStatuses}
                    onPaymentStatusChange={handlePaymentStatusFilter}
                    strictMode={strictMode}
                    onStrictModeChange={handleStrictModeChange}
                    data={filteredData}
                    actionButton={selectedRowKeys.length > 0 ? (
                        <Space>
                            <Button onClick={handleClearSelection}>
                                Clear Selection ({selectedRowKeys.length} total, {getVisibleSelectedCount()} visible)
                            </Button>
                            <Dropdown menu={{ items }} trigger={['click']}>
                                <Button type="primary" loading={calculating}>
                                    Actions ({selectedRowKeys.length} selected) <DownOutlined />
                                </Button>
                            </Dropdown>
                        </Space>
                    ) : undefined}
                />
            </div>
            <WonServicesTable
                data={filteredData}
                loading={loading}
                expandedKeys={expandedKeys}
                selectedRowKeys={selectedRowKeys}
                onExpandedRowsChange={setExpandedKeys}
                onSelectionChange={setSelectedRowKeys}
                onViewDispute={handleViewDispute}
            />
            <OverrideCompModal
                visible={overrideModalVisible}
                onCancel={() => setOverrideModalVisible(false)}
                onConfirm={handleOverrideComp}
                selectedCount={selectedRowKeys.length}
            />
            <PaymentStatusModal
                visible={paymentStatusModalVisible}
                onCancel={() => setPaymentStatusModalVisible(false)}
                onConfirm={handlePaymentStatusChange}
                selectedCount={selectedRowKeys.length}
            />
            <DisputeModal
                visible={disputeModalVisible}
                onCancel={() => setDisputeModalVisible(false)}
                onConfirm={handleCreateDispute}
                selectedCount={selectedRowKeys.length}
            />
            <ViewServiceDisputeModal
                visible={viewDisputeModalVisible}
                onClose={handleDisputeModalClose}
                service={selectedDispute}
            />
        </>
    );

    return (
        <div style={{ padding: '24px' }}>
            <Tabs
                items={[
                    {
                        key: '1',
                        label: 'Won Services',
                        children: mainContent,
                    },
                    {
                        key: '2',
                        label: 'Raw Data',
                        children: (
                            <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                                {JSON.stringify(rawData, null, 2)}
                            </pre>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default WonServicesPage;
