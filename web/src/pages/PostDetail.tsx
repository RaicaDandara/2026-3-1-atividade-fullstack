import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { Post, PostCard } from '../components/PostCard';
import { CommentData, CommentItem } from '../components/CommentItem';
import { api, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadPostAndComments = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const [postData, commentsData] = await Promise.all([
        api.get<Post>(`/posts/${id}`),
        api.get<CommentData[]>(`/posts/${id}/comments`),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível carregar a publicação.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  // Envio de comentário raiz
  const handleCreateRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!newCommentText.trim() || submittingComment || !id) return;

    setSubmittingComment(true);
    try {
      await api.post(`/posts/${id}/comments`, {
        content: newCommentText.trim(),
      });
      setNewCommentText('');
      // Recarregar comentários e atualizar contador no post
      const updatedComments = await api.get<CommentData[]>(`/posts/${id}/comments`);
      setComments(updatedComments);
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Envio de resposta encadeada (Regra 3)
  const handleReply = async (parentId: string, content: string) => {
    if (!id) return;
    await api.post(`/posts/${id}/comments`, {
      content,
      parentId,
    });
    const updatedComments = await api.get<CommentData[]>(`/posts/${id}/comments`);
    setComments(updatedComments);
    if (post) {
      setPost({ ...post, commentsCount: post.commentsCount + 1 });
    }
  };

  // Exclusão de comentário
  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;
    if (!window.confirm('Deseja excluir este comentário?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      const updatedComments = await api.get<CommentData[]>(`/posts/${id}/comments`);
      setComments(updatedComments);
      if (post) {
        setPost({ ...post, commentsCount: Math.max(0, post.commentsCount - 1) });
      }
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-8 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-32 bg-white rounded-2xl border border-gray-100 p-4" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-sm font-bold text-gray-800">{error || 'Publicação não encontrada'}</h2>
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
    <div className="py-2 space-y-4">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-diatinf-blue-dark transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Voltar</span>
      </button>

      {/* Publicação Principal */}
      <PostCard post={post} onDelete={() => navigate('/')} />

      {/* Seção de Comentários Encadeados (Regra 3) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} className="text-diatinf-primary" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-diatinf-blue-dark">
              Comentários
            </h3>
            <span className="text-[10px] bg-diatinf-cream text-diatinf-primary font-bold px-1.5 py-0.5 rounded-full">
              {post.commentsCount}
            </span>
          </div>
        </div>

        {/* Formulário de Novo Comentário Raiz */}
        {isAuthenticated ? (
          <form onSubmit={handleCreateRootComment} className="flex items-center space-x-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Escreva seu comentário sobre este post..."
              className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-diatinf-primary focus:ring-1 focus:ring-diatinf-primary transition-colors"
            />
            <button
              type="submit"
              disabled={submittingComment || !newCommentText.trim()}
              className="bg-diatinf-primary hover:bg-diatinf-orange text-white p-2 rounded-xl shadow-sm disabled:opacity-40 transition-all shrink-0"
              title="Publicar comentário"
            >
              <Send size={15} />
            </button>
          </form>
        ) : (
          <div className="p-3 bg-diatinf-cream/40 rounded-xl border border-diatinf-yellow/30 text-xs flex items-center justify-between">
            <span className="text-gray-600">Faça login para participar da discussão.</span>
            <Link
              to="/login"
              className="font-bold text-diatinf-primary hover:underline text-xs"
            >
              Entrar
            </Link>
          </div>
        )}

        {/* Lista de Comentários Encadeados */}
        {comments.length > 0 ? (
          <div className="space-y-3 pt-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-gray-400 py-6">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}
      </div>
    </div>
  );
};

