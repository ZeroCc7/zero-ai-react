
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tokens } from './pages/Tokens';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { AdminUsers } from './pages/AdminUsers';
import { UserTokens } from './pages/UserTokens';
import { api, setApiUrl, getBaseUrl } from './services/api';
import { User } from './types';
import { Server, Lock, UserPlus, Settings } from 'lucide-react';

const AuthPage = ({ onLogin }: { onLogin: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('nexus_api_url') || 'http://localhost:8000');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Update API URL before request
    setApiUrl(serverUrl);

    try {
      if (isLogin) {
        const response = await api.login(email, password);
        localStorage.setItem('access_token', response.access_token);
        onLogin();
      } else {
        await api.register(email, password, fullName);
        // Auto login after register
        const response = await api.login(email, password);
        localStorage.setItem('access_token', response.access_token);
        onLogin();
      }
    } catch (err: any) {
      console.error(err);
      let msg = '认证失败';
      try {
        const parsed = JSON.parse(err.message);
        msg = parsed.detail || msg;
        if (typeof msg === 'object') msg = JSON.stringify(msg);
      } catch {
        msg = err.message || msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Server className="text-white" size={24} />
            </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Nexus 管理台</h1>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? '登录账户' : '创建新账户'}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="张三"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">邮箱地址</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {showSettings && (
             <div className="pt-2 pb-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">后端地址</label>
                <input 
                  type="text" 
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono text-slate-600"
                  placeholder="http://localhost:8000"
                />
                <p className="text-xs text-slate-400 mt-1">请填写正在运行的后端地址。</p>
             </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
                <>
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 {isLogin ? '正在登录...' : '正在创建账户...'}
                </>
            ) : (
                <>
                {isLogin ? <Lock size={18} /> : <UserPlus size={18} />}
                {isLogin ? '登录' : '创建账户'}
                </>
            )}
          </button>
        </form>
        
        <div className="mt-6 flex flex-col gap-3 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isLogin ? '没有账户？注册' : '已有账户？登录'}
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
          >
            <Settings size={12} />
            {showSettings ? '隐藏服务器设置' : '配置服务器'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (e) {
      console.error("Failed to fetch user", e);
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setInitializing(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    fetchUser();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (initializing) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!user) {
    return <AuthPage onLogin={handleLoginSuccess} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'chat' && <Chat />}
      {currentPage === 'tokens' && <Tokens />}
      {currentPage === 'user-tokens' && <UserTokens />}
      {currentPage === 'admin-users' && user.is_superuser && <AdminUsers />}
      {currentPage === 'profile' && <Profile user={user} onUpdate={fetchUser} />}
    </Layout>
  );
}
