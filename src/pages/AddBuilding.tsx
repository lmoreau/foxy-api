import React, { useState, useCallback, useRef } from 'react';
import { Card, Space, Typography, Spin, Alert, List } from 'antd';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../utils/api/config';

const { Title } = Typography;

const libraries: ("places")[] = ["places"];

interface Location {
  lat: number;
  lng: number;
}

interface DuplicateBuilding {
  foxy_name: string;
  foxy_streetnumber: string;
  foxy_streetname: string;
  foxy_city: string;
  foxy_province: string;
  foxy_country: string;
}

type MapTypeId = 'roadmap' | 'satellite' | 'hybrid';

const AddBuilding: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapType, setMapType] = useState<MapTypeId>('roadmap');
  const [duplicateBuildings, setDuplicateBuildings] = useState<DuplicateBuilding[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
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

    console.log('Extracted address components:', { streetNumber, streetName });
    return { streetNumber, streetName };
  };

  const checkDuplicates = async (streetNumber: string, streetName: string) => {
    setCheckingDuplicates(true);
    setDuplicateError(null);
    setDuplicateBuildings([]);

    try {
      console.log('Checking duplicates for:', { streetNumber, streetName });
      const headers = await getAuthHeaders();
      
      const url = `${API_BASE_URL}/checkDuplicateBuildings`;
      console.log('Making request to:', url, {
        params: { streetNumber, streetName },
        headers
      });
      
      const response = await axios.get(url, {
        params: {
          streetNumber,
          streetName
        },
        headers,
        validateStatus: null // Don't throw on any status code
      });

      console.log('Received response:', {
        status: response.status,
        data: response.data
      });

      if (response.status === 200 && response.data?.duplicates) {
        setDuplicateBuildings(response.data.duplicates);
        if (response.data.duplicates.length > 0) {
          console.log('Found duplicate buildings:', response.data.duplicates);
        } else {
          console.log('No duplicate buildings found');
        }
      } else {
        // Handle non-200 responses or missing data
        const errorMessage = response.data?.error || 
                           response.data?.details?.error?.message ||
                           response.data?.message ||
                           'Failed to check for duplicate buildings';
        console.error('Error response:', errorMessage);
        setDuplicateError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error checking duplicates:', error);
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
      console.log('Place selected:', place);

      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        console.log('Location set:', location);
        setSelectedLocation(location);
        setAddress(place.formatted_address || '');

        // Check for duplicates when an address is selected
        const { streetNumber, streetName } = extractAddressComponents(place);
        if (streetNumber && streetName) {
          checkDuplicates(streetNumber, streetName);
        } else {
          console.warn('Could not extract street information from:', place);
          setDuplicateError('Could not extract street information from the selected address');
        }
      } else {
        console.warn('No geometry information in place result:', place);
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

  if (!isLoaded) {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
  }

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

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
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
                      {building.foxy_name} - {building.foxy_streetnumber} {building.foxy_streetname}, {building.foxy_city}, {building.foxy_province}
                    </List.Item>
                  )}
                />
              }
              type="warning"
              showIcon
            />
          )}
          
          <Card
            title="Location View"
            extra={
              <Space>
                <a onClick={() => setMapType('roadmap')}>Map</a>
                <a onClick={() => setMapType('satellite')}>Satellite</a>
                <a onClick={() => setMapType('hybrid')}>Hybrid</a>
              </Space>
            }
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedLocation || defaultCenter}
              zoom={selectedLocation ? 18 : 4}
              mapTypeId={mapType}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                />
              )}
            </GoogleMap>
          </Card>
        </Space>
      </Card>
    </Space>
  );
};

export default AddBuilding;
