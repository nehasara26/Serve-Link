import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DiscoveryMap = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default center (can be user's actual location if requested)
  const defaultCenter = [51.505, -0.09]; 

  useEffect(() => {
    const fetchNearbyOrgs = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch orgs near the default center for demo purposes
        const res = await axios.get(`http://localhost:5000/api/organizations/nearby?lng=${defaultCenter[1]}&lat=${defaultCenter[0]}&radius=100000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrgs(res.data);
      } catch (err) {
        console.error('Failed to fetch orgs for map', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyOrgs();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center text-gray-500">Loading Map Data...</div>;

  return (
    <MapContainer center={defaultCenter} zoom={11} className="h-full w-full rounded-lg z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {orgs.map(org => (
        org.location?.coordinates && (
          <Marker 
            key={org._id} 
            // Leaflet expects [lat, lng], MongoDB stores [lng, lat]
            position={[org.location.coordinates[1], org.location.coordinates[0]]}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-blue-800 text-base">{org.name}</h3>
                <p className="mt-1 text-gray-600">{org.description || 'No description provided.'}</p>
                <a href={`mailto:${org.contactEmail}`} className="text-blue-500 hover:underline mt-2 inline-block">Contact NGO</a>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default DiscoveryMap;
