import React, { useState, useEffect } from 'react';
import { 
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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { updateAnnouncementStatus, getComments, createComment } from '../services/api';

interface Announcement {
    id: number;
    title: string;
    image_data?: string;
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
        setLoadingComments(true);
        const commentsData = await getComments(announcement.id);
        setComments(commentsData || []);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        Alert.alert('Erro', 'Não foi possível carregar os comentários');
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    if (announcement.id) {
      loadComments();
    }
  }, [announcement.id]);

  const handleStatusUpdate = async (newStatus: 'ativo' | 'encontrado') => {
    if (!isOwner || updating) return;

    setUpdating(true);
    try {
      await updateAnnouncementStatus(announcement.id, newStatus);
      Alert.alert('Sucesso', 'Status do anúncio atualizado com sucesso');
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
    if (!newComment.trim() || !user || submittingComment) return;

    setSubmittingComment(true);
    try {
      const response = await createComment(announcement.id, newComment.trim());
      
      if (response && response.comment) {
        setComments(prevComments => [...prevComments, response.comment]);
        setNewComment('');
        Alert.alert('Sucesso', 'Comentário enviado com sucesso');
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      
      let errorMessage = 'Erro ao enviar comentário';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      Alert.alert('Erro', errorMessage);
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
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'agora';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header com Gradiente */}
      <LinearGradient
        colors={['#7c3aed', '#6d28d9', '#5b21b6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-12 pb-6"
      >
        <TouchableOpacity 
          onPress={onBack} 
          className="flex-row items-center gap-2 mb-4"
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
          <Text className="text-white/90 text-base">Voltar</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-white mb-3">
          {announcement.pet_name}
        </Text>

        <View className="flex-row gap-2 flex-wrap">
          <View className={`px-3 py-1.5 rounded-full ${
            announcement.type === 'perdido' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <Text className={`text-xs font-semibold ${
              announcement.type === 'perdido' ? 'text-red-700' : 'text-green-700'
            }`}>
              {announcement.type === 'perdido' ? '🔍 Perdido' : '🏠 Encontrado'}
            </Text>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${
            announcement.status === 'ativo' ? 'bg-blue-100' : 'bg-gray-200'
          }`}>
            <Text className={`text-xs font-semibold ${
              announcement.status === 'ativo' ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {announcement.status === 'ativo' ? 'Ativo' : 'Encontrado'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Conteúdo */}
      <View className="p-4 -mt-4">
        <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <View className="p-6">
            {/* Imagem */}
            <View className="mb-6">
              {announcement.image_data ? (
                <Image
                  source={{ uri: announcement.image_data }} 
                  className="w-full h-80 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-80 bg-gray-200 rounded-xl justify-center items-center">
                  <Text className="text-6xl mb-2 opacity-40">🐾</Text>
                  <Text className="text-gray-500">Sem foto disponível</Text>
                </View>
              )}

              {/* Card de Localização */}
              <View className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100">
                <Text className="font-semibold text-gray-800 mb-2">
                  📍 Localização
                </Text>
                <Text className="text-gray-600">
                  {announcement.neighborhood}, Salvador - BA
                </Text>
                {announcement.latitude && announcement.longitude && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Lat: {announcement.latitude}, Lng: {announcement.longitude}
                  </Text>
                )}
              </View>
            </View>

            {/* Informações do Pet */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-3">
                Informações do Pet
              </Text>
              <Text className="text-gray-600 leading-6">
                {announcement.description}
              </Text>
            </View>

            {/* Card de Contato */}
            <View className="bg-purple-50 p-5 rounded-xl mb-6 border border-purple-100">
              <Text className="font-semibold text-gray-800 mb-4">
                📞 Informações de Contato
              </Text>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Feather name="user" size={16} color="#7c3aed" />
                  <Text className="text-gray-600">
                    <Text className="font-medium text-gray-800">Nome:</Text> {announcement.user?.name}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Feather name="phone" size={16} color="#7c3aed" />
                  <Text className="text-gray-600">
                    <Text className="font-medium text-gray-800">Telefone:</Text> {announcement.user?.phone}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Feather name="mail" size={16} color="#7c3aed" />
                  <Text className="text-gray-600">
                    <Text className="font-medium text-gray-800">Email:</Text> {announcement.user?.email}
                  </Text>
                </View>
              </View>
            </View>

            {/* Card de Datas */}
            <View className="bg-gray-50 p-5 rounded-xl mb-6">
              <Text className="font-semibold text-gray-800 mb-4">
                📅 Datas Importantes
              </Text>
              <View className="gap-2">
                <Text className="text-gray-600">
                  <Text className="font-medium text-gray-800">Publicado em:</Text>{' '}
                  {formatDate(announcement.created_at)}
                </Text>
                {announcement.status === 'encontrado' && announcement.found_date && (
                  <Text className="text-green-600">
                    <Text className="font-medium">✅ Encontrado em:</Text>{' '}
                    {formatDate(announcement.found_date)}
                  </Text>
                )}
              </View>
            </View>

            {/* Ações do Proprietário */}
            {isOwner && announcement.status === 'ativo' && (
              <View className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                <Text className="font-semibold text-gray-800 mb-3">
                  Gerenciar Anúncio
                </Text>
                <Text className="text-gray-600 mb-4">
                  Encontrou seu pet? Marque este anúncio como encontrado para que ele saia da lista de busca.
                </Text>
                <TouchableOpacity
                  onPress={() => handleStatusUpdate('encontrado')}
                  disabled={updating}
                  className={`bg-green-600 py-4 rounded-xl items-center ${
                    updating ? 'opacity-50' : 'active:bg-green-700'
                  }`}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">
                      ✅ Marcar como Encontrado
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Seção de Comentários */}
        <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-6">
            💬 Comentários ({comments.length})
          </Text>

          {/* Formulário de Comentário */}
          {user ? (
            <View className="mb-6">
              <View className="flex-row gap-3 mb-3">
                <View className="w-10 h-10 bg-purple-600 rounded-full justify-center items-center">
                  <Text className="text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <TextInput
                    className="w-full p-3 border border-gray-300 rounded-xl h-24 bg-gray-50"
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    editable={!submittingComment}
                    textAlignVertical="top"
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleCommentSubmit}
                disabled={!newComment.trim() || submittingComment}
                className={`bg-purple-600 py-3 px-5 rounded-xl self-end ${
                  (!newComment.trim() || submittingComment) ? 'opacity-50' : 'active:bg-purple-700'
                }`}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-medium">Comentar</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mb-6 p-4 bg-gray-50 rounded-xl items-center">
              <Text className="text-gray-600">Faça login para comentar</Text>
            </View>
          )}

          {/* Lista de Comentários */}
          <View className="gap-4">
            {loadingComments ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#7c3aed" />
                <Text className="text-gray-500 mt-2">Carregando comentários...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-4xl mb-2 opacity-40">💬</Text>
                <Text className="text-gray-600 font-medium">Nenhum comentário ainda</Text>
                <Text className="text-gray-400 text-xs mt-1">Seja o primeiro a comentar!</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} className="flex-row gap-3">
                  <View className={`w-10 h-10 rounded-full justify-center items-center ${
                    comment.user_id === announcement.user_id ? 'bg-amber-500' : 'bg-gray-400'
                  }`}>
                    <Text className="text-white font-medium text-sm">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className={`p-4 rounded-xl ${
                      comment.user_id === announcement.user_id 
                        ? 'bg-amber-50 border border-amber-200' 
                        : 'bg-gray-50'
                    }`}>
                      <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-medium text-gray-800">
                            {comment.user.name}
                          </Text>
                          {comment.user_id === announcement.user_id && (
                            <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                              <Text className="text-amber-800 text-xs font-medium">
                                👑 Autor
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-gray-500">
                          {formatCommentDate(comment.created_at)}
                        </Text>
                      </View>
                      <Text className="text-gray-600 leading-5">
                        {comment.content}
                      </Text>
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

export default AnnouncementDetail;