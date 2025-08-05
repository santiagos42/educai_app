import React from 'react';
// De 'src/components/layout/', suba dois níveis para 'src/' e então entre em 'contexts/'
import { useAuth } from '../../contexts/AuthContext'; 

// De 'src/components/layout/', suba dois níveis para 'src/' e encontre 'firebase.js'
import { logout } from '../../firebase'; 
import toast from 'react-hot-toast';
import { User, LogOut, Star } from 'lucide-react';



export default function AuthHeader({ onOpenPremiumModal }) {
  const { currentUser, userProfile } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Você saiu da sua conta.');
    } catch (error) {
      toast.error('Falha ao sair da conta.');
    }
  };

  return (
    <div className="auth-container-simple">
      {currentUser ? (
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full p-1.5 shadow-sm">
          
          {userProfile && userProfile.plan !== 'premium' && !currentUser.isAnonymous && onOpenPremiumModal && (
            <button 
              onClick={onOpenPremiumModal}
              className="px-3 py-1 text-xs font-bold bg-yellow-400 text-slate-900 rounded-full hover:bg-yellow-300 transition-all flex items-center gap-1.5"
              title="Faça upgrade para o Premium"
            >
              <Star size={14} />
              <span>Premium</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-1">
            {currentUser.isAnonymous ? (
              <div className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full"><User size={18} /></div>
            ) : (
              currentUser.photoURL ? 
              <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" /> :
              <div className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full"><User size={18} /></div>
            )}
          
          
            <span className="user-name hidden sm:block text-sm font-semibold text-slate-700 whitespace-nowrap">
              {currentUser.isAnonymous ? 'Convidado' : `Olá, ${currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Usuário'}`}
            </span>
          </div>

          <button onClick={handleLogout} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" title="Sair">
            <LogOut size={18} />
          </button>

        </div>
      ) : null}
    </div>
  );
}