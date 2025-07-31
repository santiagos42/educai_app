import { initializeApp } from "firebase/app";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously,
  sendEmailVerification, sendPasswordResetEmail, updateProfile
} from "firebase/auth";
import { 
  getFirestore, doc, setDoc, collection, addDoc, query, where, onSnapshot,
  updateDoc, deleteDoc, serverTimestamp, getDocs, writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Funções de Autenticação
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signInAsGuest = () => signInAnonymously(auth);
export const logout = () => signOut(auth);

export const signUpWithDetails = async (email, password, firstName, lastName, discipline) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: `${firstName} ${lastName}` });
  await setDoc(doc(db, "users", user.uid), { uid: user.uid, firstName, lastName, discipline, email: user.email });
  await sendEmailVerification(user);
  return userCredential;
};

export const sendPasswordReset = (email) => sendPasswordResetEmail(auth, email);
export const resendVerificationEmail = (user) => sendEmailVerification(user);

// Funções do Firestore
export const createFolder = (ownerId, parentId, name) => addDoc(collection(db, "folders"), { ownerId, parentId, name, createdAt: serverTimestamp() });
export const getFolders = (ownerId, parentId, callback) => { const q = query(collection(db, "folders"), where("ownerId", "==", ownerId), where("parentId", "==", parentId)); return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))); };
export const getAllUserFolders = async (ownerId) => { const q = query(collection(db, "folders"), where("ownerId", "==", ownerId)); const querySnapshot = await getDocs(q); return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); };
export const saveGeneration = (ownerId, folderId, name, data) => addDoc(collection(db, "generations"), { ownerId, folderId, name, content: data, createdAt: serverTimestamp() });
export const getGenerationsInFolder = (ownerId, folderId, callback) => { const q = query(collection(db, "generations"), where("ownerId", "==", ownerId), where("folderId", "==", folderId)); return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))); };
export const updateDocumentName = (collectionName, docId, newName) => updateDoc(doc(db, collectionName, docId), { name: newName });
export const moveItem = (collectionName, itemId, newParentId) => updateDoc(doc(db, collectionName, itemId), { folderId: newParentId });
export const moveFolder = (folderId, newParentId) => updateDoc(doc(db, 'folders', folderId), { parentId: newParentId });
export const deleteGeneration = (generationId) => deleteDoc(doc(db, "generations", generationId));

export const deleteFolderAndContents = async (ownerId, folderId) => {
  const batch = writeBatch(db);
  const findAllSubItems = async (currentFolderId) => {
    let itemsToDelete = { folders: [currentFolderId], generations: [] };
    const subfoldersQuery = query(collection(db, 'folders'), where('ownerId', '==', ownerId), where('parentId', '==', currentFolderId));
    const subfoldersSnapshot = await getDocs(subfoldersQuery);
    for (const subfolderDoc of subfoldersSnapshot.docs) {
      const subItems = await findAllSubItems(subfolderDoc.id);
      itemsToDelete.folders.push(...subItems.folders);
      itemsToDelete.generations.push(...subItems.generations);
    }
    const generationsQuery = query(collection(db, 'generations'), where('ownerId', '==', ownerId), where('folderId', '==', currentFolderId));
    const generationsSnapshot = await getDocs(generationsQuery);
    generationsSnapshot.forEach(genDoc => itemsToDelete.generations.push(genDoc.id));
    return itemsToDelete;
  };
  const allItemsToDelete = await findAllSubItems(folderId);
  allItemsToDelete.folders.forEach(id => batch.delete(doc(db, 'folders', id)));
  allItemsToDelete.generations.forEach(id => batch.delete(doc(db, 'generations', id)));
  return batch.commit();
};