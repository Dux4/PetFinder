import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateAnnouncementStatus } from '../services/api';

const AnnouncementCard = ({ announcement, showOwnerActions, onStatusUpdate, onViewDetail }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOwner = user && announcement.user_id === user.id;

  const handleStatusUpdate = async (newStatus, e) => {
    e.stopPropagation();
    if (!isOwner) return;

    setUpdating(true);
    try {
      const response = await updateAnnouncementStatus(announcement.id, newStatus);
      
      if (response && (response.success || response.data)) {
        announcement.status = newStatus;
        onStatusUpdate?.();
        alert('Status atualizado com sucesso!');
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      let errorMessage = 'Erro ao atualizar status do anúncio';
      if (error.response?.status === 401) {
        errorMessage = 'Você não tem permissão para atualizar este anúncio';
      } else if (error.response?.status === 404) {
        errorMessage = 'Anúncio não encontrado';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde';
      }
      
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetail = (e) => {
    e.stopPropagation();
    onViewDetail?.(announcement);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
         onClick={handleViewDetail}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {announcement.image_url ? (
          <img
            src={`http://localhost:3000${announcement.image_url}`}
            alt={announcement.pet_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback quando não há imagem */}
        <div className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${announcement.image_url ? 'hidden' : ''}`}>
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🐾</div>
            <p className="text-sm">Sem foto</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            announcement.type === 'perdido' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {announcement.type === 'perdido' ? '🔍 Perdido' : '🏠 Encontrado'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 truncate">{announcement.pet_name || 'Nome não informado'}</h3>
          {announcement.status === 'encontrado' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium ml-2">
              ✅ Encontrado
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{announcement.description || 'Sem descrição'}</p>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{announcement.neighborhood || 'Local não informado'}</span>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-medium text-gray-800">{announcement.user?.name || 'Nome não informado'}</p>
          <p className="text-sm text-gray-600">{announcement.user?.phone || 'Telefone não informado'}</p>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-500 mb-4">
          Publicado em {formatDate(announcement.created_at)}
        </p>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleViewDetail}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium border border-blue-700 hover:border-blue-800"
          >
            Ver Detalhes
          </button>

          {showOwnerActions && isOwner && announcement.status === 'ativo' && (
            <button
              onClick={(e) => handleStatusUpdate('encontrado', e)}
              disabled={updating}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-green-600 hover:border-green-700"
            >
              {updating ? 'Atualizando...' : '✅ Marcar como Encontrado'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;