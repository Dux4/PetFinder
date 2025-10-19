import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/api';

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (token: string, userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  console.log('🎯 useAuth foi chamado');
  const context = useContext(AuthContext);
  if (!context) {
    console.error('❌ AuthContext é undefined - AuthProvider não está acima na árvore!');
    console.trace('Stack trace:'); // Mostra de onde veio a chamada
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  console.log('✅ useAuth funcionou, contexto encontrado');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🔥 AuthProvider montando...');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect executando');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('pet-finder-token');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      await AsyncStorage.removeItem('pet-finder-token');
    } finally {
      setLoading(false);
      console.log('✅ AuthProvider loading completo');
    }
  };

  const login = async (token: string, userData: UserData) => {
    try {
      await AsyncStorage.setItem('pet-finder-token', token);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('pet-finder-token');
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  console.log('🔥 AuthProvider renderizando, loading:', loading);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};