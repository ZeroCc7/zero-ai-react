
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Key, 
  MessageSquare, 
  LogOut, 
  Menu, 
  Server,
  UserCircle,
  ShieldCheck,
  Users,
  Terminal
} from 'lucide-react';
import { User } from '../types';
import { getBaseUrl } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  currentPage, 
  onNavigate 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const serverUrl = getBaseUrl().replace('/api/v1', '');

  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'chat', label: 'AI对话', icon: MessageSquare },
    { id: 'tokens', label: '模型配置', icon: Key },
    { id: 'user-tokens', label: 'API令牌', icon: Terminal },
    ...(user?.is_superuser ? [{ id: 'admin-users', label: '用户', icon: Users }] : []),
    { id: 'profile', label: '个人资料', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Server className="text-indigo-400" />
            <span>Nexus<span className="text-indigo-400">Admin</span></span>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-6 px-4 py-3 bg-slate-800 rounded-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.full_name || '用户'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${currentPage === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="truncate max-w-[300px]">已连接到 <strong>{serverUrl}</strong></span>
          </div>

          <div className="flex items-center gap-4">
             {user?.is_superuser && (
                 <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded">管理员</span>
             )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
