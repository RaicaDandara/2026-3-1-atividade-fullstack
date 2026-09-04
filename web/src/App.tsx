import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Feed } from './pages/Feed';
import { NewPost } from './pages/NewPost';
import { MessageSquare } from 'lucide-react';

// Placeholder para rotas seguintes
const PagePlaceholder: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-3">
    <div className="p-3 bg-diatinf-cream/70 rounded-full text-diatinf-primary">
      <MessageSquare size={32} />
    </div>
    <h2 className="text-lg font-bold text-diatinf-blue-dark">{title}</h2>
    <p className="text-xs text-gray-500 max-w-xs">{desc}</p>
    <Link
      to="/"
      className="mt-2 text-xs font-bold text-diatinf-primary hover:underline"
    >
      Voltar para o início
    </Link>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/new-post" element={<NewPost />} />
            <Route
              path="/my-posts"
              element={
                <PagePlaceholder
                  title="Minhas Publicações"
                  desc="Esta funcionalidade será entregue na Etapa 6."
                />
              }
            />
            <Route
              path="/search"
              element={
                <PagePlaceholder
                  title="Pesquisar Publicações"
                  desc="Esta funcionalidade será entregue na Etapa 6."
                />
              }
            />
            <Route
              path="/profile/:username"
              element={
                <PagePlaceholder
                  title="Perfil Público"
                  desc="Esta funcionalidade será entregue na Etapa 6."
                />
              }
            />
            <Route
              path="/post/:id"
              element={
                <PagePlaceholder
                  title="Detalhes da Publicação e Comentários"
                  desc="A exibição encadeada de comentários será entregue na Etapa 6."
                />
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

