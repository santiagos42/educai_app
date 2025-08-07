import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Move, TrashIcon, CopyPlus } from 'lucide-react'; // Dependências para ícones

const DropdownMenu = ({ itemType, onRename, onDelete, onMove, onDuplicate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={menuRef}>
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1 rounded-full hover:bg-slate-200">
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
          {/* >>> NOVA OPÇÃO DE DUPLICAR (só aparece para arquivos) <<< */}
          {itemType === 'file' && (
            <button onClick={() => { onDuplicate(); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
              <CopyPlus size={14} className="mr-2"/> Fazer uma cópia
            </button>
          )}

          <button onClick={() => { onRename(); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <Edit size={14} className="mr-2"/> Renomear
          </button>
          <button onClick={() => { onMove(); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <Move size={14} className="mr-2"/> Mover
          </button>
          <button onClick={() => { onDelete(); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <TrashIcon size={14} className="mr-2"/> Excluir
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;