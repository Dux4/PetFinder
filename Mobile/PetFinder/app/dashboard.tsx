import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllAnnouncements, getMyAnnouncements, getAnnouncementById, getCurrentUser } from '../services/api';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Componentes já convertidos
import AnnouncementList from '../components/AnnouncementList';
import AnnouncementDetail from '../components/AnnouncementDetail';
import AnnouncementForm from '../components/AnnouncementForm';
import Map from '../components/ui/Map';
import ProfileEdit from '../components/ProfileEdit';

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

const ITEMS_PER_PAGE = 10;
const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;

const DashboardScreen = () => {
    const { user, logout, updateUser } = useAuth();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [foundPets, setFoundPets] = useState<Announcement[]>([]);
    const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todos');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Estados de paginação
    const [currentPageTodos, setCurrentPageTodos] = useState(1);
    const [currentPageMeus, setCurrentPageMeus] = useState(1);
    const [currentPageEncontrados, setCurrentPageEncontrados] = useState(1);

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

    const handleAnnouncementSuccess = async () => {
        await loadData();
        setActiveTab('todos');
        setCurrentPageTodos(1);
        Alert.alert('Sucesso', 'Anúncio criado com sucesso!');
    };

    const getPaginatedData = (data: Announcement[], currentPage: number) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (data: Announcement[]) => {
        return Math.ceil(data.length / ITEMS_PER_PAGE);
    };

    const tabs = [
        { 
            id: 'todos', 
            label: 'Explorar', 
            icon: 'search', 
            iconType: 'ionicons' as const,
            count: announcements.length 
        },
        { 
            id: 'meus', 
            label: 'Meus', 
            icon: 'document-text', 
            iconType: 'ionicons' as const,
            count: myAnnouncements.length 
        },
        { 
            id: 'criar', 
            label: 'Anunciar', 
            icon: 'add-circle', 
            iconType: 'ionicons' as const
        },
        { 
            id: 'mapa', 
            label: 'Mapa', 
            icon: 'map', 
            iconType: 'ionicons' as const
        },
        { 
            id: 'encontrados', 
            label: 'Encontrados', 
            icon: 'checkmark-circle', 
            iconType: 'ionicons' as const,
            count: foundPets.length 
        },
    ];
    
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
    
    const PaginationControls = ({ 
        currentPage, 
        totalPages, 
        onPageChange 
    }: { 
        currentPage: number; 
        totalPages: number; 
        onPageChange: (page: number) => void;
    }) => {
        if (totalPages <= 1) return null;

        return (
            <View className="flex-row items-center justify-center gap-3 py-4 px-4 mt-4">
                <TouchableOpacity
                    onPress={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-lg ${
                        currentPage === 1 
                            ? 'bg-gray-100' 
                            : 'bg-purple-700'
                    }`}
                >
                    <Ionicons 
                        name="chevron-back" 
                        size={20} 
                        color={currentPage === 1 ? '#9CA3AF' : '#FFFFFF'} 
                    />
                    <Text className={`font-semibold ${currentPage === 1 ? 'text-gray-400' : 'text-white'}`}>
                        Anterior
                    </Text>
                </TouchableOpacity>

                <View className="bg-purple-100 px-4 py-3 rounded-lg min-w-[80px]">
                    <Text className="text-center font-bold text-purple-900">
                        {currentPage} / {totalPages}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-lg ${
                        currentPage === totalPages 
                            ? 'bg-gray-100' 
                            : 'bg-purple-700'
                    }`}
                >
                    <Text className={`font-semibold ${currentPage === totalPages ? 'text-gray-400' : 'text-white'}`}>
                        Próxima
                    </Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={currentPage === totalPages ? '#9CA3AF' : '#FFFFFF'} 
                    />
                </TouchableOpacity>
            </View>
        );
    };

    // Header Component
    const Header = () => (
        <LinearGradient
            colors={['#7c3aed', '#6d28d9', '#5b21b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-4 pb-4 pt-12 shadow-lg"
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                        <FontAwesome5 name="paw" size={20} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-white">Pet Finder</Text>
                        <Text className="text-xs text-white/90">
                            {user?.name || 'Visitante'}
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity 
                        onPress={() => setActiveTab('perfil')}
                        className="bg-white/20 w-10 h-10 rounded-full items-center justify-center border border-white/30"
                    >
                        <Ionicons name="settings" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={logout} 
                        className="bg-white/20 px-4 py-2 rounded-lg border border-white/30 flex-row items-center gap-2"
                    >
                        <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                        <Text className="text-white font-semibold text-sm">Sair</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {!isMobile && (
                <View className="flex-row gap-2 mt-4">
                    <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="paw" size={14} color="#FFFFFF" />
                            <Text className="text-white/80 text-xs">Ativos</Text>
                        </View>
                        <Text className="text-white text-2xl font-bold">{announcements.length}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="document-text" size={14} color="#FFFFFF" />
                            <Text className="text-white/80 text-xs">Meus</Text>
                        </View>
                        <Text className="text-white text-2xl font-bold">{myAnnouncements.length}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                            <Text className="text-white/80 text-xs">Encontrados</Text>
                        </View>
                        <Text className="text-white text-2xl font-bold">{foundPets.length}</Text>
                    </View>
                </View>
            )}
        </LinearGradient>
    );

    // Bottom Navigation (Mobile)
    const BottomNavigation = () => {
        if (!isMobile) return null;

        return (
            <View className="bg-white border-t border-gray-200 shadow-lg">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                >
                    <View className="flex-row items-center py-2 gap-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => setActiveTab(tab.id)}
                                    className="items-center py-2 px-3"
                                    style={{ minWidth: 70 }}
                                >
                                    <View className={`items-center justify-center ${isActive ? 'relative' : ''}`}>
                                        <View className={`w-12 h-12 items-center justify-center rounded-2xl ${
                                            isActive ? 'bg-purple-100' : ''
                                        }`}>
                                            <Ionicons 
                                                name={tab.icon as any} 
                                                size={24} 
                                                color={isActive ? '#7c3aed' : '#6B7280'} 
                                            />
                                            {tab.count !== undefined && tab.count > 0 && (
                                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                                                    <Text className="text-white text-[10px] font-bold">
                                                        {tab.count > 99 ? '99+' : tab.count}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text 
                                            className={`text-[11px] mt-1 font-medium ${
                                                isActive ? 'text-purple-700' : 'text-gray-600'
                                            }`}
                                            numberOfLines={1}
                                        >
                                            {tab.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    };

    // Top Navigation (Web/Tablet)
    const TopNavigation = () => {
        if (isMobile) return null;

        return (
            <View className="bg-white border-b border-gray-200 shadow-sm">
                <View className="flex-row px-6 py-3 gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id)}
                                className={`flex-row items-center gap-2 px-5 py-3 rounded-xl transition-all ${
                                    isActive 
                                        ? 'bg-purple-700 shadow-md' 
                                        : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                <Ionicons 
                                    name={tab.icon as any} 
                                    size={20} 
                                    color={isActive ? '#FFFFFF' : '#374151'} 
                                />
                                <Text 
                                    className={`text-sm font-semibold ${
                                        isActive ? 'text-white' : 'text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </Text>
                                {tab.count !== undefined && (
                                    <View 
                                        className={`px-2 py-1 rounded-full min-w-[24px] items-center ${
                                            isActive 
                                                ? 'bg-purple-900' 
                                                : 'bg-white'
                                        }`}
                                    >
                                        <Text 
                                            className={`text-xs font-bold ${
                                                isActive ? 'text-white' : 'text-gray-700'
                                            }`}
                                        >
                                            {tab.count}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    // Section Header Component
    const SectionHeader = ({ iconName, title, subtitle }: { iconName: string; title: string; subtitle: string }) => (
        <View className="p-4 bg-white">
            <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                    <Ionicons name={iconName as any} size={24} color="#7c3aed" />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                        {title}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        {subtitle}
                    </Text>
                </View>
            </View>
        </View>
    );
    
    return (
        <View className="flex-1 bg-gray-50">
            <Header />
            <TopNavigation />

            <View className="flex-1" style={{ marginBottom: isMobile ? 0 : 0 }}>
                {activeTab === 'todos' && (
                    <View className="flex-1">
                        <SectionHeader 
                            iconName="search"
                            title="Explorar Anúncios"
                            subtitle="Pets perdidos e encontrados"
                        />
                        <AnnouncementList 
                            announcements={getPaginatedData(announcements, currentPageTodos)} 
                            loading={loading}
                            onRefresh={loadData}
                            title=""
                            showOwnerActions={false}
                            onViewDetail={handleViewDetail}
                            ListFooterComponent={
                                <PaginationControls
                                    currentPage={currentPageTodos}
                                    totalPages={getTotalPages(announcements)}
                                    onPageChange={setCurrentPageTodos}
                                />
                            }
                        />
                    </View>
                )}
                
                {activeTab === 'meus' && (
                    <View className="flex-1">
                        <SectionHeader 
                            iconName="document-text"
                            title="Meus Anúncios"
                            subtitle="Gerencie suas publicações"
                        />
                        <AnnouncementList 
                            announcements={getPaginatedData(myAnnouncements, currentPageMeus)} 
                            loading={loading}
                            onRefresh={loadData}
                            title=""
                            showOwnerActions={true}
                            onViewDetail={handleViewDetail}
                            ListFooterComponent={
                                <PaginationControls
                                    currentPage={currentPageMeus}
                                    totalPages={getTotalPages(myAnnouncements)}
                                    onPageChange={setCurrentPageMeus}
                                />
                            }
                        />
                    </View>
                )}
                
                {activeTab === 'encontrados' && (
                    <View className="flex-1">
                        <SectionHeader 
                            iconName="checkmark-circle"
                            title="Pets Encontrados"
                            subtitle="Histórias de sucesso"
                        />
                        <AnnouncementList 
                            announcements={getPaginatedData(foundPets, currentPageEncontrados)} 
                            loading={loading}
                            onRefresh={loadData}
                            title=""
                            showOwnerActions={false}
                            onViewDetail={handleViewDetail}
                            ListFooterComponent={
                                <PaginationControls
                                    currentPage={currentPageEncontrados}
                                    totalPages={getTotalPages(foundPets)}
                                    onPageChange={setCurrentPageEncontrados}
                                />
                            }
                        />
                    </View>
                )}
                
                {activeTab === 'mapa' && (
                    <View className="flex-1">
                        <SectionHeader 
                            iconName="map"
                            title="Mapa Interativo"
                            subtitle="Visualize por localização"
                        />
                        <Map announcements={announcements} onViewDetail={handleViewDetail} />
                    </View>
                )}
                
                {activeTab === 'criar' && (
                    <View className="flex-1">
                        <ScrollView 
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                        >
                            <SectionHeader 
                                iconName="add-circle"
                                title="Novo Anúncio"
                                subtitle="Compartilhe com a comunidade"
                            />
                            <View className="p-4">
                                <AnnouncementForm onSuccess={handleAnnouncementSuccess} />
                            </View>
                        </ScrollView>
                    </View>
                )}
                
                {activeTab === 'perfil' && (
                    <View className="flex-1">
                        <SectionHeader 
                            iconName="person-circle"
                            title="Meu Perfil"
                            subtitle="Gerencie suas informações"
                        />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <ProfileEdit onSuccess={async () => {
                                try {
                                    const userData = await getCurrentUser();
                                    updateUser(userData);
                                    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
                                } catch (error) {
                                    console.error('Erro ao recarregar dados do usuário:', error);
                                }
                            }} />
                        </ScrollView>
                    </View>
                )}
            </View>

            <BottomNavigation />
        </View>
    );
};

export default DashboardScreen;