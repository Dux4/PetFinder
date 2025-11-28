import React, { useState } from 'react';
import { 
  Text, 
  View, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { updateAnnouncementStatus } from '../services/api';

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
    user: {
        id: number;
        name: string;
        phone: string;
    };
    user_id: number;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  showOwnerActions?: boolean;
  onStatusUpdate?: () => void;
  onViewDetail?: (announcement: Announcement) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, 
  showOwnerActions, 
  onStatusUpdate, 
  onViewDetail 
}) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOwner = user && announcement.user_id === user.id;

  const handleStatusUpdate = async (newStatus: 'ativo' | 'encontrado') => {
    if (!isOwner || updating) return;

    setUpdating(true);
    try {
      const response = await updateAnnouncementStatus(announcement.id, newStatus);
      
      if (response && (response.success || response.data || response.announcement)) {
        Alert.alert('Sucesso', 'Status atualizado com sucesso!');
        onStatusUpdate?.();
      } else {
        throw new Error('Resposta inválida da API');
      }

    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      
      let errorMessage = 'Erro ao atualizar status do anúncio';
      const response = error.response;
      if (response?.status === 401) {
        errorMessage = 'Você não tem permissão para atualizar este anúncio';
      } else if (response?.status === 404) {
        errorMessage = 'Anúncio não encontrado';
      } else if (response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetail = () => {
    onViewDetail?.(announcement);
  };

  const formatDate = (dateString: string) => {
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
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-lg overflow-hidden active:opacity-90"
      onPress={handleViewDetail}
      activeOpacity={0.9}
    >
      {/* Imagem */}
      <View className="h-48 relative">
        {announcement.image_data ? (
          <Image
            source={{ uri: announcement.image_data }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-200 justify-center items-center">
            <Ionicons name="paw" size={60} color="#9ca3af" />
            <Text className="text-sm text-gray-500 mt-2">Sem foto</Text>
          </View>
        )}
        
        {/* Status Badge */}
        <View className="absolute top-3 right-3">
          <View className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
            announcement.type === 'perdido' 
              ? 'bg-red-100' 
              : 'bg-green-100'
          }`}>
            <Ionicons 
              name={announcement.type === 'perdido' ? 'search' : 'home'} 
              size={14} 
              color={announcement.type === 'perdido' ? '#b91c1c' : '#15803d'} 
            />
            <Text className={`text-xs font-semibold ${
              announcement.type === 'perdido' 
                ? 'text-red-700' 
                : 'text-green-700'
            }`}>
              {announcement.type === 'perdido' ? 'Perdido' : 'Encontrado'}
            </Text>
          </View>
        </View>
      </View>

      {/* Conteúdo */}
      <View className="p-5">
        {/* Título e Badge de Encontrado */}
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-xl font-bold text-gray-800 flex-1" numberOfLines={1}>
            {announcement.pet_name || 'Nome não informado'}
          </Text>
          {announcement.status === 'encontrado' && (
            <View className="bg-green-100 px-2.5 py-1 rounded-full ml-2 flex-row items-center gap-1">
              <Ionicons name="checkmark-circle" size={14} color="#15803d" />
              <Text className="text-xs font-semibold text-green-700">
                Encontrado
              </Text>
            </View>
          )}
        </View>

        {/* Descrição */}
        <Text className="text-sm text-gray-600 mb-4 leading-5" numberOfLines={3}>
          {announcement.description || 'Sem descrição'}
        </Text>

        {/* Localização */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2">
            {announcement.neighborhood || 'Local não informado'}
          </Text>
        </View>

        {/* Card de Contato */}
        <View className="bg-purple-50 p-3 rounded-xl mb-4 border border-purple-100">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="person" size={14} color="#7c3aed" />
            <Text className="text-sm font-semibold text-gray-800">
              {announcement.user?.name || 'Nome não informado'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="call" size={14} color="#7c3aed" />
            <Text className="text-sm text-gray-600">
              {announcement.user?.phone || 'Telefone não informado'}
            </Text>
          </View>
        </View>

        {/* Data */}
        <View className="flex-row items-center gap-1 mb-4">
          <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
          <Text className="text-xs text-gray-500">
            Publicado em {formatDate(announcement.created_at)}
          </Text>
        </View>

        {/* Ações */}
        <View className="gap-2">
          <TouchableOpacity
            onPress={handleViewDetail}
            className="bg-purple-600 py-3 px-4 rounded-xl border border-purple-700 active:bg-purple-700 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="eye" size={16} color="#fff" />
            <Text className="text-white font-semibold text-center text-sm">
              Ver Detalhes
            </Text>
          </TouchableOpacity>

          {showOwnerActions && isOwner && announcement.status === 'ativo' && (
            <TouchableOpacity
              onPress={() => handleStatusUpdate('encontrado')}
              disabled={updating}
              className={`bg-green-600 py-3 px-4 rounded-xl border border-green-700 active:bg-green-700 flex-row items-center justify-center gap-2 ${
                updating ? 'opacity-50' : ''
              }`}
            >
              {updating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text className="text-white font-semibold text-center text-sm">
                    Marcar como Encontrado
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AnnouncementCard;