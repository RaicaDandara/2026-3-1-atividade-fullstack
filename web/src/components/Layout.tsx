import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      {/* Container Responsivo Mobile First */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl flex flex-col justify-between border-x border-diatinf-blue-light/20 relative">
        
        {/* Header Superior Fixo */}
        <header className="sticky top-0 z-30 bg-diatinf-blue-dark text-white px-4 py-3 shadow-md flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="bg-diatinf-primary text-white font-extrabold text-xl px-2 py-0.5 rounded-lg shadow">
              X
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-diatinf-yellow leading-none">
                DIATINF X
              </span>
              <span className="text-[10px] text-diatinf-cream/80 font-medium">
                CNAT - IFRN
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center space-x-1.5 bg-diatinf-blue-dark/50 hover:bg-diatinf-blue-light/20 px-2.5 py-1 rounded-full border border-diatinf-blue-light/30 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-diatinf-orange text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-diatinf-cream font-medium max-w-[80px] truncate">
                    @{user.username}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  title="Sair da conta"
                  className="p-1.5 text-diatinf-cream/70 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-diatinf-primary hover:bg-diatinf-orange text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm"
              >
                <LogIn size={14} />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </header>

        {/* Área Central de Conteúdo */}
        <main className="flex-1 p-4 pb-20 overflow-y-auto">
          {children}
        </main>

        {/* Barra de Navegação Inferior Mobile First (Regra 2) */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-2 flex items-center justify-between z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <Link
            to="/"
            className={`flex flex-col items-center transition-colors ${
              isActive('/') ? 'text-diatinf-primary' : 'text-gray-400 hover:text-diatinf-blue-dark'
            }`}
            title="Início"
          >
            <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-0.5">Início</span>
          </Link>

          <Link
            to="/search"
            className={`flex flex-col items-center transition-colors ${
              isActive('/search') ? 'text-diatinf-primary' : 'text-gray-400 hover:text-diatinf-blue-dark'
            }`}
            title="Pesquisar"
          >
            <Search size={22} strokeWidth={isActive('/search') ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-0.5">Pesquisa</span>
          </Link>

          {/* Botão Central de Nova Publicação */}
          <Link
            to="/new-post"
            className="flex flex-col items-center -mt-6 bg-gradient-to-tr from-diatinf-primary to-diatinf-orange text-white p-3.5 rounded-full shadow-lg hover:shadow-diatinf-primary/30 active:scale-95 transition-transform"
            title="Nova Publicação"
          >
            <PlusCircle size={26} strokeWidth={2.2} />
          </Link>

          <Link
            to="/my-posts"
            className={`flex flex-col items-center transition-colors ${
              isActive('/my-posts') ? 'text-diatinf-primary' : 'text-gray-400 hover:text-diatinf-blue-dark'
            }`}
            title="Minhas Publicações"
          >
            <MessageSquare size={22} strokeWidth={isActive('/my-posts') ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-0.5">Meus Posts</span>
          </Link>

          <Link
            to={isAuthenticated && user ? `/profile/${user.username}` : '/login'}
            className={`flex flex-col items-center transition-colors ${
              (user && isActive(`/profile/${user.username}`)) || isActive('/login')
                ? 'text-diatinf-primary'
                : 'text-gray-400 hover:text-diatinf-blue-dark'
            }`}
            title="Meu Perfil"
          >
            <UserIcon
              size={22}
              strokeWidth={
                (user && isActive(`/profile/${user.username}`)) || isActive('/login') ? 2.5 : 2
              }
            />
            <span className="text-[10px] font-medium mt-0.5">Perfil</span>
          </Link>
        </nav>

      </div>
    </div>
  );
};

