import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for lost pets
const lostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = ({ announcements }) => {
  const [center] = useState([-12.9714, -38.5014]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const lostPets = announcements.filter(a => 
    a.type === 'perdido' &&
    a.latitude && a.longitude && 
    !isNaN(a.latitude) && !isNaN(a.longitude)
  );

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-xl overflow-hidden h-[calc(100vh-200px)] min-h-[600px]">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Mapa de Pets Perdidos em Salvador</h2>
        <div className="flex gap-4 items-center">
          <span className="bg-white/20 px-4 py-2 rounded-full font-semibold backdrop-blur-sm">
            🔴 Perdidos: {lostPets.length}
          </span>
        </div>
      </div>
      
      <div className="flex-grow relative z-10">
        <MapContainer
          center={center}
          zoom={11}
          className="h-full w-full"
          scrollWheelZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
          dragging={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {lostPets.map(announcement => (
            <Marker
              key={announcement.id}
              position={[announcement.latitude, announcement.longitude]}
              icon={lostIcon}
            >
              <Popup 
                maxWidth={320} 
                minWidth={280}
                maxHeight={400}
                className="custom-popup"
                closeButton={true}
                autoClose={false}
                closeOnEscapeKey={true}
              >
                <div className="text-sm leading-tight">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 flex justify-between items-center">
                    <h4 className="text-base font-semibold m-0">{announcement.pet_name}</h4>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                      Perdido
                    </span>
                  </div>
                  
                  {announcement.image_url && (
                    <div className="w-full h-40 overflow-hidden bg-gray-100">
                      <img
                        src={`http://localhost:3000${announcement.image_url}`}
                        alt={announcement.pet_name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="mb-3 flex flex-col gap-1">
                      <strong>Bairro:</strong> {announcement.neighborhood}
                    </div>
                    <div className="mb-3 flex flex-col gap-1">
                      <strong>Descrição:</strong> 
                      <span className="text-gray-600 italic max-h-[60px] overflow-y-auto pr-2">
                        {announcement.description}
                      </span>
                    </div>
                    <div className="mb-3 flex flex-col gap-1">
                      <strong>Contato:</strong> {announcement.user?.name}
                    </div>
                    <div className="mb-3 flex flex-col gap-1">
                      <strong>Telefone:</strong> 
                      <a 
                        href={`tel:${announcement.user?.phone}`} 
                        className="text-indigo-600 font-semibold hover:text-purple-700 hover:underline transition-colors"
                      >
                        {announcement.user?.phone}
                      </a>
                    </div>
                    <div className="flex flex-col gap-1">
                      <strong>Data:</strong> {formatDate(announcement.created_at)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;