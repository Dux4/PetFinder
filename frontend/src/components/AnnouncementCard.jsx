import React from 'react';

const AnnouncementCard = ({ announcement }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card announcement-card">
      {announcement.image_url && (
        <img
          src={`http://localhost:3000${announcement.image_url}`}
          alt={announcement.pet_name}
          className="announcement-image"
        />
      )}
      
      <div className="announcement-content">
        <h3>{announcement.pet_name}</h3>
        <span className={`announcement-type ${announcement.type}`}>
          {announcement.type === 'perdido' ? '🔍 Animal Perdido' : '🏠 Animal Encontrado'}
        </span>
        
        <p><strong>Descrição:</strong> {announcement.description}</p>
        
        {announcement.address && (
          <p><strong>Local:</strong> {announcement.address}</p>
        )}
        
        <div style={{ margin: '1rem 0' }}>
          <p><strong>Contato:</strong> {announcement.contact_name}</p>
          <p><strong>Telefone:</strong> {announcement.contact_phone}</p>
          <p><strong>Email:</strong> {announcement.contact_email}</p>
        </div>
        
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Publicado em {formatDate(announcement.created_at)}
        </p>
        
        {announcement.distance_km && (
          <p style={{ color: '#667eea', fontWeight: '600' }}>
            📍 {announcement.distance_km.toFixed(2)} km de distância
          </p>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;