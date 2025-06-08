import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types
const lostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const foundIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = ({ announcements }) => {
  const [center] = useState([-12.9714, -38.5014]); // Salvador, BA como padrão

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <h2>Mapa de Animais Perdidos e Encontrados</h2>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ marginRight: '2rem' }}>
          🔴 Perdidos: {announcements.filter(a => a.type === 'perdido').length}
        </span>
        <span>
          🟢 Encontrados: {announcements.filter(a => a.type === 'encontrado').length}
        </span>
      </div>
      
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {announcements.map(announcement => (
            announcement.latitude && announcement.longitude && (
              <Marker
                key={announcement.id}
                position={[announcement.latitude, announcement.longitude]}
                icon={announcement.type === 'perdido' ? lostIcon : foundIcon}
              >
                <Popup>
                  <div style={{ maxWidth: '200px' }}>
                    <h4>{announcement.pet_name}</h4>
                    <p><strong>Tipo:</strong> {announcement.type === 'perdido' ? 'Perdido' : 'Encontrado'}</p>
                    <p><strong>Descrição:</strong> {announcement.description}</p>
                    {announcement.address && (
                      <p><strong>Local:</strong> {announcement.address}</p>
                    )}
                    <p><strong>Contato:</strong> {announcement.contact_name}</p>
                    <p><strong>Telefone:</strong> {announcement.contact_phone}</p>
                    <p><strong>Data:</strong> {formatDate(announcement.created_at)}</p>
                    
                    {announcement.image_url && (
                      <img
                        src={`http://localhost:3000${announcement.image_url}`}
                        alt={announcement.pet_name}
                        style={{ width: '100%', marginTop: '0.5rem', borderRadius: '4px' }}
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;