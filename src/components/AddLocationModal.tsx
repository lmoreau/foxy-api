import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Select, Spin, message } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { listAccountLocationRows, createFoxyQuoteRequestLocation } from '../utils/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Add this component to handle map bounds
const MapBoundsSetter = ({ locations }: { locations: Location[] }) => {
  const map = useMap();

  useEffect(() => {
    const points = locations
      .filter(loc => loc.foxy_Building.foxy_latitude && loc.foxy_Building.foxy_longitude)
      .map(loc => [
        loc.foxy_Building.foxy_latitude!,
        loc.foxy_Building.foxy_longitude!
      ] as [number, number]);

    if (points.length > 0) {
      console.log('Points to fit:', points);
      const bounds = L.latLngBounds(points);
      console.log('Calculated bounds:', bounds);
      
      // Force map to invalidate size and redraw
      map.invalidateSize();
      
      // Fit bounds with a slight delay to ensure map is ready
      setTimeout(() => {
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 13
        });
        console.log('Map center after fit:', map.getCenter());
      }, 250);
    }
  }, [locations, map]);

  return null;
};

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
    foxy_latitude?: number;
    foxy_longitude?: number;
  };
}

// Get token from environment variable
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

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
    <Modal 
      title="Add Location" 
      open={isVisible} 
      onOk={handleOk} 
      onCancel={onCancel}
      width={800}
    >
      <Spin spinning={loading}>
        {accountId ? (
          <>
            <Select
              style={{ width: '100%', marginBottom: '16px' }}
              placeholder="Select a location"
              onChange={setSelectedLocationId}
              value={selectedLocationId}
            >
              {locations.map((location) => (
                <Select.Option 
                  key={location.foxy_accountlocationid} 
                  value={location.foxy_accountlocationid}
                >
                  {location.foxy_Building.foxy_fulladdress}
                </Select.Option>
              ))}
            </Select>

            <div style={{ height: '400px', width: '100%' }}>
              <MapContainer
                style={{ height: '100%', width: '100%' }}
                center={[43.6532, -79.3832]}
                zoom={11}
                scrollWheelZoom={true}
                maxZoom={19}
                minZoom={2}
              >
                <TileLayer
                  url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`}
                  attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                  maxZoom={19}
                  tileSize={512}
                  zoomOffset={-1}
                />
                <MapBoundsSetter locations={locations} />
                {locations.map((location) => {
                  if (location.foxy_Building.foxy_latitude && location.foxy_Building.foxy_longitude) {
                    return (
                      <Marker
                        key={location.foxy_accountlocationid}
                        position={[
                          location.foxy_Building.foxy_latitude,
                          location.foxy_Building.foxy_longitude
                        ]}
                        eventHandlers={{
                          click: () => setSelectedLocationId(location.foxy_accountlocationid)
                        }}
                      >
                        <Popup>
                          {location.foxy_Building.foxy_fulladdress}
                        </Popup>
                      </Marker>
                    );
                  }
                  return null;
                })}
              </MapContainer>
            </div>
          </>
        ) : (
          <p>Account ID is required to fetch locations.</p>
        )}
      </Spin>
    </Modal>
  );
};

export default AddLocationModal;
