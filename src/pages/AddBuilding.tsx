import React, { useState, useCallback, useRef } from 'react';
import { Card, Space, Typography, Spin } from 'antd';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { LoadingOutlined } from '@ant-design/icons';

const { Title } = Typography;

const libraries: ("places")[] = ["places"];

interface Location {
  lat: number;
  lng: number;
}

type MapTypeId = 'roadmap' | 'satellite' | 'hybrid';

const AddBuilding: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapType, setMapType] = useState<MapTypeId>('roadmap');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    autocomplete.setComponentRestrictions({ country: 'ca' });
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        setSelectedLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setAddress(place.formatted_address || '');
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
