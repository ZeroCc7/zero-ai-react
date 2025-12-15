
import React, { useEffect, useState } from 'react';
import { Plus, Check, X, Shield, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { LLMKey } from '../types';

export const Tokens: React.FC = () => {
  const [keys, setKeys] = useState<LLMKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [modelName, setModelName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
        const data = await api.getMyKeys();
        setKeys(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!modelName || !apiKey) return;
    setSubmitting(true);
    try {
        await api.addKey(modelName, apiKey, baseUrl || undefined);
        setIsModalOpen(false);
        resetForm();
        loadKeys();
    } catch (e) {
        alert("添加密钥失败");
        console.error(e);
    } finally {
        setSubmitting(false);
    }
  };

  const handleValidate = async (id: number) => {
      try {
          await api.validateKey(id);
          // Refresh list to show new validation status
          loadKeys();
          alert("已触发验证检查。");
      } catch (e) {
          console.error(e);
          alert("验证触发失败");
      }
  };

  const resetForm = () => {
      setModelName('');
      setApiKey('');
      setBaseUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">LLM供应商密钥</h1>
          <p className="text-slate-500">管理系统使用的外部模型（如 OpenAI、Anthropic）的 API 密钥。</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          添加供应商密钥
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">正在加载配置...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">模型/供应商</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">基础地址</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">状态</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">最后验证</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{key.model_name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {key.base_url || '默认'}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                             {key.is_valid ? (
                                 <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                                     <Check size={12} /> 已验证
                                 </span>
                             ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                    <Shield size={12} /> 未验证
                                </span>
                             )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {key.last_validated_at ? new Date(key.last_validated_at).toLocaleString() : '从未'}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleValidate(key.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 justify-end w-full"
                        >
                          <RefreshCw size={14} /> 检查
                        </button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      尚未配置供应商密钥。添加后即可使用外部模型。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-900">连接供应商</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">模型名称/供应商</label>
                <input 
                  type="text" 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="例如：gpt-4，claude-3-opus"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API密钥</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">基础地址（可选）</label>
                <input 
                  type="text" 
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleAddKey}
                disabled={!modelName || !apiKey || submitting}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? '正在保存...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
