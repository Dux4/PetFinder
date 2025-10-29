import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllAnnouncements, getMyAnnouncements, getAnnouncementById } from '../services/api';

// Componentes já convertidos
import AnnouncementList from '../components/AnnouncementList';
import AnnouncementDetail from '../components/AnnouncementDetail';
import AnnouncementForm from '../components/AnnouncementForm';
import Map from '../components/ui/Map';

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

const DashboardScreen = () => {
    const { user, logout } = useAuth();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [foundPets, setFoundPets] = useState<Announcement[]>([]);
    const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todos');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [allActive, allFound, myAnnounces] = await Promise.all([
                getAllAnnouncements('ativo'),
                getAllAnnouncements('encontrado'),
                getMyAnnouncements()
            ]);
            
            setAnnouncements(allActive);
            setFoundPets(allFound);
            setMyAnnouncements(myAnnounces);

        } catch (error) {
            Alert.alert('Erro', 'Erro ao carregar dados. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (announcement: Announcement) => {
        setLoadingDetail(true);
        setSelectedAnnouncement(announcement);
        setLoadingDetail(false);
    };

    const handleBackFromDetail = () => {
        setSelectedAnnouncement(null);
    };

    const tabs = [
        { id: 'todos', label: 'Todos', icon: '📋', count: announcements.length },
        { id: 'meus', label: 'Meus', icon: '👤', count: myAnnouncements.length },
        { id: 'criar', label: 'Criar', icon: '➕' },
        { id: 'mapa', label: 'Mapa', icon: '🗺️' },
        { id: 'encontrados', label: 'Encontrados', icon: '✅', count: foundPets.length },
    ];
    
    // Mostra o componente de detalhes se um anúncio for selecionado
    if (selectedAnnouncement) {
        return (
            <AnnouncementDetail
                announcement={selectedAnnouncement}
                onBack={handleBackFromDetail}
                onStatusUpdate={() => {
                    loadData();
                    handleBackFromDetail();
                }}
            />
        );
    }
    
    // Header Component (será reutilizado)
    const Header = () => (
        <>
            <LinearGradient
                colors={['#7c3aed', '#6d28d9', '#5b21b6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 pb-6 pt-12 shadow-lg"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                            <Text className="text-3xl">🐾</Text>
                        </View>
                        <View>
                            <Text className="text-2xl font-bold text-white">Pet Finder</Text>
                            <Text className="text-sm text-white/90">
                                Olá, {user?.name || 'Visitante'}!
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity 
                        onPress={logout} 
                        className="bg-white/20 px-4 py-2 rounded-lg border border-white/30"
                    >
                        <Text className="text-white font-semibold">Sair</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row gap-2 mt-6">
                    <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                        <Text className="text-white/80 text-xs mb-1">Ativos</Text>
                        <Text className="text-white text-2xl font-bold">{announcements.length}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                        <Text className="text-white/80 text-xs mb-1">Meus</Text>
                        <Text className="text-white text-2xl font-bold">{myAnnouncements.length}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                        <Text className="text-white/80 text-xs mb-1">Encontrados</Text>
                        <Text className="text-white text-2xl font-bold">{foundPets.length}</Text>
                    </View>
                </View>
            </LinearGradient>

            <View className="bg-white border-b border-gray-200 shadow-sm">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`flex-row items-center gap-2 px-4 py-3 rounded-xl ${
                                activeTab === tab.id 
                                    ? 'bg-purple-700 shadow-md' 
                                    : 'bg-gray-100'
                            }`}
                        >
                            <Text className="text-base">{tab.icon}</Text>
                            <Text 
                                className={`text-sm font-semibold ${
                                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </Text>
                            {tab.count !== undefined && (
                                <View 
                                    className={`px-2 py-1 rounded-full min-w-[24px] items-center ${
                                        activeTab === tab.id 
                                            ? 'bg-purple-900' 
                                            : 'bg-white'
                                    }`}
                                >
                                    <Text 
                                        className={`text-xs font-bold ${
                                            activeTab === tab.id ? 'text-white' : 'text-gray-700'
                                        }`}
                                    >
                                        {tab.count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );
    
    // Dashboard principal
    return (
        <View className="flex-1 bg-gray-50">
            <Header />

            {/* Main Content - Cada tab gerencia seu próprio scroll */}
            <View className="flex-1">
                {activeTab === 'todos' && (
                    <View className="flex-1 p-4">
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                                <Text className="text-xl">📋</Text>
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-800">
                                    Todos os Anúncios
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Pets perdidos e encontrados na comunidade
                                </Text>
                            </View>
                        </View>
                        <AnnouncementList 
                            announcements={announcements} 
                            loading={loading}
                            onRefresh={loadData}
                            title=""
                            showOwnerActions={false}
                            onViewDetail={handleViewDetail}
                        />
                    </View>
                )}
                
                {activeTab === 'meus' && (
                    <View className="flex-1 p-4">
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                                <Text className="text-xl">👤</Text>
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-800">
                                    Meus Anúncios
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Gerencie suas publicações
                                </Text>
                            </View>
                        </View>
                        <AnnouncementList 
                            announcements={myAnnouncements} 
                            loading={loading}
                            onRefresh={loadData}
                            title=""
                            showOwnerActions={true}
                            onViewDetail={handleViewDetail}
                        />
                    </View>
                )}
                
                {activeTab === 'encontrados' && (
                    <View className="flex-1 p-4">
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                                <Text className="text-xl">✅</Text>
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-800">
                                    Pets Encontrados
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Histórias de sucesso da comunidade
                                </Text>
                            </View>
                        </View>
                        <AnnouncementList 
                            announcements={foundPets} 
                            loading={loading}
                            onRefresh={loadData}
                            title=""
                            showOwnerActions={false}
                            onViewDetail={handleViewDetail}
                        />
                    </View>
                )}
                
                {activeTab === 'mapa' && (
                    <View className="flex-1">
                        <View className="p-4 border-b border-gray-100 bg-white">
                            <View className="flex-row items-center gap-2">
                                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
                                    <Text className="text-xl">🗺️</Text>
                                </View>
                                <View>
                                    <Text className="text-lg font-bold text-gray-800">
                                        Mapa Interativo
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        Visualize os pets por localização
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Map announcements={announcements} onViewDetail={handleViewDetail} />
                    </View>
                )}
                
                {activeTab === 'criar' && (
                    <ScrollView className="flex-1 p-4">
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                                <Text className="text-xl">➕</Text>
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-gray-800">
                                    Novo Anúncio
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Compartilhe com a comunidade
                                </Text>
                            </View>
                        </View>
                        <AnnouncementForm onSuccess={loadData} />
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default DashboardScreen;