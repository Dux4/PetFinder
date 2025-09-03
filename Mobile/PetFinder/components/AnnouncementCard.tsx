import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
// Importe seu serviço de API.
// import { updateAnnouncementStatus } from '../services/api';

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

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, showOwnerActions, onStatusUpdate, onViewDetail }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOwner = user && announcement.user_id === user.id;

  const handleStatusUpdate = async (newStatus: 'ativo' | 'encontrado') => {
    if (!isOwner || updating) return;

    setUpdating(true);
    try {
      // Sua lógica de API para atualizar o status
      // const response = await updateAnnouncementStatus(announcement.id, newStatus);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Sucesso', 'Status atualizado com sucesso!');
      onStatusUpdate?.();

    } catch (error: any) { // Type as 'any'
      console.error('Erro ao atualizar status:', error);
      let errorMessage = 'Erro ao atualizar status do anúncio';
      const response = error.response;
      if (response?.status === 401) {
        errorMessage = 'Você não tem permissão para atualizar este anúncio';
      } else if (response?.status === 404) {
        errorMessage = 'Anúncio não encontrado';
      } else if (response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde';
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
      style={styles.card}
      onPress={handleViewDetail}
    >
      {/* Imagem */}
      <View style={styles.imageContainer}>
        {announcement.image_url ? (
          <Image
            source={{ uri: `http://localhost:3000${announcement.image_url}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageEmoji}>🐾</Text>
            <Text style={styles.noImageText}>Sem foto</Text>
          </View>
        )}
        
        {/* Status Badge */}
        <View style={styles.statusBadgeContainer}>
          <Text style={[styles.statusBadge, announcement.type === 'perdido' ? styles.statusBadgeRed : styles.statusBadgeGreen]}>
            {announcement.type === 'perdido' ? '🔍 Perdido' : '🏠 Encontrado'}
          </Text>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {announcement.pet_name || 'Nome não informado'}
          </Text>
          {announcement.status === 'encontrado' && (
            <Text style={styles.foundBadge}>
              ✅ Encontrado
            </Text>
          )}
        </View>

        <Text style={styles.descriptionText} numberOfLines={3}>
          {announcement.description || 'Sem descrição'}
        </Text>

        {/* Localização */}
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={16} color="#4B5563" />
          <Text style={styles.infoText}>{announcement.neighborhood || 'Local não informado'}</Text>
        </View>

        {/* Contato */}
        <View style={styles.contactCard}>
          <Text style={styles.contactName}>{announcement.user?.name || 'Nome não informado'}</Text>
          <Text style={styles.contactPhone}>{announcement.user?.phone || 'Telefone não informado'}</Text>
        </View>

        {/* Data */}
        <Text style={styles.dateText}>
          Publicado em {formatDate(announcement.created_at)}
        </Text>

        {/* Ações */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleViewDetail}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
          </TouchableOpacity>

          {showOwnerActions && isOwner && announcement.status === 'ativo' && (
            <TouchableOpacity
              onPress={() => handleStatusUpdate('encontrado')}
              disabled={updating}
              style={[styles.statusButton, updating && styles.disabledButton]}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.statusButtonText}>✅ Marcar como Encontrado</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    height: 192, // h-48
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageEmoji: {
    fontSize: 48,
    marginBottom: 8,
    color: '#9CA3AF',
  },
  noImageText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadgeRed: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  statusBadgeGreen: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  content: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flexShrink: 1,
  },
  foundBadge: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
    fontSize: 12,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: '500',
    marginLeft: 8,
  },
  descriptionText: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    color: '#4B5563',
    fontSize: 14,
    marginLeft: 8,
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  contactPhone: {
    fontSize: 14,
    color: '#4B5563',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  actions: {
    gap: 8,
  },
  detailsButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  statusButton: {
    width: '100%',
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16A34A',
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AnnouncementCard;