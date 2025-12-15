
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, Terminal, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { UserApiToken } from '../types';

export const UserTokens: React.FC = () => {
  const [tokens, setTokens] = useState<UserApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const data = await api.getUserTokens();
      setTokens(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const newToken = await api.createUserToken(name);
      if (newToken.token) {
        setCreatedToken(newToken.token);
      }
      setName('');
      loadTokens();
    } catch (e) {
      alert('创建令牌失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确认删除？该操作不可撤销。')) return;
    try {
      await api.deleteUserToken(id);
      loadTokens();
    } catch (e) {
      alert('删除令牌失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">开发者 API 令牌</h1>
        <p className="text-slate-500">
          生成令牌以便从脚本或应用程序访问 ZFGA API。
        </p>
      </div>

      {/* Creation Area */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">创建新令牌</h3>
        <form onSubmit={handleCreate} className="flex gap-4">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="令牌名称（例如：我的Python脚本）"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              type="submit"
              disabled={!name}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} />
              生成
            </button>
        </form>
        
        {createdToken && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <Terminal size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-emerald-800 mb-1">令牌生成成功</h4>
                        <p className="text-sm text-emerald-700 mb-3">
                            请立即复制令牌，出于安全原因，后续不会再次显示。
                        </p>
                        <div className="flex items-center gap-2 bg-white border border-emerald-200 p-2 rounded-md">
                            <code className="flex-1 font-mono text-sm text-emerald-900 break-all">
                                {createdToken}
                            </code>
                            <button 
                              onClick={() => navigator.clipboard.writeText(createdToken)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="复制到剪贴板"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                        <button onClick={() => setCreatedToken(null)} className="text-emerald-500 hover:text-emerald-700">
                        关闭
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* List Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">有效令牌</h3>
        </div>
        
        {loading ? (
            <div className="p-8 text-center text-slate-500">正在加载令牌...</div>
        ) : (
            <div className="divide-y divide-slate-100">
                {tokens.map(token => (
                    <div key={token.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-slate-900">{token.name}</span>
                                {token.is_active ? (
                                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">启用</span>
                                ) : (
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">停用</span>
                                )}
                            </div>
                            <div className="text-sm text-slate-500 font-mono">
                                前缀：{token.token_prefix}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                创建于：{new Date(token.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDelete(token.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {tokens.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                            <Terminal size={24} className="text-slate-400" />
                        </div>
                        <h4 className="text-slate-900 font-medium">未找到 API 令牌</h4>
                        <p className="text-slate-500 text-sm mt-1">创建令牌后即可开始构建。</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
