
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { UserCircle, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
        await api.updateMe({
            full_name: fullName,
            email: email,
            ...(password ? { password } : {})
        });
        setMessage({ type: 'success', text: '资料更新成功' });
        setPassword('');
        onUpdate();
    } catch (err: any) {
        setMessage({ type: 'error', text: '资料更新失败' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">用户资料</h1>
        <p className="text-slate-500">管理您的个人账户信息。</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
            <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <UserCircle size={40} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900">{user.full_name || '用户'}</h3>
                <p className="text-slate-500">{user.email}</p>
                <div className="mt-1 flex gap-2">
                     <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">启用</span>
                     {user.is_superuser && <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">超级用户</span>}
                </div>
            </div>
        </div>

        {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                {message.text}
            </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">姓名</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">邮箱地址</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <h4 className="text-sm font-bold text-slate-900 mb-4">安全</h4>
             <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">新密码（可选）</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="留空则保持原密码"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
          </div>

          <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
              >
                {loading ? '正在保存...' : (
                    <>
                    <Save size={18} />
                    保存更改
                    </>
                )}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};
