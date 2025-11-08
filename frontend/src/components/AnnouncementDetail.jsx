import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateAnnouncementStatus, getComments, createComment } from '../services/api';

const AnnouncementDetail = ({ announcement, onBack, onStatusUpdate }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const isOwner = user && announcement.user_id === user.id;

  // Carregar comentários
  useEffect(() => {
    const loadComments = async () => {
      try {
        const commentsData = await getComments(announcement.id);
        setComments(commentsData);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [announcement.id]);

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);
    try {
      const response = await createComment(announcement.id, newComment.trim());
      setComments([...comments, response.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      alert('Erro ao enviar comentário');
    } finally {
      setSubmittingComment(false);
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

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              {announcement.image_data ? (
                <img
                  src={announcement.image_data}
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

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações do Pet</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">{announcement.description}</p>
                </div>
              </div>

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

          <div className="border-t border-gray-200 p-8">
            <div className="max-w-3xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">💬</span>
                Comentários ({comments.length})
              </h3>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicione um comentário..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        disabled={submittingComment}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || submittingComment}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {submittingComment ? 'Enviando...' : 'Comentar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">Faça login para comentar</p>
                </div>
              )}

              <div className="space-y-4">
                {loadingComments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando comentários...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-gray-500">Nenhum comentário ainda</p>
                    <p className="text-gray-400 text-sm">Seja o primeiro a comentar!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          comment.user_id === announcement.user_id 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-400'
                        }`}>
                          <span className="text-white font-medium text-sm">
                            {comment.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className={`p-4 rounded-lg ${
                          comment.user_id === announcement.user_id 
                            ? 'bg-yellow-50 border border-yellow-200' 
                            : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800">
                                {comment.user.name}
                              </span>
                              {comment.user_id === announcement.user_id && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                  👑 Autor
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatCommentDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;