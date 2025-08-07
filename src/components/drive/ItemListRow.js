import DropdownMenu from "../common/DropdownMenu";
import { Folder } from "lucide-react";
import toolIconMapSmall from "../common/toolIconMapSmall";

const ItemListRow = ({ item, type, onClick, onRename, onDelete, onMove, onDuplicate }) => {
  const isFolder = type === 'folder';
  const icon = isFolder 
    ? <Folder size={24} className="text-yellow-500" /> 
    : (toolIconMapSmall[item.type] || toolIconMapSmall.default);
  
  const modifiedDate = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A';

  return (
    <tr onClick={onClick} className="group hover:bg-slate-50 cursor-pointer">
      <td className={`p-4 whitespace-nowrap font-medium text-slate-900 flex items-center gap-3 ${isFolder ? 'text-sm' : 'text-xs'}`}>
        {icon}
        {item.name}
      </td>
      <td className="p-4 whitespace-nowrap text-sm text-slate-500">{modifiedDate}</td>
      <td className="p-4 whitespace-nowrap text-sm text-slate-500 capitalize">
        {type === 'folder' ? 'Pasta' : 'Arquivo Gerado'}
      </td>
      <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
        <div onClick={(e) => e.stopPropagation()}>
          {/* >>> MUDANÇAS AQUI <<< */}
          <DropdownMenu 
            itemType={type}
            onRename={onRename} 
            onDelete={onDelete} 
            onMove={onMove}
            onDuplicate={onDuplicate}
          />
        </div>
      </td>
    </tr>
  );
};

export default ItemListRow;