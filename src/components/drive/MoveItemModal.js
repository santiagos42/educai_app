import { useState, useEffect } from 'react';
import { Move } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUserFolders } from '../../firebase'; // Supondo que você tenha um serviço para buscar pastas

const MoveItemModal = ({ item, onClose, onConfirmMove }) => {
    const { currentUser } = useAuth();
    const [folders, setFolders] = useState([]);
    const [destinationId, setDestinationId] = useState('');

    useEffect(() => {
        const fetchFolders = async () => {
            if (currentUser) {
                const allFolders = await getAllUserFolders(currentUser.uid);
                const availableFolders = allFolders.filter(f => f.id !== item.id);
                setFolders(availableFolders);
            }
        };
        fetchFolders();
    }, [currentUser, item.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 shadow-2xl relative w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Mover Item</h2>
                <p className="text-slate-600 mb-6">
                    Mover "<strong className="truncate">{item.name}</strong>" para:
                </p>
                <div className="space-y-4">
                    <select
                        value={destinationId}
                        onChange={e => setDestinationId(e.target.value)}
                        className="form-input"
                    >
                        <option value="">Selecione um destino...</option>
                        <option value="root">Pasta Principal (Meu Drive)</option>
                        {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>
                                {folder.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="form-button-secondary w-full">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirmMove(destinationId)}
                        disabled={!destinationId}
                        className="form-button-primary w-full"
                    >
                        <Move size={18} className="mr-2" />
                        Mover Para Cá
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveItemModal;