import React from 'react';
import { 
  View, 
  Text, 
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
    ListFooterComponent?: React.ReactElement | null;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
    announcements,
    loading,
    onRefresh,
    title,
    showOwnerActions,
    onViewDetail,
    ListFooterComponent,
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
        <View className="flex-1">
            {/* Header */}
            {title && (
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-800">
                            {title}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            {announcements.length} anúncio(s) encontrado(s)
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        className="flex-row items-center gap-2 bg-purple-600 px-4 py-2.5 rounded-lg shadow-md active:bg-purple-700"
                    >
                        <MaterialIcons name="refresh" size={18} color="#fff" />
                        <Text className="text-white font-medium text-sm">
                            Atualizar
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <View className="flex-1 justify-center items-center py-12">
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text className="mt-4 text-gray-600">
                        Carregando anúncios...
                    </Text>
                </View>
            ) : announcements.length === 0 ? (
                <View className="flex-1 justify-center items-center py-12 px-4">
                    <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-6">
                        <Text className="text-5xl">🐾</Text>
                    </View>
                    <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
                        Nenhum anúncio encontrado
                    </Text>
                    <Text className="text-sm text-gray-600 text-center max-w-xs">
                        {title.includes('Meus') 
                            ? 'Você ainda não criou nenhum anúncio. Crie seu primeiro anúncio agora!' 
                            : 'Seja o primeiro a criar um anúncio e ajudar a comunidade!'
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={announcements}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
                    refreshControl={
                        <RefreshControl 
                            refreshing={loading} 
                            onRefresh={onRefresh}
                            colors={['#7c3aed']}
                            tintColor="#7c3aed"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={ListFooterComponent}
                />
            )}
        </View>
    );
};

export default AnnouncementList;