import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { getAllAnnouncements, getMyAnnouncements, getAnnouncementById } from '../../services/api';
import AnnouncementList from '../../components/AnnouncementList';
import AnnouncementForm from '../../components/AnnouncementForm';

// Only keep these placeholders
const AnnouncementDetail = ({ announcement, onBack, onStatusUpdate }: { announcement: any, onBack: () => void, onStatusUpdate: () => void }) => <Text>AnnouncementDetail Placeholder</Text>;
const Map = ({ announcements, onViewDetail }: { announcements: any, onViewDetail: (announcement: any) => void }) => <Text>Map Placeholder</Text>;

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
    const router = useRouter();

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
            // IMPORTANTE: Remova os dados de exemplo e ative as chamadas reais de API.
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
        Alert.alert('Detalhes', `Detalhes do anúncio: ${announcement.title}`);
    };

    const tabs = [
        { id: 'todos', label: 'Todos', icon: '📋', count: announcements.length },
        { id: 'meus', label: 'Meus', icon: '👤', count: myAnnouncements.length },
        { id: 'criar', label: 'Criar', icon: '➕' },
        { id: 'mapa', label: 'Mapa', icon: '🗺️' },
        { id: 'encontrados', label: 'Encontrados', icon: '✅', count: foundPets.length },
    ];
    
    return (
        <View style={styles.dashboardContainer}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerEmoji}>🐾</Text>
                        <View>
                            <Text style={styles.headerTitle}>Pet Finder Salvador</Text>
                            <Text style={styles.headerSubtitle}>Olá, {user?.name || 'Visitante'}!</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Text style={styles.logoutButtonText}>Sair</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.navTabs}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navTabsContent}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            style={[
                                styles.tabButton,
                                activeTab === tab.id && styles.activeTabButton
                            ]}
                        >
                            <Text style={[styles.tabIcon, activeTab === tab.id && styles.activeTabIcon]}>{tab.icon}</Text>
                            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
                            {tab.count !== undefined && (
                                <View style={[styles.tabCountBadge, activeTab === tab.id && styles.activeTabCountBadge]}>
                                    <Text style={styles.tabCountText}>{tab.count}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main Content */}
            <ScrollView style={styles.mainContent}>
                {activeTab === 'todos' && (
                    <AnnouncementList 
                        announcements={announcements} 
                        loading={loading}
                        onRefresh={loadData}
                        title="Todos os Anúncios Ativos"
                        showOwnerActions={false}
                        onViewDetail={handleViewDetail}
                    />
                )}
                
                {activeTab === 'meus' && (
                    <AnnouncementList 
                        announcements={myAnnouncements} 
                        loading={loading}
                        onRefresh={loadData}
                        title="Meus Anúncios"
                        showOwnerActions={true}
                        onViewDetail={handleViewDetail}
                    />
                )}
                
                {activeTab === 'encontrados' && (
                    <AnnouncementList 
                        announcements={foundPets} 
                        loading={loading}
                        onRefresh={loadData}
                        title="Pets Encontrados pela Comunidade"
                        showOwnerActions={false}
                        onViewDetail={handleViewDetail}
                    />
                )}
                
                {activeTab === 'mapa' && (
                    <Map announcements={announcements} onViewDetail={handleViewDetail} />
                )}
                
                {activeTab === 'criar' && (
                    <View style={styles.formContainer}>
                        <AnnouncementForm 
                            onSuccess={() => {
                                loadData();
                                setActiveTab('meus');
                            }} 
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
  },
  header: {
    backgroundColor: '#4F46E5', // Cor sólida para substituir o gradiente
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutButtonText: {
    color: '#fff',
  },
  navTabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  navTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  activeTabButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  activeTabIcon: {
    color: '#fff',
  },
  activeTabLabel: {
    color: '#fff',
  },
  tabCountBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  activeTabCountBadge: {
    backgroundColor: '#6366F1',
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  mainContent: {
    padding: 16,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default DashboardScreen;