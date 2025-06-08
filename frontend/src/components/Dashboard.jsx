import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementList from './AnnouncementList';
import Map from './Map';
import { getAllAnnouncements, getMyAnnouncements } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [foundPets, setFoundPets] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🐾 Pet Finder Salvador</h1>
            <p>Olá, {user.name}!</p>
          </div>
          <div className="header-right">
            <span>{user.email}</span>
            <button onClick={logout} className="btn btn-logout">
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'todos' ? 'active' : ''}
          onClick={() => setActiveTab('todos')}
        >
          📋 Todos os Anúncios ({announcements.length})
        </button>
        <button 
          className={activeTab === 'meus' ? 'active' : ''}
          onClick={() => setActiveTab('meus')}
        >
          👤 Meus Anúncios ({myAnnouncements.length})
        </button>
        <button 
          className={activeTab === 'encontrados' ? 'active' : ''}
          onClick={() => setActiveTab('encontrados')}
        >
          ✅ Pets Encontrados ({foundPets.length})
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

      <main className="dashboard-main">
        {activeTab === 'todos' && (
          <AnnouncementList 
            announcements={announcements} 
            loading={loading}
            onRefresh={loadData}
            title="Todos os Anúncios Ativos"
            showOwnerActions={false}
          />
        )}
        
        {activeTab === 'meus' && (
          <AnnouncementList 
            announcements={myAnnouncements} 
            loading={loading}
            onRefresh={loadData}
            title="Meus Anúncios"
            showOwnerActions={true}
          />
        )}
        
        {activeTab === 'encontrados' && (
          <AnnouncementList 
            announcements={foundPets} 
            loading={loading}
            onRefresh={loadData}
            title="Pets Encontrados pela Comunidade"
            showOwnerActions={false}
          />
        )}
        
        {activeTab === 'mapa' && (
          <Map announcements={announcements} />
        )}
        
        {activeTab === 'criar' && (
          <AnnouncementForm onSuccess={loadData} />
        )}
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-left h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .header-left p {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-right span {
          opacity: 0.8;
        }

        .btn-logout {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-logout:hover {
          background: rgba(255,255,255,0.3);
        }

        .dashboard-nav {
          background: white;
          padding: 1rem 2rem;
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-nav button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-width: fit-content;
        }

        .dashboard-nav button:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .dashboard-nav button.active {
          background: #667eea;
          color: white;
        }

        .dashboard-main {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .dashboard-nav {
            padding: 1rem;
            gap: 0.5rem;
          }

          .dashboard-nav button {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .dashboard-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;