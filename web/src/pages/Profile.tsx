import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageSquare, FileText, AlertCircle } from 'lucide-react';
import { Post, PostCard } from '../components/PostCard';
import { api, ApiError } from '../services/api';
import { User } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfileData() {
      if (!username) return;
      setLoading(true);
      setError(null);

      try {
        const [userData, userPosts] = await Promise.all([
          api.get<User>(`/users/profile/${username}`),
          api.get<Post[]>(`/posts/user/${username}`),
        ]);
        setProfileUser(userData);
        setPosts(userPosts);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar o perfil.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [username]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-40 bg-white rounded-2xl border border-gray-100 p-4" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-sm font-bold text-gray-800">{error || 'Usuário não encontrado.'}</h2>
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold text-diatinf-primary hover:underline block mx-auto"
        >
          Voltar para o Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-diatinf-blue-dark transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Voltar</span>
      </button>

      {/* Cartão de Perfil Público (Regra 5: Perfis são sempre públicos) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-diatinf-primary to-diatinf-orange text-white text-2xl font-black flex items-center justify-center shadow-md overflow-hidden shrink-0">
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt={profileUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              profileUser.name.charAt(0).toUpperCase()
            )}
          </div>

          <span className="text-[10px] bg-diatinf-cream text-diatinf-primary font-bold px-2 py-0.5 rounded-full border border-diatinf-yellow/30 uppercase tracking-wider">
            Perfil Público
          </span>
        </div>

        <div>
          <h2 className="text-base font-extrabold text-diatinf-blue-dark">{profileUser.name}</h2>
          <span className="text-xs text-gray-400 block -mt-0.5">@{profileUser.username}</span>
        </div>

        {/* Biografia */}
        {profileUser.bio ? (
          <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
            {profileUser.bio}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">Nenhuma biografia informada.</p>
        )}

        {/* Data de Entrada */}
        <div className="flex items-center space-x-1.5 text-xs text-gray-400">
          <Calendar size={14} />
          <span>Ingressou em {formatDate(profileUser.createdAt)}</span>
        </div>

        {/* Estatísticas de Atividade */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <div className="bg-slate-50 p-2.5 rounded-xl text-center">
            <span className="text-base font-black text-diatinf-primary">
              {profileUser._count?.posts ?? posts.length}
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">Publicações</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl text-center">
            <span className="text-base font-black text-diatinf-orange">
              {profileUser._count?.comments ?? 0}
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">Comentários Feitos</span>
          </div>
        </div>
      </div>

      {/* Seção de Publicações do Autor */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <FileText size={16} className="text-diatinf-primary" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-600">
            Publicações de {profileUser.name.split(' ')[0]}
          </h3>
          <span className="text-[10px] bg-diatinf-cream text-diatinf-primary font-bold px-1.5 py-0.5 rounded-full">
            {posts.length}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <MessageSquare size={18} />
            </div>
            <p className="text-xs text-gray-500">Este usuário ainda não realizou publicações.</p>
          </div>
        )}
      </div>
    </div>
  );
};

