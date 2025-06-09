import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementList from './AnnouncementList';
import AnnouncementDetail from './AnnouncementDetail';
import Map from './Map';
import { getAllAnnouncements, getMyAnnouncements, getAnnouncementById } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [foundPets, setFoundPets] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
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
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (announcementOrId) => {
    try {
      setLoadingDetail(true);
      
      // Se recebeu um objeto anúncio completo, usar diretamente
      if (typeof announcementOrId === 'object' && announcementOrId?.id) {
        setSelectedAnnouncement(announcementOrId);
        return;
      }
      
      // Se recebeu um ID, tentar encontrar nos dados locais primeiro
      const id = parseInt(announcementOrId);
      const allLoadedAnnouncements = [...announcements, ...foundPets, ...myAnnouncements];
      const existingAnnouncement = allLoadedAnnouncements.find(ann => ann.id === id);
      
      if (existingAnnouncement) {
        setSelectedAnnouncement(existingAnnouncement);
        return;
      }
      
      // Se não encontrou localmente, buscar na API
      const announcement = await getAnnouncementById(id);
      if (!announcement) throw new Error('Anúncio não encontrado');
      
      setSelectedAnnouncement(announcement);
      
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      alert('Erro ao carregar detalhes do anúncio');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackFromDetail = () => {
    setSelectedAnnouncement(null);
  };

  const tabs = [
    { id: 'todos', label: 'Todos os Anúncios', icon: '📋', count: announcements.length },
    { id: 'meus', label: 'Meus Anúncios', icon: '👤', count: myAnnouncements.length },
    { id: 'criar', label: 'Criar Anúncio', icon: '➕' },
    { id: 'mapa', label: 'Mapa', icon: '🗺️' },
    { id: 'encontrados', label: 'Pets Encontrados', icon: '✅', count: foundPets.length },
  ];

  // Loading state para detalhes
  if (loadingDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  // Mostrar detalhes do anúncio
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🐾</div>
              <div>
                <h1 className="text-3xl font-bold text-white">Pet Finder Salvador</h1>
                <p className="text-blue-100">Olá, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right text-blue-100">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm opacity-80">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md border border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white border border-blue-400' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <AnnouncementForm onSuccess={loadData} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;