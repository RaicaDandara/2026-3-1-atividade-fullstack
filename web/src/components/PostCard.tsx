import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Trash2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  commentsCount: number;
  ratingsCount: number;
  averageRating: number;
  userRating: number | null;
}

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAuthor = user?.id === post.author.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Deseja realmente excluir esta publicação?')) {
      return;
    }

    try {
      await api.delete(`/posts/${post.id}`);
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (err) {
      console.error('Erro ao excluir post:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <article
      onClick={() => navigate(`/post/${post.id}`)}
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-diatinf-blue-light/40 transition-all cursor-pointer space-y-3"
    >
      {/* Cabeçalho do Autor */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <Link
            to={`/profile/${post.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-diatinf-primary to-diatinf-orange text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0 overflow-hidden"
          >
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              post.author.name.charAt(0).toUpperCase()
            )}
          </Link>

          <div>
            <Link
              to={`/profile/${post.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-sm text-diatinf-blue-dark hover:underline flex items-center space-x-1"
            >
              <span>{post.author.name}</span>
            </Link>
            <span className="text-xs text-gray-400">@{post.author.username}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-400">{formatDate(post.createdAt)}</span>
          {isAuthor && (
            <button
              onClick={handleDelete}
              title="Excluir publicação"
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Textual Exclusivo (Regra 1: Publicações contêm apenas textos) */}
      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words font-normal">
        {post.content}
      </p>

      {/* Barra Inferior com Avaliação e Comentários */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between pt-2 border-t border-gray-100"
      >
        {/* Avaliação de 1 a 3 estrelas (Regra 4) */}
        <StarRating
          postId={post.id}
          initialAverage={post.averageRating}
          initialCount={post.ratingsCount}
          initialUserRating={post.userRating}
        />

        {/* Link para Comentários */}
        <button
          onClick={() => navigate(`/post/${post.id}`)}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-diatinf-primary font-medium transition-colors"
          title="Ver comentários"
        >
          <MessageSquare size={16} />
          <span>{post.commentsCount}</span>
        </button>
      </div>
    </article>
  );
};

