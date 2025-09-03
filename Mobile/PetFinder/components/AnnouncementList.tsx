import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AnnouncementCard from './AnnouncementCard';

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

interface AnnouncementListProps {
    announcements: Announcement[];
    loading: boolean;
    onRefresh: () => void;
    title: string;
    showOwnerActions?: boolean;
    onViewDetail?: (announcement: Announcement) => void;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
    announcements,
    loading,
    onRefresh,
    title,
    showOwnerActions,
    onViewDetail,
}) => {
    const renderItem = ({ item }: { item: Announcement }) => (
        <AnnouncementCard
            announcement={item}
            showOwnerActions={showOwnerActions}
            onStatusUpdate={onRefresh}
            onViewDetail={onViewDetail}
        />
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Text style={styles.subtitle}>{announcements.length} anúncio(s) encontrado(s)</Text>
                </View>
                <TouchableOpacity
                    onPress={onRefresh}
                    style={styles.refreshButton}
                >
                    <MaterialIcons name="refresh" size={20} color="#fff" />
                    <Text style={styles.refreshButtonText}>Atualizar</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Carregando anúncios...</Text>
                </View>
            ) : announcements.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateEmoji}>🐾</Text>
                    <Text style={styles.emptyStateTitle}>Nenhum anúncio encontrado</Text>
                    <Text style={styles.emptyStateText}>
                        {title.includes('Meus') 
                            ? 'Você ainda não criou nenhum anúncio.' 
                            : 'Seja o primeiro a criar um anúncio!'
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={announcements}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        color: '#4B5563',
        marginTop: 4,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    refreshButtonText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
    },
    loadingText: {
        marginTop: 16,
        color: '#4B5563',
    },
    emptyStateContainer: {
        textAlign: 'center',
        paddingVertical: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptyStateText: {
        color: '#4B5563',
        textAlign: 'center',
    },
    listContent: {
        gap: 16,
        paddingBottom: 16,
    },
});

export default AnnouncementList;