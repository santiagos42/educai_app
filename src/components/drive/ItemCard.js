import DropdownMenu from "../common/DropdownMenu";
import { Folder } from "lucide-react";
import toolIconMap from "../common/toolIconMap"; // Importa o mapa de ícones

const ItemCard = ({ item, type, onClick, onRename, onDelete, onMove, onDuplicate }) => {
  const isFolder = type === 'folder';
  const icon = isFolder 
    ? <Folder size={48} className="text-yellow-500" fill="rgba(234, 179, 8, 0.2)" /> 
    : (toolIconMap[item.type] || toolIconMap.default);

  return (
    <div onClick={onClick} className="group relative flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer aspect-square">
      <div className="mb-2">{icon}</div>
      <p 
        className={`text-center font-semibold text-slate-700 break-all w-full px-1 truncate ${isFolder ? 'text-sm' : 'text-xs'}`} 
        title={item.name}
      >
        {item.name}
      </p>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {/* >>> MUDANÇAS AQUI <<< */}
        <DropdownMenu 
          itemType={type} 
          onRename={onRename} 
          onDelete={onDelete} 
          onMove={onMove}
          onDuplicate={onDuplicate}
        />
      </div>
    </div>
  );
};

export default ItemCard;