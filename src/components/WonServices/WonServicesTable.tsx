import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { GroupedData, WonService, isGroupData } from '../../types/wonServices';
import { getWonServicesColumns } from './tableColumns';
import type { Key } from 'antd/es/table/interface';
import { checkUserAccess, UserAccessLevel } from '../../auth/authService';

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
    const [userAccess, setUserAccess] = useState<UserAccessLevel>('none');

    useEffect(() => {
        const fetchUserAccess = async () => {
            const access = await checkUserAccess();
            setUserAccess(access);
        };
        fetchUserAccess();
    }, []);

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectionChange,
        getCheckboxProps: (record: GroupedData | WonService) => ({
            disabled: isGroupData(record), // Disable checkbox for parent rows
        }),
    };

    const expandableConfig = {
        expandedRowKeys: expandedKeys,
        onExpandedRowsChange: (keys: readonly Key[]) => onExpandedRowsChange(keys as string[]),
    };

    return (
        <Table
            rowSelection={rowSelection}
            columns={getWonServicesColumns(userAccess)}
            dataSource={data}
            loading={loading}
            rowKey={(record: GroupedData | WonService) => 
                isGroupData(record) ? record.key : record.foxy_wonserviceid
            }
            scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
            className="custom-table"
            size="middle"
            pagination={{ 
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
                showQuickJumper: true
            }}
            expandable={expandableConfig}
        />
    );
};

export default WonServicesTable;
