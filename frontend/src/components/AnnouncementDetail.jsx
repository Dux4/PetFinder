import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateAnnouncementStatus } from '../services/api';

const AnnouncementDetail = ({ announcement, onBack, onStatusUpdate }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOwner = user && announcement.user_id === user.id;

  const handleStatusUpdate = async (newStatus) => {
    if (!isOwner) return;

    setUpdating(true);
    try {
      await updateAnnouncementStatus(announcement.id, newStatus);
      if (onStatusUpdate) onStatusUpdate();
      onBack();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do anúncio');
    } finally {
      setUpdating(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Voltar</span>
          </button>
          <h1 className="text-3xl font-bold text-white">{announcement.pet_name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              announcement.type === 'perdido' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {announcement.type === 'perdido' ? '🔍 Animal Perdido' : '🏠 Animal Encontrado'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              announcement.status === 'ativo' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {announcement.status === 'ativo' ? 'Ativo' : 'Encontrado'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Image */}
            <div className="space-y-4">
              {announcement.image_url ? (
                <img
                  src={`http://localhost:3000${announcement.image_url}`}
                  alt={announcement.pet_name}
                  className="w-full h-80 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-2">🐾</div>
                    <p>Sem foto disponível</p>
                  </div>
                </div>
              )}

              {/* Location Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">📍</span>
                  Localização
                </h3>
                <p className="text-gray-600">{announcement.neighborhood}, Salvador - BA</p>
                {announcement.latitude && announcement.longitude && (
                  <p className="text-sm text-gray-500 mt-1">
                    Lat: {announcement.latitude}, Lng: {announcement.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações do Pet</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">{announcement.description}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📞</span>
                  Informações de Contato
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nome:</span> {announcement.user?.name}</p>
                  <p><span className="font-medium">Telefone:</span> {announcement.user?.phone}</p>
                  <p><span className="font-medium">Email:</span> {announcement.user?.email}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📅</span>
                  Datas Importantes
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Publicado em:</span> {formatDate(announcement.created_at)}</p>
                  {announcement.status === 'encontrado' && announcement.found_date && (
                    <p className="text-green-600">
                      <span className="font-medium">✅ Encontrado em:</span> {formatDate(announcement.found_date)}
                    </p>
                  )}
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && announcement.status === 'ativo' && (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Gerenciar Anúncio</h3>
                  <p className="text-gray-600 mb-4">
                    Encontrou seu pet? Marque este anúncio como encontrado para que ele saia da lista de busca.
                  </p>
                  <button
                    onClick={() => handleStatusUpdate('encontrado')}
                    disabled={updating}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Atualizando...' : '✅ Marcar como Encontrado'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;