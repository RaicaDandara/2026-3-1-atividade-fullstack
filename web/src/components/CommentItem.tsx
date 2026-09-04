import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CornerDownRight, Trash2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface CommentData {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  replies: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onDelete,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isAuthor = user?.id === comment.authorId;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Erro ao enviar resposta encadeada:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="text-xs space-y-2">
      {/* Corpo do Comentário */}
      <div className="bg-gray-50 hover:bg-slate-50 border border-gray-100 p-3 rounded-xl transition-colors space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              to={`/profile/${comment.author.username}`}
              className="w-6 h-6 rounded-full bg-diatinf-orange text-white text-[10px] font-bold flex items-center justify-center shrink-0"
            >
              {comment.author.avatarUrl ? (
                <img
                  src={comment.author.avatarUrl}
                  alt={comment.author.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                comment.author.name.charAt(0).toUpperCase()
              )}
            </Link>
            <Link
              to={`/profile/${comment.author.username}`}
              className="font-bold text-diatinf-blue-dark hover:underline"
            >
              {comment.author.name}
            </Link>
            <span className="text-[10px] text-gray-400">@{comment.author.username}</span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] text-gray-400">{formatDate(comment.createdAt)}</span>
          </div>

          {isAuthor && (
            <button
              onClick={() => onDelete(comment.id)}
              title="Excluir comentário"
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Texto do Comentário */}
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed pl-8">
          {comment.content}
        </p>

        {/* Ação de Responder (Regra 3: Comentários encadeados) */}
        <div className="pl-8 pt-1">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
                return;
              }
              setShowReplyForm(!showReplyForm);
            }}
            className="inline-flex items-center space-x-1 text-[11px] font-semibold text-diatinf-primary hover:text-diatinf-orange transition-colors"
          >
            <CornerDownRight size={13} />
            <span>Responder</span>
          </button>
        </div>
      </div>

      {/* Formulário de Resposta Encadeada Inline */}
      {showReplyForm && (
        <form onSubmit={handleSendReply} className="pl-6 flex items-center space-x-2">
          <input
            type="text"
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Respondendo a @${comment.author.username}...`}
            className="flex-1 bg-white text-xs border border-diatinf-primary/40 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-diatinf-primary"
          />
          <button
            type="submit"
            disabled={submitting || !replyText.trim()}
            className="bg-diatinf-primary hover:bg-diatinf-orange text-white p-1.5 rounded-xl shadow-sm disabled:opacity-40 transition-all"
          >
            <Send size={13} />
          </button>
          <button
            type="button"
            onClick={() => setShowReplyForm(false)}
            className="text-[11px] text-gray-400 hover:text-gray-600 px-1"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Renderização Recursiva de Respostas Encadeadas (Filhos) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-3.5 border-l-2 border-diatinf-orange/20 space-y-2 ml-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

