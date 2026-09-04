import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Post, PostCard } from '../components/PostCard';
import { api, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const MyPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const loadMyPosts = async (isRefresh = false) => {
    if (!isAuthenticated) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await api.get<Post[]>('/posts/my');
      setPosts(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível carregar suas publicações.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMyPosts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleDeletePost = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="p-3 bg-diatinf-cream/70 rounded-full text-diatinf-primary">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-base font-bold text-diatinf-blue-dark">Faça Login para Acessar</h2>
        <p className="text-xs text-gray-500 max-w-xs">
          Você precisa estar conectado à sua conta para visualizar e gerenciar suas publicações.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-diatinf-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-diatinf-orange transition-colors"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  // Estatísticas do Usuário
  const totalComments = posts.reduce((acc, p) => acc + p.commentsCount, 0);
  const totalRatings = posts.reduce((acc, p) => acc + p.ratingsCount, 0);

  return (
    <div className="space-y-4 py-1">
      {/* Cabeçalho de Minhas Publicações */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-extrabold text-diatinf-blue-dark">Minhas Publicações</h2>
          <p className="text-[11px] text-gray-500">
            Gerencie todas as publicações criadas por você (@{user?.username})
          </p>
        </div>

        <button
          onClick={() => loadMyPosts(true)}
          disabled={loading || refreshing}
          className="p-1.5 text-gray-400 hover:text-diatinf-primary hover:bg-white rounded-full transition-all"
          title="Recarregar"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-diatinf-primary' : ''} />
        </button>
      </div>

      {/* Cartões de Estatísticas Rápidas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
          <span className="text-lg font-black text-diatinf-primary">{posts.length}</span>
          <span className="text-[10px] text-gray-400 block font-medium">Posts</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
          <span className="text-lg font-black text-diatinf-orange">{totalComments}</span>
          <span className="text-[10px] text-gray-400 block font-medium">Comentários</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
          <span className="text-lg font-black text-diatinf-blue-dark">{totalRatings}</span>
          <span className="text-[10px] text-gray-400 block font-medium">Avaliações</span>
        </div>
      </div>

      {/* Alerta de Erro */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Lista de Publicações do Usuário */}
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
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-sm text-diatinf-blue-dark">Você ainda não publicou nada</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Compartilhe mensagens, ideias e avisos com a comunidade DIATINF.
          </p>
          <div className="pt-2">
            <Link
              to="/new-post"
              className="inline-flex items-center space-x-1.5 bg-diatinf-primary hover:bg-diatinf-orange text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <PlusCircle size={15} />
              <span>Criar minha primeira publicação</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

