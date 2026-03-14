import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Hardcoded NGO markers for the Kochi/Ernakulam area
const NGO_MARKERS = [
  {
    id: 'karunalayam',
    name: 'Karunalayam Palliative Care',
    lat: 9.9312,
    lng: 76.2673,
    tags: ['Healthcare', 'Elderly Care', 'Palliative'],
    area: 'Ernakulam'
  },
  {
    id: 'hope_orphanage',
    name: 'Hope Orphanage Trust',
    lat: 9.9816,
    lng: 76.2999,
    tags: ['Child Welfare', 'Education'],
    area: 'Kakkanad'
  },
  {
    id: 'fhc_kakkanad',
    name: 'Family Health Centre Kakkanad',
    lat: 10.0161,
    lng: 76.3397,
    tags: ['Healthcare', 'Medical'],
    area: 'Kakkanad'
  },
  {
    id: 'helping_hands',
    name: 'Helping Hands Foundation',
    lat: 9.9667,
    lng: 76.2800,
    tags: ['Food', 'Shelter', 'Homeless'],
    area: 'Vyttila'
  },
  {
    id: 'care_shelter',
    name: 'Care Shelter NGO',
    lat: 9.9450,
    lng: 76.2450,
    tags: ["Women's Safety", 'Counselling'],
    area: 'Edappally'
  }
];

// Component to re-center map when user location is found
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
};

const DiscoveryMap = () => {
  // Default center: Kochi, Kerala
  const [userLocation, setUserLocation] = useState(null);
  const defaultCenter = [9.9312, 76.2673]; // Ernakulam

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Permission denied or error — stay on Kochi default
          console.info('Geolocation unavailable, using default Kochi center.');
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const mapCenter = userLocation || defaultCenter;

  return (
    <MapContainer center={mapCenter} zoom={12} className="h-full w-full rounded-lg z-0" style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={userLocation} />

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>
            <strong>📍 Your Location</strong>
          </Popup>
        </Marker>
      )}

      {/* Hardcoded NGO Markers */}
      {NGO_MARKERS.map(ngo => (
        <Marker key={ngo.id} position={[ngo.lat, ngo.lng]}>
          <Popup>
            <div style={{ minWidth: '180px' }}>
              <strong style={{ fontSize: '14px', color: '#1e40af' }}>{ngo.name}</strong>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#64748b' }}>📍 {ngo.area}</p>
              <div style={{ marginBottom: '8px' }}>
                {ngo.tags.map(tag => (
                  <span key={tag} style={{
                    display: 'inline-block', background: '#eff6ff', color: '#1e40af',
                    fontSize: '11px', padding: '2px 6px', borderRadius: '10px', marginRight: '4px', marginBottom: '2px'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to="/listings"
                style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}
              >
                View Job Listings →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DiscoveryMap;
