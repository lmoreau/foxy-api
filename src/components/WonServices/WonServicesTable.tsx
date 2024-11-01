import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { GroupedData, WonService, isGroupData } from '../../types/wonServices';
import { getWonServicesColumns } from './tableColumns';

interface WonServicesTableProps {
    data: GroupedData[];
    loading: boolean;
    expandedKeys: string[];
    selectedRowKeys: React.Key[];
    onExpandedRowsChange: (keys: string[]) => void;
    onSelectionChange: (keys: React.Key[]) => void;
}

const WonServicesTable: React.FC<WonServicesTableProps> = ({
    data,
    loading,
    expandedKeys,
    selectedRowKeys,
    onExpandedRowsChange,
    onSelectionChange,
}) => {
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectionChange,
    };

    return (
        <Table
            rowSelection={rowSelection}
            columns={getWonServicesColumns()}
            dataSource={data}
            loading={loading}
            rowKey={(record: GroupedData | WonService) => 
                isGroupData(record) ? record.key : record.foxy_wonserviceid
            }
            scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }} // Adjusted height
            className="custom-table"
            size="middle"
            pagination={{ 
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
                showQuickJumper: true
            }}
            expandable={{
                expandedRowKeys: expandedKeys,
                onExpandedRowsChange: (keys) => onExpandedRowsChange(keys as string[]),
            }}
        />
    );
};

export default WonServicesTable;
