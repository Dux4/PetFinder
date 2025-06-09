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

// Custom icon for found pets
const foundIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = ({ announcements }) => {
  const [center] = useState([-12.9714, -38.5014]); // Centro de Salvador

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filtrar anúncios com coordenadas válidas
  const validAnnouncements = announcements.filter(a => 
    a.latitude && a.longitude && 
    !isNaN(parseFloat(a.latitude)) && !isNaN(parseFloat(a.longitude)) &&
    parseFloat(a.latitude) !== 0 && parseFloat(a.longitude) !== 0
  );

  const lostPets = validAnnouncements.filter(a => a.type === 'perdido');
  const foundPets = validAnnouncements.filter(a => a.type === 'encontrado');

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-xl overflow-hidden h-[calc(100vh-200px)] min-h-[600px]">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Mapa de Pets em Salvador</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="bg-red-500/20 px-4 py-2 rounded-full font-semibold backdrop-blur-sm border border-red-300/30">
            🔴 Perdidos: {lostPets.length}
          </span>
          <span className="bg-green-500/20 px-4 py-2 rounded-full font-semibold backdrop-blur-sm border border-green-300/30">
            🟢 Encontrados: {foundPets.length}
          </span>
          <span className="bg-white/20 px-4 py-2 rounded-full font-semibold backdrop-blur-sm">
            📍 Total: {validAnnouncements.length}
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
          
          {validAnnouncements.map(announcement => (
            <Marker
              key={announcement.id}
              position={[parseFloat(announcement.latitude), parseFloat(announcement.longitude)]}
              icon={announcement.type === 'perdido' ? lostIcon : foundIcon}
            >
              <Popup 
                maxWidth={320} 
                minWidth={280}
                maxHeight={450}
                className="custom-popup"
                closeButton={true}
                autoClose={false}
                closeOnEscapeKey={true}
              >
                <div className="text-sm leading-tight">
                  <div className={`${
                    announcement.type === 'perdido' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  } text-white p-4 flex justify-between items-center`}>
                    <h4 className="text-base font-semibold m-0">{announcement.pet_name}</h4>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                      {announcement.type === 'perdido' ? 'Perdido' : 'Encontrado'}
                    </span>
                  </div>
                  
                  {announcement.image_url && (
                    <div className="w-full h-40 overflow-hidden bg-gray-100">
                      <img
                        src={`http://localhost:3000${announcement.image_url}`}
                        alt={announcement.pet_name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-4 space-y-3">
                    <div className="flex flex-col gap-1">
                      <strong className="text-gray-700">Bairro:</strong> 
                      <span className="text-gray-600">{announcement.neighborhood}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <strong className="text-gray-700">Descrição:</strong> 
                      <div className="text-gray-600 italic max-h-[80px] overflow-y-auto pr-2 text-xs leading-relaxed">
                        {announcement.description}
                      </div>
                    </div>
                    
                    {announcement.user && (
                      <>
                        <div className="flex flex-col gap-1">
                          <strong className="text-gray-700">Contato:</strong> 
                          <span className="text-gray-600">{announcement.user.name}</span>
                        </div>
                        
                        {announcement.user.phone && (
                          <div className="flex flex-col gap-1">
                            <strong className="text-gray-700">Telefone:</strong> 
                            <a 
                              href={`tel:${announcement.user.phone}`} 
                              className="text-indigo-600 font-semibold hover:text-purple-700 hover:underline transition-colors"
                            >
                              {announcement.user.phone}
                            </a>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex flex-col gap-1">
                      <strong className="text-gray-700">Data:</strong> 
                      <span className="text-gray-600">{formatDate(announcement.created_at)}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <strong className="text-gray-700">Coordenadas:</strong> 
                      <span className="text-xs text-gray-500 font-mono">
                        {parseFloat(announcement.latitude).toFixed(6)}, {parseFloat(announcement.longitude).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {validAnnouncements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-20">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum pet localizado</h3>
            <p className="text-gray-500">
              Quando houver anúncios com localização, eles aparecerão aqui no mapa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;