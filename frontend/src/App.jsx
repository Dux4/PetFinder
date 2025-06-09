import React, { useState } from 'react';
import './App.css'
import './index.css'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // landing, login, register

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <h2>🐾 Pet Finder Salvador</h2>
          <p>Carregando...</p>
        </div>

        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .loading-content {
            text-align: center;
          }

          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 2rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-content h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  switch (currentView) {
    case 'login':
      return (
        <Login 
          onBack={() => setCurrentView('landing')}
          onSwitchToRegister={() => setCurrentView('register')}
        />
      );
    case 'register':
      return (
        <Register 
          onBack={() => setCurrentView('landing')}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      );
    default:
      return (
        <LandingPage 
          onLogin={() => setCurrentView('login')}
          onRegister={() => setCurrentView('register')}
        />
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;