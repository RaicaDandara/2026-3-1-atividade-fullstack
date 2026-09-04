import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, AtSign, Lock, FileText, Image, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !username.trim() || !password) {
      setError('Por favor, preencha os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        password,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao criar a conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Card Principal */}
      <div className="w-full bg-white rounded-2xl border border-diatinf-blue-light/30 p-6 shadow-sm">
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-diatinf-cream/70 text-diatinf-primary mb-2">
            <UserPlus size={28} />
          </div>
          <h2 className="text-xl font-bold text-diatinf-blue-dark">Crie sua Conta</h2>
          <p className="text-xs text-gray-500 mt-1">
            Junte-se à comunidade acadêmica do DIATINF X
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-diatinf-blue-dark mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Fernandes"
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-diatinf-blue-dark mb-1">
              Nome de Usuário (@username) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <AtSign size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: maria_ifrn"
                autoCapitalize="none"
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-diatinf-blue-dark mb-1">
              Senha (mínimo 6 caracteres) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-diatinf-blue-dark mb-1">
              Biografia / Curso (Opcional)
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-0 flex items-center pl-3 text-gray-400">
                <FileText size={18} />
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Estudante de Informática para Internet..."
                rows={2}
                maxLength={280}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 transition-colors resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-diatinf-blue-dark mb-1">
              URL da Foto de Perfil (Opcional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Image size={18} />
              </span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-diatinf-primary hover:bg-diatinf-orange text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Cadastrando...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Criar Conta</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Já possui uma conta?{' '}
            <Link
              to="/login"
              className="text-diatinf-primary font-semibold hover:underline"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

