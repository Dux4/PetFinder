import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
// Importe seus serviços de API.
// import { updateAnnouncementStatus, getComments, createComment } from '../services/api';

interface Announcement {
    id: number;
    title: string;
    image_url?: string;
    type: 'perdido' | 'encontrado';
    status: 'ativo' | 'encontrado';
    pet_name: string;
    description?: string;
    neighborhood?: string;
    created_at: string;
    found_date?: string;
    latitude?: number;
    longitude?: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    user_id: number;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    user: {
        id: number;
        name: string;
    };
}

interface AnnouncementDetailProps {
    announcement: Announcement;
    onBack: () => void;
    onStatusUpdate: () => void;
}

const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ announcement, onBack, onStatusUpdate }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const isOwner = user && announcement.user_id === user.id;

  useEffect(() => {
    const loadComments = async () => {
      try {
        // const commentsData = await getComments(announcement.id);
        // setComments(commentsData);
        setComments([
          { id: 1, content: 'Que triste, espero que encontre!', created_at: new Date().toISOString(), user_id: 1, user: { id: 1, name: 'João' } },
          { id: 2, content: 'Já procurei por perto', created_at: new Date(Date.now() - 3600000).toISOString(), user_id: 2, user: { id: 2, name: 'Ana' } },
        ]);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [announcement.id]);

  const handleStatusUpdate = async (newStatus: 'ativo' | 'encontrado') => {
    if (!isOwner || updating) return;

    setUpdating(true);
    try {
      // await updateAnnouncementStatus(announcement.id, newStatus);
      onStatusUpdate();
      onBack();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Erro ao atualizar status do anúncio');
    } finally {
      setUpdating(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);
    try {
      // const response = await createComment(announcement.id, newComment.trim());
      // setComments([...comments, response.comment]);
      
      const newCommentData = {
        id: Math.random(),
        content: newComment.trim(),
        created_at: new Date().toISOString(),
        user_id: user.id,
        user: {
          id: user.id,
          name: user.name,
        }
      };
      setComments([...comments, newCommentData]);
      setNewComment('');

    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      Alert.alert('Erro', 'Erro ao enviar comentário');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{announcement.pet_name}</Text>
        <View style={styles.badgeContainer}>
          <Text style={[styles.badge, announcement.type === 'perdido' ? styles.badgeRed : styles.badgeGreen]}>
            {announcement.type === 'perdido' ? '🔍 Perdido' : '🏠 Encontrado'}
          </Text>
          <Text style={[styles.badge, announcement.status === 'ativo' ? styles.badgeBlue : styles.badgeGray]}>
            {announcement.status === 'ativo' ? 'Ativo' : 'Encontrado'}
          </Text>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.cardScroll}>
            {/* Imagem */}
            <View style={styles.imageWrapper}>
              {announcement.image_url ? (
                <Image
                  source={{ uri: `http://localhost:3000${announcement.image_url}` }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.noImagePlaceholder}>
                  <Text style={styles.noImageEmoji}>🐾</Text>
                  <Text>Sem foto disponível</Text>
                </View>
              )}
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>📍 Localização</Text>
                <Text style={styles.locationText}>{announcement.neighborhood}, Salvador - BA</Text>
                {announcement.latitude && announcement.longitude && (
                  <Text style={styles.coordsText}>
                    Lat: {announcement.latitude}, Lng: {announcement.longitude}
                  </Text>
                )}
              </View>
            </View>

            {/* Detalhes */}
            <View style={styles.detailsWrapper}>
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Informações do Pet</Text>
                <Text style={styles.descriptionText}>{announcement.description}</Text>
              </View>

              {/* Informações de Contato */}
              <View style={styles.detailsCard}>
                <Text style={styles.contactTitle}>📞 Informações de Contato</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactText}><Text style={styles.contactLabel}>Nome:</Text> {announcement.user?.name}</Text>
                  <Text style={styles.contactText}><Text style={styles.contactLabel}>Telefone:</Text> {announcement.user?.phone}</Text>
                  <Text style={styles.contactText}><Text style={styles.contactLabel}>Email:</Text> {announcement.user?.email}</Text>
                </View>
              </View>

              {/* Datas */}
              <View style={styles.detailsCard}>
                <Text style={styles.contactTitle}>📅 Datas Importantes</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactText}>
                    <Text style={styles.contactLabel}>Publicado em:</Text> {formatDate(announcement.created_at)}
                  </Text>
                  {announcement.status === 'encontrado' && announcement.found_date && (
                    <Text style={styles.contactTextGreen}>
                      <Text style={styles.contactLabel}>✅ Encontrado em:</Text> {formatDate(announcement.found_date)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Ações do Proprietário */}
              {isOwner && announcement.status === 'ativo' && (
                <View style={styles.ownerActionsCard}>
                  <Text style={styles.ownerActionsTitle}>Gerenciar Anúncio</Text>
                  <Text style={styles.ownerActionsText}>
                    Encontrou seu pet? Marque este anúncio como encontrado para que ele saia da lista de busca.
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleStatusUpdate('encontrado')}
                    disabled={updating}
                    style={[styles.statusButton, updating && styles.statusButtonDisabled]}
                  >
                    {updating ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.statusButtonText}>✅ Marcar como Encontrado</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Seção de Comentários */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>💬 Comentários ({comments.length})</Text>

          {/* Formulário de Comentário */}
          {user ? (
            <View style={styles.commentForm}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  editable={!submittingComment}
                />
                <TouchableOpacity
                  onPress={handleCommentSubmit}
                  disabled={!newComment.trim() || submittingComment}
                  style={[styles.commentButton, (!newComment.trim() || submittingComment) && styles.commentButtonDisabled]}
                >
                  <Text style={styles.commentButtonText}>
                    {submittingComment ? 'Enviando...' : 'Comentar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.loginMessage}>
              <Text style={styles.loginMessageText}>Faça login para comentar</Text>
            </View>
          )}

          {/* Lista de Comentários */}
          <View style={styles.commentsList}>
            {loadingComments ? (
              <View style={styles.commentsLoading}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.commentsLoadingText}>Carregando comentários...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.commentsLoading}>
                <Text style={styles.noCommentsEmoji}>💬</Text>
                <Text style={styles.noCommentsText}>Nenhum comentário ainda</Text>
                <Text style={styles.noCommentsSubText}>Seja o primeiro a comentar!</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentItemAvatarWrapper}>
                    <View style={[styles.commentAvatar, comment.user_id === announcement.user_id ? styles.commentOwnerAvatar : styles.commentUserAvatar]}>
                      <Text style={styles.commentAvatarText}>
                        {comment.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.commentContentWrapper}>
                    <View style={[styles.commentBubble, comment.user_id === announcement.user_id ? styles.commentOwnerBubble : styles.commentUserBubble]}>
                      <View style={styles.commentHeader}>
                        <View style={styles.commentAuthorWrapper}>
                          <Text style={styles.commentAuthorText}>
                            {comment.user.name}
                          </Text>
                          {comment.user_id === announcement.user_id && (
                            <Text style={styles.commentOwnerBadge}>👑 Autor</Text>
                          )}
                        </View>
                        <Text style={styles.commentDateText}>
                          {formatCommentDate(comment.created_at)}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4F46E5', // Cor sólida para o gradiente
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: '500',
  },
  badgeRed: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  badgeBlue: {
    backgroundColor: '#DBEAFE',
    color: '#3B82F6',
  },
  badgeGray: {
    backgroundColor: '#E5E7EB',
    color: '#4B5563',
  },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 32,
  },
  cardScroll: {
    padding: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
  },
  imageWrapper: {
    flex: 1,
    height: 320,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageEmoji: {
    fontSize: 64,
    marginBottom: 8,
    color: '#9CA3AF',
  },
  locationInfo: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  locationTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationText: {
    color: '#4B5563',
  },
  coordsText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  detailsWrapper: {
    flex: 1,
    gap: 24,
  },
  detailsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  descriptionText: {
    color: '#4B5563',
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 8,
  },
  contactTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactInfo: {
    gap: 8,
  },
  contactText: {
    color: '#4B5563',
  },
  contactLabel: {
    fontWeight: '500',
  },
  contactTextGreen: {
    color: '#16A34A',
  },
  ownerActionsCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    padding: 24,
    borderRadius: 8,
  },
  ownerActionsTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  ownerActionsText: {
    color: '#4B5563',
    marginBottom: 16,
  },
  statusButton: {
    width: '100%',
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  statusButtonDisabled: {
    opacity: 0.5,
  },
  commentsSection: {
    paddingVertical: 32,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  commentForm: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  commentInputWrapper: {
    flex: 1,
    gap: 8,
  },
  commentInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    height: 96,
    textAlignVertical: 'top',
  },
  commentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  commentButtonDisabled: {
    opacity: 0.5,
  },
  loginMessage: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
  },
  loginMessageText: {
    color: '#4B5563',
  },
  commentsList: {
    gap: 16,
  },
  commentsLoading: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  commentsLoadingText: {
    color: '#6B7280',
    marginTop: 8,
  },
  noCommentsEmoji: {
    fontSize: 32,
    marginBottom: 8,
    color: '#9CA3AF',
  },
  noCommentsText: {
    color: '#6B7280',
  },
  noCommentsSubText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 16,
  },
  commentItemAvatarWrapper: {
    flexShrink: 0,
  },
  commentOwnerAvatar: {
    backgroundColor: '#F59E0B',
  },
  commentUserAvatar: {
    backgroundColor: '#9CA3AF',
  },
  commentContentWrapper: {
    flex: 1,
  },
  commentBubble: {
    padding: 16,
    borderRadius: 8,
  },
  commentOwnerBubble: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
  },
  commentUserBubble: {
    backgroundColor: '#F9FAFB',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthorText: {
    fontWeight: '500',
    color: '#1F2937',
  },
  commentOwnerBadge: {
    backgroundColor: '#FFFBEB',
    color: '#92400E',
    fontSize: 10,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: '500',
  },
  commentDateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentText: {
    color: '#4B5563',
    lineHeight: 20,
  },
});

export default AnnouncementDetail;