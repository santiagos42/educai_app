import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFolders, createFolder, updateDocumentName, deleteFolderAndContents, moveFolder, getGenerationsInFolder, saveGeneration, deleteGeneration, moveItem } from '../firebase';
import { HardDrive, FolderOpen, Home, FolderPlus, LayoutGrid, List, Loader, Folder } from 'lucide-react';
import AuthHeader from '../components/layout/AuthHeader';
import HistorySidebar from '../components/layout/HistorySidebar';
import ItemCard from '../components/drive/ItemCard';
import ItemListRow from '../components/drive/ItemListRow';
import MoveItemModal from '../components/drive/MoveItemModal';
import InfoBox from '../components/drive/InfoBox';
import toast from 'react-hot-toast';

const HistoryScreen = ({ 
  setView, 
  loadGeneration,
  currentFolderId,
  setCurrentFolderId,
  breadcrumbs,
  setBreadcrumbs,
  onOpenPremiumModal
}) => {

const { currentUser } = useAuth(); 
const [folders, setFolders] = useState([]); 
const [generations, setGenerations] = useState([]); 
const [isLoading, setIsLoading] = useState(true); 
const [viewType, setViewType] = useState('grid'); 
const [itemToMove, setItemToMove] = useState(null);
  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);

    const unsubFolders = getFolders(
      currentUser.uid,
      currentFolderId,
      (data) => {
        setFolders(data);
        setIsLoading(false);  
      }
    );

    const unsubGenerations = getGenerationsInFolder(currentUser.uid, currentFolderId, (data) => {
    console.log("PASSO 2: Dados recebidos do Firebase:", data);
    const sortedData = data.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    setGenerations(sortedData);
    setIsLoading(false); // Desativa o loading aqui
    });

    return () => {
      unsubFolders();
      unsubGenerations();
    };

  }, [currentUser, currentFolderId]);

  const handleCreateFolder = async () => { const folderName = prompt("Digite o nome da nova pasta:"); if (folderName && folderName.trim()) { try { await createFolder(currentUser.uid, currentFolderId, folderName.trim()); toast.success(`Pasta "${folderName}" criada.`); } catch (error) { toast.error("Não foi possível criar a pasta."); console.error(error); } } };
  const handleNavigateToFolder = (folder) => { setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]); setCurrentFolderId(folder.id); };
  const handleBreadcrumbClick = (index) => { setCurrentFolderId(breadcrumbs[index].id); setBreadcrumbs(breadcrumbs.slice(0, index + 1)); };
  const handleRename = async (type, id, currentName) => { const newName = prompt(`Renomear "${currentName}":`, currentName); if (newName && newName.trim() && newName !== currentName) { try { await updateDocumentName(type === 'folder' ? 'folders' : 'generations', id, newName.trim()); toast.success("Renomeado com sucesso!"); } catch { toast.error("Falha ao renomear."); } } };
  const handleDelete = async (type, id, name) => { if (window.confirm(`Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`)) { try { if (type === 'folder') await deleteFolderAndContents(currentUser.uid, id); else await deleteGeneration(id); toast.success(`"${name}" foi excluído(a).`); } catch (err) { toast.error("Falha ao excluir."); console.error(err); } } };
  const handleOpenMoveModal = (type, id, name) => { setItemToMove({ type, id, name }); };
  const handleConfirmMove = async (destinationId) => {
    if (!itemToMove) return; const { type, id } = itemToMove;
    try {
      if (type === 'folder') await moveFolder(id, destinationId); else await moveItem('generations', id, destinationId);
      toast.success("Item movido com sucesso!");
    } catch (error) { toast.error("Falha ao mover o item."); console.error(error); } finally { setItemToMove(null); }
  };
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

    const handleDuplicate = async (itemId) => {
    const loadingToast = toast.loading('Criando cópia...');
    
    // 1. Encontrar o documento original no estado atual
    const originalDoc = generations.find(g => g.id === itemId);
    
    if (!originalDoc) {
      toast.error('Arquivo original não encontrado.', { id: loadingToast });
      return;
    }
    
    // 2. Preparar os dados para o novo documento
    const newName = `Cópia de ${originalDoc.name}`;
    // O conteúdo e o tipo são os mesmos do original
    const dataToSave = {
      ...originalDoc.content, // Espalha todo o conteúdo (topic, questions, etc.)
      type: originalDoc.type // Garante que o tipo seja copiado
    };

    try {
      // 3. Chamar a função 'saveGeneration' que já existe!
      await saveGeneration(
        currentUser.uid,
        currentFolderId, // Salva a cópia na mesma pasta atual
        newName,
        dataToSave 
      );
      toast.success('Cópia criada com sucesso!', { id: loadingToast });
    } catch (error) {
      toast.error('Não foi possível criar a cópia.', { id: loadingToast });
      console.error("Erro ao duplicar arquivo:", error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex">
      {itemToMove && <MoveItemModal item={itemToMove} onClose={() => setItemToMove(null)} onConfirmMove={handleConfirmMove} />}
      <HistorySidebar setView={setView} onOpenPremiumModal={onOpenPremiumModal} />
      <div className="flex-1 flex flex-col h-screen">
        
      <header className="flex-shrink-0 p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        {/* O container principal agora é 'relative' para posicionar o AuthHeader */}
        <div className="relative flex justify-center items-center">
          
          {/* O título volta a ficar no centro */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
              {currentFolder.id === 'root' 
                ? <HardDrive size={22} className="text-slate-600" />
                : <FolderOpen size={22} className="text-sky-600" />
              }
              <span>{currentFolder.name}</span>
            </h1>
          </div>

          {/* O AuthHeader volta a ser posicionado de forma absoluta no canto direito */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <AuthHeader onOpenPremiumModal={onOpenPremiumModal} />
          </div>
          
        </div>
      </header>

        <main className="flex-1 p-6 bg-slate-100 overflow-y-auto">
          {/* >>> MUDANÇA 3: A barra de breadcrumbs foi aprimorada <<< */}
          <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
            {/* Breadcrumbs agora dentro de um container destacado */}
            <nav className="flex items-center text-sm text-slate-600 flex-wrap gap-1.5">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  <button 
                    onClick={() => handleBreadcrumbClick(index)} 
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                    title={`Ir para ${crumb.name}`}
                  >
                    {/* Mostra ícone de casa apenas para o "Meu Drive" */}
                    {crumb.id === 'root' && <Home size={14} className="text-slate-500" />}
                    <span className={index === breadcrumbs.length - 1 ? 'font-bold text-slate-800' : ''}>
                      {crumb.name}
                    </span>
                  </button>
                  {index < breadcrumbs.length - 1 && <span className="text-slate-300 font-bold">›</span>}
                </React.Fragment>
              ))}
            </nav>
            {/* Botões de Ação */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-200 p-1 rounded-lg">
                <button onClick={() => setViewType('grid')} className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-300'}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewType('list')} className={`p-1.5 rounded ${viewType === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-300'}`}><List size={20} /></button>
              </div>
              <button onClick={handleCreateFolder} className="form-button-primary" style={{width: 'auto', padding: '0.5rem 1rem'}}>
                <FolderPlus size={18} className="mr-2"/> Criar Pasta
              </button>
            </div>
          </div>
          
          {currentFolder.id === 'root' && <InfoBox />}

          <div className="flex justify-end mb-6">

          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-sky-500" size={40} /></div>
          ) : (
            <>
              {viewType === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  
                  {/* MAP PARA AS PASTAS */}
                  {folders.map(folder => (
                    <ItemCard 
                      key={folder.id} 
                      item={folder} 
                      type="folder" // <-- ESSENCIAL: Diz ao ItemCard que ele é uma pasta
                      onClick={() => handleNavigateToFolder(folder)}
                      onRename={() => handleRename('folder', folder.id, folder.name)}
                      onDelete={() => handleDelete('folder', folder.id, folder.name)}
                      onMove={() => handleOpenMoveModal('folder', folder.id, folder.name)} // <-- ESSENCIAL: Passa os dados da pasta
                      // onDuplicate não é necessário para pastas por enquanto
                    />
                  ))}

                  {/* MAP PARA OS ARQUIVOS (GERAÇÕES) */}
                  {generations.map(gen => (
                    <ItemCard 
                      key={gen.id} 
                      item={gen} 
                      type="file" // <-- ESSENCIAL: Diz ao ItemCard que ele é um arquivo
                      onClick={() => loadGeneration(gen.content)} 
                      onRename={() => handleRename('file', gen.id, gen.name)} 
                      onDelete={() => handleDelete('file', gen.id, gen.name)} 
                      onMove={() => handleOpenMoveModal('file', gen.id, gen.name)} // <-- ESSENCIAL: Passa os dados do arquivo
                      onDuplicate={() => handleDuplicate(gen.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200">
                      <tr>
                        <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">Nome</th>
                        <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">Data de Modificação</th>
                        <th className="p-4 text-left font-semibold text-slate-600 tracking-wider">Tipo</th>
                        <th className="p-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {folders.map(folder => (<ItemListRow key={folder.id} item={folder} type="folder" onClick={() => handleNavigateToFolder(folder)} onRename={handleRename} onDelete={handleDelete} onMove={handleOpenMoveModal}/>))}
                      {generations.map(gen => (<ItemListRow key={gen.id} item={gen} type="file" onClick={() => loadGeneration(gen.content)} onRename={handleRename} onDelete={handleDelete} onMove={handleOpenMoveModal}/>))}
                    </tbody>
                  </table>
                </div>
              )}
              {!isLoading && folders.length === 0 && generations.length === 0 && (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center"><Folder size={64} className="mx-auto mb-4 text-slate-400" /><h3 className="text-2xl font-semibold text-slate-600">Pasta Vazia</h3><p className="mb-6">Comece criando uma nova pasta para organizar seus materiais.</p><button onClick={handleCreateFolder} className="form-button-primary" style={{width: 'auto', padding: '0.75rem 1.5rem'}}><FolderPlus size={18} className="mr-2"/> Criar Nova Pasta</button></div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HistoryScreen;