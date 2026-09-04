import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao realizar o login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Card Principal */}
      <div className="w-full bg-white rounded-2xl border border-diatinf-blue-light/30 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-diatinf-cream/70 text-diatinf-primary mb-3">
            <LogIn size={28} />
          </div>
          <h2 className="text-xl font-bold text-diatinf-blue-dark">Acesse sua Conta</h2>
          <p className="text-xs text-gray-500 mt-1">
            Entre para publicar e interagir na comunidade DIATINF X
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-diatinf-blue-dark mb-1">
              Nome de Usuário
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: joao_silva"
                autoCapitalize="none"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-diatinf-blue-dark mb-1">
              Senha
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
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-diatinf-primary focus:ring-2 focus:ring-diatinf-primary/20 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-diatinf-primary hover:bg-diatinf-orange text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Ainda não possui uma conta?{' '}
            <Link
              to="/register"
              className="text-diatinf-primary font-semibold hover:underline"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

