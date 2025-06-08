import React, { useState, useEffect } from 'react';
import AnnouncementForm from './components/AnnouncementForm';
import AnnouncementList from './components/AnnouncementList';
import Map from './components/Map';
import { getAllAnnouncements } from './services/api';

function App() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lista');

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🐾 Pet Finder</h1>
        <p>Plataforma colaborativa para encontrar animais perdidos</p>
      </header>

      <nav className="nav">
        <button 
          className={activeTab === 'lista' ? 'active' : ''}
          onClick={() => setActiveTab('lista')}
        >
          📋 Lista de Anúncios
        </button>
        <button 
          className={activeTab === 'mapa' ? 'active' : ''}
          onClick={() => setActiveTab('mapa')}
        >
          🗺️ Mapa
        </button>
        <button 
          className={activeTab === 'criar' ? 'active' : ''}
          onClick={() => setActiveTab('criar')}
        >
          ➕ Criar Anúncio
        </button>
      </nav>

      <main className="main">
        {activeTab === 'lista' && (
          <AnnouncementList 
            announcements={announcements} 
            loading={loading}
            onRefresh={loadAnnouncements}
          />
        )}
        
        {activeTab === 'mapa' && (
          <Map announcements={announcements} />
        )}
        
        {activeTab === 'criar' && (
          <AnnouncementForm onSuccess={loadAnnouncements} />
        )}
      </main>
    </div>
  );
}

export default App;