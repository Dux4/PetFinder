import React from 'react';
import AnnouncementCard from './AnnouncementCard';

const AnnouncementList = ({ announcements, loading, onRefresh }) => {
  if (loading) {
    return <div className="loading">Carregando anúncios...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Anúncios Recentes ({announcements.length})</h2>
        <button onClick={onRefresh} className="btn">
          🔄 Atualizar
        </button>
      </div>
      
      {announcements.length === 0 ? (
        <div className="card">
          <p>Nenhum anúncio encontrado. Seja o primeiro a criar um!</p>
        </div>
      ) : (
        announcements.map(announcement => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))
      )}
    </div>
  );
};

export default AnnouncementList;