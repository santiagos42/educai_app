import { useState, useEffect } from 'react';
import { Save } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';
import { getFolders } from '../../firebase';
import toast from "react-hot-toast";

const SaveToHistoryModal = ({ result, onClose, onSave }) => {
  const [fileName, setFileName] = useState(result.topic || result.discipline || 'Novo Documento');
  const [targetFolderId, setTargetFolderId] = useState('root');
  const [folders, setFolders] = useState([]);
  const { currentUser } = useAuth();
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getFolders(currentUser.uid, 'root', setFolders);
      return () => unsubscribe();
    }
  }, [currentUser]);
  const handleSave = () => {
    if (!fileName.trim()) { toast.error("Por favor, dê um nome ao arquivo."); return; }
    onSave(targetFolderId, fileName);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-2xl relative w-full max-w-lg">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Salvar em Meu Drive</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Nome do Arquivo</label>
            <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Salvar na Pasta</label>
            <select value={targetFolderId} onChange={e => setTargetFolderId(e.target.value)} className="form-input">
              <option value="root">Pasta Principal (Meu Drive)</option>
              {folders.map(folder => (<option key={folder.id} value={folder.id}>{folder.name}</option>))}
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="form-button-secondary w-full">Ver Meu Arquivo</button>
          <button onClick={handleSave} className="form-button-primary w-full"><Save size={18} className="mr-2" />Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default SaveToHistoryModal;