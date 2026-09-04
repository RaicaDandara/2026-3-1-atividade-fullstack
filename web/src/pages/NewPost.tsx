import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, ApiError } from '../services/api';

export const NewPost: React.FC = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const MAX_CHARS = 500;
  const charsRemaining = MAX_CHARS - content.length;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="p-3 bg-diatinf-cream/70 rounded-full text-diatinf-primary">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-base font-bold text-diatinf-blue-dark">Autenticação Necessária</h2>
        <p className="text-xs text-gray-500 max-w-xs">
          Você precisa estar conectado à sua conta para criar novas publicações.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError('A publicação não pode ser vazia.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setError(`A publicação excede o limite de ${MAX_CHARS} caracteres.`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/posts', { content: trimmed });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao publicar sua mensagem.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2 space-y-4">
      {/* Barra de Ações Superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-diatinf-blue-dark transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </button>
        <h2 className="text-sm font-bold text-diatinf-blue-dark">Nova Publicação</h2>
        <div className="w-12" /> {/* Espaçador para balancear centralização */}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulário de Criação (Regra 1: Publicações contêm apenas textos) */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-diatinf-orange text-white text-xs font-bold flex items-center justify-center shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-bold text-diatinf-blue-dark">{user?.name}</span>
            <span className="text-[11px] text-gray-400 block -mt-0.5">@{user?.username}</span>
          </div>
        </div>

        <textarea
          autoFocus
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que está acontecendo na DIATINF hoje? Compartilhe com todos..."
          maxLength={MAX_CHARS}
          className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none border-none p-0 leading-relaxed"
        />

        {/* Rodapé do Formulário: Contador e Botão de Enviar */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1.5">
            <span
              className={`text-xs font-semibold ${
                charsRemaining < 50
                  ? charsRemaining < 0
                    ? 'text-red-500'
                    : 'text-amber-500'
                  : 'text-gray-400'
              }`}
            >
              {charsRemaining} caracteres restantes
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim() || charsRemaining < 0}
            className="bg-diatinf-primary hover:bg-diatinf-orange text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            {loading ? (
              <span>Publicando...</span>
            ) : (
              <>
                <span>Publicar</span>
                <Send size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Dica da Regra 1 */}
      <div className="p-3 bg-diatinf-cream/40 rounded-xl border border-diatinf-yellow/30 text-[11px] text-gray-600">
        💡 <strong>Nota da DIATINF X</strong>: As publicações são estritamente textuais (Regra 1) para valorizar ideias, comunicados acadêmicos e debates diretos.
      </div>
    </div>
  );
};

