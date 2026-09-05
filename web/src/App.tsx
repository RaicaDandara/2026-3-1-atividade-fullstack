import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Feed } from './pages/Feed';
import { NewPost } from './pages/NewPost';
import { MyPosts } from './pages/MyPosts';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { PostDetail } from './pages/PostDetail';

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
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

