import React, { useState, useEffect } from 'react';
import { Modal, Select, Spin, message } from 'antd';
import axios from 'axios';

interface AddLocationModalProps {
  isVisible: boolean;
  onOk: (selectedLocationId: string) => void;
  onCancel: () => void;
  quoteRequestId: string;
}

interface Location {
  foxy_foxyquoterequestlocationid: string;
  fullAddress: string;
}

interface ApiResponse {
  value: Location[];
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ isVisible, onOk, onCancel, quoteRequestId }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && quoteRequestId) {
      fetchLocations();
    }
  }, [isVisible, quoteRequestId]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`http://localhost:7071/api/listQuoteLocationRows?id=${quoteRequestId}`);
      console.log('API response:', response.data);
      if (response.data && Array.isArray(response.data.value)) {
        setLocations(response.data.value.map((item) => ({
          foxy_foxyquoterequestlocationid: item.foxy_foxyquoterequestlocationid,
          fullAddress: item.fullAddress || 'No address available'
        })));
      } else {
        console.error('Unexpected API response structure:', response.data);
        message.error('Failed to load locations. Please try again.');
      }
    } catch (error) {
      console.error(`Error fetching locations for quoteRequestId ${quoteRequestId}:`, error);
      message.error('Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <Select
          style={{ width: '100%' }}
          placeholder="Select a location"
          onChange={setSelectedLocationId}
          value={selectedLocationId}
        >
          {locations.map((location) => (
            <Select.Option key={location.foxy_foxyquoterequestlocationid} value={location.foxy_foxyquoterequestlocationid}>
              {location.fullAddress}
            </Select.Option>
          ))}
        </Select>
      </Spin>
    </Modal>
  );
};

export default AddLocationModal;
