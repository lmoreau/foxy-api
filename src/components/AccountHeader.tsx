import React from 'react';
import { Button, Tag } from 'antd';
import { AccountData } from '../types/residualTypes';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
import { serviceColors } from '../utils/constants/serviceColors';

interface AccountHeaderProps {
  accountData: AccountData;
  onEditStatus: () => void;
  accountId: string;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({ accountData, onEditStatus, accountId }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <h1 style={{ margin: 0 }}>{accountData.name}</h1>
      <Button type="primary" onClick={onEditStatus}>
        Edit Status
      </Button>
      <Button onClick={() => window.open(`https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&forceUCI=1&pagetype=entityrecord&etn=account&id=${accountId}`, '_blank')}>
        View in Foxy
      </Button>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Wireline Residuals:</span>
        <Tag color="blue">{getWirelineResidualsLabel(accountData.foxyflow_wirelineresiduals)}</Tag>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Services:</span>
        {accountData.foxy_cable && <Tag color={serviceColors.Cable}>Cable</Tag>}
        {accountData.foxy_datacentre && <Tag color={serviceColors['Data Centre']}>Data Centre</Tag>}
        {accountData.foxy_fibreinternet && <Tag color={serviceColors['Fibre Internet']}>Fibre Internet</Tag>}
        {accountData.foxy_gpon && <Tag color={serviceColors.GPON}>GPON</Tag>}
        {accountData.foxy_microsoft365 && <Tag color={serviceColors['Microsoft 365']}>Microsoft 365</Tag>}
        {accountData.foxy_res && <Tag color={serviceColors.RES}>RES</Tag>}
        {accountData.foxy_sip && <Tag color={serviceColors.SIP}>SIP</Tag>}
        {accountData.foxy_unison && <Tag color={serviceColors.Unison}>Unison</Tag>}
      </div>
    </div>
  </div>
);
