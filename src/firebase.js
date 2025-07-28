import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously
} from "firebase/auth";

// TODO: Substitua pelas suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBI8tRYBjFMaxbXIK2OWPk29U2uAHGOqq0",
  authDomain: "appeducai.firebaseapp.com",
  projectId: "appeducai",
  storageBucket: "appeducai.firebasestorage.app",
  messagingSenderId: "173916263647",
  appId: "1:173916263647:web:d3dee71a9dd02dedc1856a",
  measurementId: "G-8C0D0TSB1J"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as ferramentas de autenticação que vamos usar
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Funções de Autenticação
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const signUpWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInAsGuest = () => {
  return signInAnonymously(auth);
};

export const logout = () => {
  return signOut(auth);
};