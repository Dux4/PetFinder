import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Carregar usuário salvo no localStorage
    const savedUser = localStorage.getItem('pet-finder-user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const selectUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('pet-finder-user', JSON.stringify(user));
  };

  const clearUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('pet-finder-user');
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      setUsers,
      selectUser,
      clearUser
    }}>
      {children}
    </UserContext.Provider>
  );
};