import React from 'react';
import AnnouncementCard from './AnnouncementCard';

const AnnouncementList = ({ 
  announcements, 
  loading, 
  onRefresh, 
  title, 
  showOwnerActions,
  onViewDetail 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando anúncios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600 mt-1">{announcements.length} anúncio(s) encontrado(s)</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Atualizar</span>
        </button>
      </div>

      {/* Announcements Grid */}
      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum anúncio encontrado</h3>
          <p className="text-gray-600">
            {title.includes('Meus') 
              ? 'Você ainda não criou nenhum anúncio.' 
              : 'Seja o primeiro a criar um anúncio!'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              showOwnerActions={showOwnerActions}
              onStatusUpdate={onRefresh}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;
