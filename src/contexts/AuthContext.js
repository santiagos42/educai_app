// Em src/contexts/AuthContext.js

import React, { useContext, useState, useEffect } from 'react';

// >>> CORREÇÃO 1: Adicionar todas as importações necessárias <<<
import { auth, db } from '../firebase'; // Importa a configuração do Auth e do Firestore
import { onAuthStateChanged } from "firebase/auth"; // Importa a função do Auth
import { doc, onSnapshot } from "firebase/firestore"; // Importa as funções do Firestore

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfileListener;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (unsubscribeProfileListener) unsubscribeProfileListener();

      if (!user) {
        // Usuário deslogou. Fim do carregamento.
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      if (user.isAnonymous) {
        // Usuário é convidado. Não busca perfil. Fim do carregamento.
        setUserProfile({ plan: 'guest' }); 
        setLoading(false);
        return;
      }

      // Usuário está registrado. Busca o perfil.
      const userDocRef = doc(db, "users", user.uid);
      unsubscribeProfileListener = onSnapshot(userDocRef, 
        (docSnapshot) => {
          // A busca no Firestore foi bem-sucedida (mesmo que não tenha encontrado nada).
          if (docSnapshot.exists()) {
            setUserProfile(docSnapshot.data());
          } else {
            // O documento não existe. Isso é um estado válido.
            console.warn("Documento de perfil não encontrado para o usuário:", user.uid);
            setUserProfile(null); // Define como nulo para que possamos lidar com isso na UI.
          }
          setLoading(false); // <<< PONTO CRUCIAL
        },
        (error) => {
          // A busca no Firestore falhou.
          console.error("Erro ao buscar perfil do usuário:", error);
          setUserProfile(null);
          setLoading(false); // <<< PONTO CRUCIAL
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileListener) unsubscribeProfileListener();
    };
  }, []);

  const value = { currentUser, userProfile, loading };

  return (
    <AuthContext.Provider value={value}>
      {/* Esta verificação é tudo o que precisamos */}
      {!loading && children}
    </AuthContext.Provider>
  );
}