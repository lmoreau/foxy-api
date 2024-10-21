import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Select, Spin, message } from 'antd';
import axios from 'axios';

interface AddLocationModalProps {
  isVisible: boolean;
  onOk: (selectedLocationId: string) => void;
  onCancel: () => void;
  quoteRequestId: string;
  accountId?: string;
}

interface Location {
  foxy_accountlocationid: string;
  foxy_Building: {
    foxy_fulladdress: string;
  };
}

interface ApiResponse {
  value: Location[];
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ isVisible, onOk, onCancel, quoteRequestId, accountId }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  console.log('AddLocationModal props:', { isVisible, quoteRequestId, accountId });

  const fetchLocations = useCallback(async () => {
    if (!accountId) {
      console.error('Account ID is not provided');
      message.error('Unable to fetch locations. Account ID is missing.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`http://localhost:7071/api/listAccountLocationRows?accountId=${accountId}`);
      console.log('API response:', response.data);
      if (response.data && Array.isArray(response.data.value)) {
        setLocations(response.data.value);
      } else {
        console.error('Unexpected API response structure:', response.data);
        message.error('Failed to load locations. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      message.error('Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (isVisible && accountId) {
      console.log('Fetching locations for accountId:', accountId);
      fetchLocations();
    } else {
      console.log('Not fetching locations. isVisible:', isVisible, 'accountId:', accountId);
    }
  }, [isVisible, accountId, fetchLocations]);

  const handleOk = () => {
    if (selectedLocationId) {
      onOk(selectedLocationId);
    } else {
      message.warning('Please select a location');
    }
  };

  return (
    <Modal title="Add Location" open={isVisible} onOk={handleOk} onCancel={onCancel}>
      <Spin spinning={loading}>
        {accountId ? (
          <Select
            style={{ width: '100%' }}
            placeholder="Select a location"
            onChange={setSelectedLocationId}
            value={selectedLocationId}
          >
            {locations.map((location) => (
              <Select.Option key={location.foxy_accountlocationid} value={location.foxy_accountlocationid}>
                {location.foxy_Building.foxy_fulladdress}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <p>Account ID is required to fetch locations.</p>
        )}
      </Spin>
    </Modal>
  );
};

export default AddLocationModal;
