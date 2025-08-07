import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getFolders, createFolder } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FolderClock, FolderPlus, ArrowRight, Loader, Folder } from 'lucide-react';


const DrivePreview = ({ setView }) => {
    const { currentUser } = useAuth(); 
    const [recentFolders, setRecentFolders] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); useEffect(() => { if (!currentUser) return; 
    const unsub = getFolders(currentUser.uid, 'root', (folders) => { setRecentFolders(folders.slice(0, 6)); setIsLoading(false); }); return () => unsub(); }, [currentUser]);
    
    const handleViewAllClick = () => {
    if (currentUser?.isAnonymous) {
      toast.error(
        "Crie uma conta gratuita para ter acesso limitado. \n\nTorne-se Premium para uma experiência completa!", 
        { duration: 5000, icon: '🔒', style: { background: '#f59e0b', color: 'white', fontWeight: 'bold'} }
      );
    } else {
      setView('history');
    }
  };

    const handleCreateFolder = async () => {
      if (currentUser?.isAnonymous) {
      toast.error(
          "Crie uma conta gratuita para ter acesso limitado. \n\nTorne-se Premium para uma experiência completa!", 
          { duration: 5000, icon: '🔒', style: { background: '#f59e0b', color: 'white', fontWeight: 'bold'} }
        );
    } else {
      setView('history');
    }
      const folderName = prompt("Digite o nome da nova pasta:");
      if (folderName && folderName.trim() && currentUser) {
        try {
          await createFolder(currentUser.uid, 'root', folderName.trim());
          toast.success(`Pasta "${folderName}" criada.`);
        } catch (error) {
          toast.error("Não foi possível criar a pasta.");
        }
      }
    };
    
    return ( // return da DrivePreview
      <div className="bg-slate-100/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
            <FolderClock size={24} />
            Meu Drive
          </h2>
            <button onClick={handleViewAllClick}
            className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1">
            Ver tudo <ArrowRight size={16} />
          </button>
        </div>

        <p className="text-slate-600 text-sm mb-6">
          Acesse e organize seus materiais ou crie uma nova pasta para começar.
        </p>
        <div className="flex-grow grid grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-3 flex items-center justify-center">
              <Loader className="animate-spin text-sky-500" />
            </div>
          ) : recentFolders.length > 0 ? (
            recentFolders.map(folder => (
              <div
                key={folder.id}
                onClick={() => setView('history')}
                className="bg-white/70 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:shadow-md transition-all"
              >
                <Folder size={32} className="text-yellow-500 mb-2" />
                <p className="text-xs font-semibold text-slate-600 truncate w-full">{folder.name}</p>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center text-slate-500 bg-slate-100/50 rounded-lg">
              <Folder size={40} className="mb-2" />
              <p className="font-semibold">Nenhuma pasta ainda</p>
              <p className="text-xs">Clique abaixo para criar sua primeira pasta.</p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <button onClick={handleCreateFolder} className="form-button-secondary w-full">
            <FolderPlus size={16} className="mr-2" />
            Criar Nova Pasta
          </button>
        </div>
      </div>
    );
};

export default DrivePreview;