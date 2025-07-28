// ARQUIVO: src/contexts/AuthContext.js

import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth } from '../firebase'; // Importa a configuração do Firebase
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // O Firebase nos notifica sempre que o estado de login muda
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Limpa a inscrição ao desmontar o componente
  }, []);

  const value = {
    currentUser,
  };

  // Não renderiza o app até que o estado de autenticação seja verificado
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}