import React, { useState, useCallback, useRef } from 'react';
import { Card, Space, Typography, Spin, Alert, List, Button, Select, Row, Col } from 'antd';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../utils/api/config';
import { buildingTypeMap } from '../utils/buildingTypeMapper';
import { foxy_rogersfibre, foxy_rogerscable, foxy_gpon } from '../utils/networkTypeMapper';

const { Title } = Typography;
const { Option } = Select;

const libraries: ("places")[] = ["places"];

interface Location {
  lat: number;
  lng: number;
}

interface DuplicateBuilding {
  [key: string]: any;  // Allow any field since we're not sure of exact field names yet
}

type MapTypeId = 'roadmap' | 'satellite' | 'hybrid';

const AddBuilding: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapType, setMapType] = useState<MapTypeId>('roadmap');
  const [duplicateBuildings, setDuplicateBuildings] = useState<DuplicateBuilding[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [buildingType, setBuildingType] = useState<number>();
  const [fibreType, setFibreType] = useState<number>();
  const [cableType, setCableType] = useState<number>();
  const [gponType, setGponType] = useState<number>();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
    let streetNumber = '';
    let streetName = '';

    place.address_components?.forEach((component) => {
      if (component.types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (component.types.includes('route')) {
        streetName = component.long_name;
      }
    });

    return { streetNumber, streetName };
  };

  const checkDuplicates = async (streetNumber: string, streetName: string) => {
    setCheckingDuplicates(true);
    setDuplicateError(null);
    setDuplicateBuildings([]);

    try {
      const headers = await getAuthHeaders();
      const url = `${API_BASE_URL}/checkDuplicateBuildings`;
      
      const response = await axios.get(url, {
        params: {
          streetNumber,
          streetName
        },
        headers,
        validateStatus: null
      });

      if (response.status === 200 && response.data?.duplicates) {
        setDuplicateBuildings(response.data.duplicates);
      } else {
        const errorMessage = response.data?.error || 
                           response.data?.details?.error?.message ||
                           response.data?.message ||
                           'Failed to check for duplicate buildings';
        setDuplicateError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details?.error?.message ||
                          error.message ||
                          'Failed to check for duplicate buildings';
      setDuplicateError(errorMessage);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    autocomplete.setComponentRestrictions({ country: 'ca' });
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setSelectedLocation(location);
        setAddress(place.formatted_address || '');

        const { streetNumber, streetName } = extractAddressComponents(place);
        if (streetNumber && streetName) {
          checkDuplicates(streetNumber, streetName);
        } else {
          setDuplicateError('Could not extract street information from the selected address');
        }
      }
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const defaultCenter = {
    lat: 56.1304,  // Center of Canada
    lng: -106.3468,
  };

  const formatBuildingAddress = (building: DuplicateBuilding) => {
    try {
      const parts = [];
      if (building.foxy_streetnumber) parts.push(building.foxy_streetnumber);
      if (building.foxy_streetname) parts.push(building.foxy_streetname);
      if (building.foxy_city) parts.push(building.foxy_city);
      if (building.foxy_province) parts.push(building.foxy_province);
      
      return parts.length > 0 ? parts.join(' ') : JSON.stringify(building);
    } catch (error) {
      return 'Address formatting error';
    }
  };

  if (!isLoaded) {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
  }

  const showDropdowns = !checkingDuplicates && !duplicateError && duplicateBuildings.length === 0 && selectedLocation;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Add a Building</Title>
      
      <Card title="Building Information">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            restrictions={{ country: 'ca' }}
          >
            <input
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 11px',
                fontSize: '14px',
                lineHeight: '1.5714285714285714',
                borderRadius: '6px',
                border: '1px solid #d9d9d9',
                marginBottom: '16px',
              }}
            />
          </Autocomplete>

          {checkingDuplicates && (
            <Alert
              message="Checking for duplicate buildings..."
              type="info"
              showIcon
            />
          )}

          {duplicateError && (
            <Alert
              message="Error Checking Duplicates"
              description={duplicateError}
              type="error"
              showIcon
            />
          )}

          {duplicateBuildings.length > 0 && (
            <Alert
              message="Potential Duplicate Buildings Found"
              description={
                <List
                  size="small"
                  dataSource={duplicateBuildings}
                  renderItem={building => (
                    <List.Item>
                      {formatBuildingAddress(building)}
                    </List.Item>
                  )}
                />
              }
              type="warning"
              showIcon
            />
          )}

          {showDropdowns && (
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong>Building Type</Typography.Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select Building Type"
                    value={buildingType}
                    onChange={setBuildingType}
                  >
                    {Object.entries(buildingTypeMap).map(([value, label]) => (
                      <Option key={value} value={Number(value)}>{label}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong>Fibre Status</Typography.Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select Fibre Status"
                    value={fibreType}
                    onChange={setFibreType}
                  >
                    {Object.entries(foxy_rogersfibre).map(([value, label]) => (
                      <Option key={value} value={Number(value)}>{label}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong>Cable Status</Typography.Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select Cable Status"
                    value={cableType}
                    onChange={setCableType}
                  >
                    {Object.entries(foxy_rogerscable).map(([value, label]) => (
                      <Option key={value} value={Number(value)}>{label}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong>GPON Status</Typography.Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select GPON Status"
                    value={gponType}
                    onChange={setGponType}
                  >
                    {Object.entries(foxy_gpon).map(([value, label]) => (
                      <Option key={value} value={Number(value)}>{label}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>
          )}
          
          {selectedLocation && (
            <Row gutter={16}>
              <Col span={12}>
                <Card
                  title="Map View"
                  extra={
                    <Space>
                      <Button type="link" onClick={() => setMapType('roadmap')}>Map</Button>
                      <Button type="link" onClick={() => setMapType('satellite')}>Satellite</Button>
                      <Button type="link" onClick={() => setMapType('hybrid')}>Hybrid</Button>
                    </Space>
                  }
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={selectedLocation}
                    zoom={18}
                    mapTypeId={mapType}
                  >
                    <Marker position={selectedLocation} />
                  </GoogleMap>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Street View">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={selectedLocation}
                    zoom={18}
                    options={{
                      streetViewControl: true,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      zoomControl: false,
                    }}
                    onLoad={(map) => {
                      const panorama = map.getStreetView();
                      panorama.setPosition(selectedLocation);
                      panorama.setVisible(true);
                    }}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default AddBuilding;
