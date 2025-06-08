import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateAnnouncementStatus } from '../services/api';

const AnnouncementCard = ({ announcement, showOwnerActions, onStatusUpdate }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOwner = user && announcement.user_id === user.id;

  const handleStatusUpdate = async (newStatus) => {
    if (!isOwner) return;

    setUpdating(true);
    try {
      await updateAnnouncementStatus(announcement.id, newStatus);
      if (onStatusUpdate) onStatusUpdate();
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
    <div className="announcement-card">
      {announcement.image_url && (
        <div className="announcement-image-container">
          <img
            src={`http://localhost:3000${announcement.image_url}`}
            alt={announcement.pet_name}
            className="announcement-image"
          />
        </div>
      )}
      
      <div className="announcement-content">
        <div className="announcement-header">
          <h3>{announcement.pet_name}</h3>
          <span className={`announcement-type ${announcement.type}`}>
            {announcement.type === 'perdido' ? '🔍 Perdido' : '🏠 Encontrado'}
          </span>
        </div>
        
        <p className="announcement-description">{announcement.description}</p>
        
        <div className="announcement-location">
          <strong>📍 Bairro:</strong> {announcement.neighborhood}, Salvador - BA
        </div>
        
        <div className="announcement-contact">
          <p><strong>Contato:</strong> {announcement.user?.name}</p>
          <p><strong>Telefone:</strong> {announcement.user?.phone}</p>
          <p><strong>Email:</strong> {announcement.user?.email}</p>
        </div>
        
        <div className="announcement-footer">
          <p className="announcement-date">
            Publicado em {formatDate(announcement.created_at)}
          </p>
          
          {announcement.status === 'encontrado' && announcement.found_date && (
            <p className="found-date">
              ✅ Encontrado em {formatDate(announcement.found_date)}
            </p>
          )}
        </div>

        {showOwnerActions && isOwner && announcement.status === 'ativo' && (
          <div className="owner-actions">
            <button
              onClick={() => handleStatusUpdate('encontrado')}
              disabled={updating}
              className="btn btn-found"
            >
              {updating ? 'Atualizando...' : '✅ Marcar como Encontrado'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .announcement-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .announcement-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        .announcement-image-container {
          width: 200px;
          height: 200px;
          flex-shrink: 0;
        }

        .announcement-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .announcement-content {
          min-width: 0;
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .announcement-header h3 {
          color: #667eea;
          margin: 0;
          font-size: 1.4rem;
        }

        .announcement-type {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .announcement-type.perdido {
          background: #fee2e2;
          color: #dc2626;
        }

        .announcement-type.encontrado {
          background: #dcfce7;
          color: #16a34a;
        }

        .announcement-description {
          margin: 1rem 0;
          line-height: 1.6;
          color: #555;
        }

        .announcement-location {
          margin: 1rem 0;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          color: #555;
        }

        .announcement-contact {
          margin: 1rem 0;
          padding: 1rem;
          background: #f0f9ff;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .announcement-contact p {
          margin: 0.25rem 0;
          color: #374151;
        }

        .announcement-footer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .announcement-date {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .found-date {
          color: #16a34a;
          font-weight: 600;
          margin: 0.5rem 0 0 0;
          font-size: 0.9rem;
        }

        .owner-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px dashed #e5e7eb;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-found {
          background: #16a34a;
          color: white;
          width: 100%;
        }

        .btn-found:hover:not(:disabled) {
          background: #15803d;
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .announcement-card {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .announcement-image-container {
            width: 100%;
            height: 250px;
            justify-self: center;
          }

          .announcement-header {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementCard;