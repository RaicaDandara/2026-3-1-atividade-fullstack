import React, { useState } from 'react';
import { Search as SearchIcon, X, AlertCircle } from 'lucide-react';
import { Post, PostCard } from '../components/PostCard';
import { api, ApiError } from '../services/api';

export const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await api.get<Post[]>(`/posts/search?q=${encodeURIComponent(query)}`);
      setPosts(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao realizar a busca.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setPosts([]);
    setSearched(false);
  };

  return (
    <div className="space-y-4 py-1">
      {/* Barra de Pesquisa Fixa */}
      <form onSubmit={handleSearch} className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por palavras-chave ou temas..."
          className="w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 shadow-sm bg-white transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Alerta de Erro */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
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

      {/* Resultados Encontrados */}
      {!loading && searched && posts.length > 0 && (
        <div className="space-y-3">
          <div className="px-1 text-xs text-gray-500 font-semibold">
            {posts.length} {posts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para "{searchTerm}"
          </div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Nenhum Resultado */}
      {!loading && searched && posts.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2 shadow-sm">
          <p className="text-sm font-bold text-diatinf-blue-dark">Nenhum post encontrado</p>
          <p className="text-xs text-gray-500">
            Não encontramos publicações contendo o termo "{searchTerm}". Tente pesquisar por outras palavras.
          </p>
        </div>
      )}

      {/* Estado Inicial Antes da Busca */}
      {!searched && (
        <div className="bg-gradient-to-br from-diatinf-cream/50 to-white rounded-2xl border border-diatinf-yellow/30 p-6 text-center space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-diatinf-primary/10 text-diatinf-primary flex items-center justify-center mx-auto mb-2">
            <SearchIcon size={20} />
          </div>
          <h3 className="text-xs font-bold text-diatinf-blue-dark">Pesquise Publicações</h3>
          <p className="text-[11px] text-gray-600 max-w-xs mx-auto leading-relaxed">
            Busque por temas de disciplinas, avisos ou discussões acadêmicas no acervo da comunidade DIATINF.
          </p>
        </div>
      )}
    </div>
  );
};

