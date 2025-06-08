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

// Custom icon for lost pets only
const lostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = ({ announcements }) => {
  const [center] = useState([-12.9714, -38.5014]); // Salvador centro

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtrar apenas anúncios perdidos com coordenadas válidas
  const lostPets = announcements.filter(a => 
    a.type === 'perdido' &&
    a.latitude && a.longitude && 
    !isNaN(a.latitude) && !isNaN(a.longitude)
  );

  return (
    <div className="map-wrapper">
      <div className="map-header">
        <h2>Mapa de Pets Perdidos em Salvador</h2>
        <div className="map-stats">
          <span className="stat-item">
            🔴 Perdidos: {lostPets.length}
          </span>
        </div>
      </div>
      
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
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
                <div className="popup-content">
                  <div className="popup-header">
                    <h4>{announcement.pet_name}</h4>
                    <span className="pet-type">Perdido</span>
                  </div>
                  
                  {announcement.image_url && (
                    <div className="popup-image">
                      <img
                        src={`http://localhost:3000${announcement.image_url}`}
                        alt={announcement.pet_name}
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="popup-info">
                    <div className="info-row">
                      <strong>Bairro:</strong> {announcement.neighborhood}
                    </div>
                    <div className="info-row">
                      <strong>Descrição:</strong> 
                      <span className="description">{announcement.description}</span>
                    </div>
                    <div className="info-row">
                      <strong>Contato:</strong> {announcement.user?.name}
                    </div>
                    <div className="info-row">
                      <strong>Telefone:</strong> 
                      <a href={`tel:${announcement.user?.phone}`} className="phone-link">
                        {announcement.user?.phone}
                      </a>
                    </div>
                    <div className="info-row">
                      <strong>Data:</strong> {formatDate(announcement.created_at)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style jsx>{`
        .map-wrapper {
          height: calc(100vh - 200px);
          min-height: 600px;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .map-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .map-header h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .map-stats {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .stat-item {
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .map-container {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        :global(.custom-popup .leaflet-popup-content-wrapper) {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
          overflow: hidden !important;
        }

        :global(.custom-popup .leaflet-popup-content) {
          margin: 0 !important;
          padding: 0 !important;
          max-height: 380px !important;
          overflow-y: auto !important;
        }

        :global(.custom-popup .leaflet-popup-tip) {
          background: white !important;
        }

        .popup-content {
          font-size: 14px;
          line-height: 1.4;
        }

        .popup-header {
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .popup-header h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .pet-type {
          background: rgba(255,255,255,0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .popup-image {
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .popup-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .popup-image img:hover {
          transform: scale(1.05);
        }

        .popup-info {
          padding: 1rem;
        }

        .info-row {
          margin-bottom: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-row strong {
          color: #333;
          font-weight: 600;
        }

        .description {
          color: #666;
          font-style: italic;
          max-height: 60px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .phone-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .phone-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* Scrollbar para descrição longa */
        .description::-webkit-scrollbar {
          width: 4px;
        }

        .description::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .description::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .map-wrapper {
            height: calc(100vh - 160px);
            min-height: 500px;
            border-radius: 8px;
          }

          .map-header {
            padding: 1rem;
          }

          .map-header h2 {
            font-size: 1.25rem;
          }

          .stat-item {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }

          :global(.custom-popup .leaflet-popup-content-wrapper) {
            max-width: 280px !important;
          }

          .popup-image {
            height: 140px;
          }

          .popup-info {
            padding: 0.75rem;
          }

          .info-row {
            margin-bottom: 0.6rem;
          }
        }

        @media (max-width: 480px) {
          .map-wrapper {
            height: calc(100vh - 140px);
            min-height: 400px;
          }

          .map-header {
            padding: 0.75rem;
          }

          .map-header h2 {
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
          }

          :global(.custom-popup .leaflet-popup-content-wrapper) {
            max-width: 260px !important;
          }

          .popup-image {
            height: 120px;
          }

          .popup-content {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default Map;