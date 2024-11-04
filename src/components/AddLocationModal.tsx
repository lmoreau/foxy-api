import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Select, Spin, message } from 'antd';
import { listAccountLocationRows, createFoxyQuoteRequestLocation } from '../utils/api';

interface AddLocationModalProps {
  isVisible: boolean;
  onOk: (selectedLocationId: string) => void;
  onCancel: () => void;
  quoteRequestId: string;
  accountId?: string;
  onRefresh: () => void;
}

interface Location {
  foxy_accountlocationid: string;
  foxy_Building: {
    foxy_fulladdress: string;
    foxy_buildingid: string;
  };
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ isVisible, onOk, onCancel, quoteRequestId, accountId, onRefresh }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    if (!accountId) {
      console.error('Account ID is not provided');
      message.error('Unable to fetch locations. Account ID is missing.');
      return;
    }

    setLoading(true);
    try {
      const response = await listAccountLocationRows(accountId);
      if (response && Array.isArray(response.value)) {
        setLocations(response.value);
      } else {
        console.error('Unexpected API response structure:', response);
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
      fetchLocations();
    }
  }, [isVisible, accountId, fetchLocations]);

  const handleOk = async () => {
    if (selectedLocationId) {
      const selectedLocation = locations.find(location => location.foxy_accountlocationid === selectedLocationId);
      if (selectedLocation) {
        try {
          await createFoxyQuoteRequestLocation(
            selectedLocation.foxy_Building.foxy_buildingid,
            quoteRequestId,
            selectedLocationId
          );
          message.success('Location added successfully');
          onOk(selectedLocationId);
          onRefresh();
        } catch (error) {
          console.error('Error creating quote request location:', error);
          message.error('Failed to add location. Please try again.');
        }
      } else {
        message.error('Selected location not found');
      }
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
