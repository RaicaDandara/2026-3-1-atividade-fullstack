import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Edit3, MessageCircle, AlertCircle } from 'lucide-react';
import { Post, PostCard } from '../components/PostCard';
import { api, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  const loadFeed = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await api.get<Post[]>('/posts/feed');
      setPosts(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível carregar o feed de publicações.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [user]);

  const handleDeletePost = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  return (
    <div className="space-y-4 py-1">
      {/* Barra de Publicação Rápida no Topo (se autenticado) */}
      {isAuthenticated && user ? (
        <Link
          to="/new-post"
          className="flex items-center space-x-3 bg-white border border-gray-100 p-3.5 rounded-2xl shadow-sm hover:border-diatinf-primary/30 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-diatinf-orange text-white text-xs font-bold flex items-center justify-center shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400 flex-1 group-hover:text-gray-600 transition-colors">
            Compartilhe uma ideia ou aviso com a DIATINF...
          </span>
          <div className="p-1.5 rounded-full bg-diatinf-cream/70 text-diatinf-primary">
            <Edit3 size={16} />
          </div>
        </Link>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-diatinf-cream/70 to-diatinf-cream/20 border border-diatinf-yellow/40 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-diatinf-blue-dark">Comunidade DIATINF X</h3>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Entre com sua conta para publicar e avaliar posts com estrelas.
            </p>
          </div>
          <Link
            to="/login"
            className="bg-diatinf-primary hover:bg-diatinf-orange text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors shrink-0 ml-2"
          >
            Entrar
          </Link>
        </div>
      )}

      {/* Cabeçalho do Feed e Botão de Atualizar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
            {isAuthenticated ? 'Publicações de Colegas' : 'Feed Geral'}
          </h2>
          <span className="text-[10px] bg-diatinf-cream text-diatinf-primary font-bold px-1.5 py-0.5 rounded-full">
            {posts.length}
          </span>
        </div>

        <button
          onClick={() => loadFeed(true)}
          disabled={loading || refreshing}
          className="p-1.5 text-gray-400 hover:text-diatinf-primary hover:bg-white rounded-full transition-all"
          title="Recarregar feed"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-diatinf-primary' : ''} />
        </button>
      </div>

      {/* Tratamento de Erro */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadFeed()}
            className="font-bold underline hover:text-red-900"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Skeleton de Carregamento */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-3"
            >
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/5" />
                </div>
              </div>
              <div className="h-10 bg-gray-100 rounded-lg" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Lista de Publicações */}
      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && posts.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-diatinf-cream/80 text-diatinf-primary flex items-center justify-center mx-auto">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-sm text-diatinf-blue-dark">Nenhum post no momento</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {isAuthenticated
              ? 'A tela inicial exibe posts de outros usuários (Regra 2). Seus próprios posts podem ser vistos na aba "Meus Posts"!'
              : 'Seja o primeiro a publicar algo interessante na comunidade DIATINF X.'}
          </p>
          <div className="pt-2">
            <Link
              to={isAuthenticated ? '/new-post' : '/login'}
              className="inline-flex items-center space-x-1.5 bg-diatinf-primary hover:bg-diatinf-orange text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <span>{isAuthenticated ? 'Criar primeira publicação' : 'Entrar para postar'}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

