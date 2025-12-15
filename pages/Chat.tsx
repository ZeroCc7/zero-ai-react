
import React, { useEffect, useState, useRef } from 'react';
import { Send, Plus, MessageSquare, Bot, User, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Conversation, Message } from '../types';

export const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastChunkRef = useRef<string>('');
  const accumRef = useRef<string>('');

  useEffect(() => {
    loadConversations();
    loadModels();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
        setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  };

  const loadModels = async () => {
    try {
      const keys = await api.getMyKeys();
      const names = Array.from(new Set(keys.filter(k => k.is_active).map(k => k.model_name)));
      setModels(names);
      if (names.length > 0) {
        setSelectedModel(names[0]);
      }
    } catch (e) {
    }
  };

  const loadMessages = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getMessages(id);
      setMessages(data.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    const title = `新会话 ${new Date().toLocaleTimeString()}`;
    try {
      const newConv = await api.createConversation(title);
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    const userMsgText = inputText;
    setInputText('');
    
    // Optimistic update
    const tempUserMsg: Message = {
        id: Date.now(),
        role: 'user',
        content: userMsgText,
        conversation_id: activeConversationId,
        created_at: new Date().toISOString()
    };
    
    const tempAiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        conversation_id: activeConversationId,
        created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg, tempAiMsg]);
    setStreaming(true);

    try {
        accumRef.current = '';
        lastChunkRef.current = '';
        const stream = api.streamChat(activeConversationId, userMsgText, selectedModel || 'gpt-3.5-turbo');
        for await (const chunk of stream) {
            let text = '';
            if (typeof chunk === 'string') {
                text = chunk;
            } else if ((chunk as any).content) {
                text = (chunk as any).content;
            } else if ((chunk as any).choices?.[0]?.delta?.content) {
                text = (chunk as any).choices[0].delta.content;
            } else if ((chunk as any).delta?.content) {
                text = (chunk as any).delta.content;
            }
            if (!text) continue;

            let delta = '';
            const prev = accumRef.current;
            if (text.length >= prev.length && text.startsWith(prev)) {
                delta = text.slice(prev.length);
                accumRef.current = text;
            } else {
                delta = text;
                accumRef.current = prev + delta;
            }
            if (!delta) continue;

            setMessages(prevMsgs => {
                const newArr = [...prevMsgs];
                const last = newArr[newArr.length - 1];
                if (last && last.role === 'assistant') {
                    last.content += delta;
                }
                return newArr;
            });
        }
    } catch (err) {
        console.error("Stream error", err);
        setMessages(prev => {
            const newArr = [...prev];
            const last = newArr[newArr.length - 1];
            if (last.role === 'assistant') {
                last.content += "\n[生成回复出错]";
            }
            return newArr;
        });
    } finally {
        setStreaming(false);
        // Reload messages to get real IDs/Cost etc.
        // loadMessages(activeConversationId); // Optional: Sync with backend
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <button 
            onClick={handleCreateConversation}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            新建会话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`w-full px-3 py-2.5 rounded-lg text-sm truncate transition-colors flex items-center gap-2 justify-between ${
                activeConversationId === conv.id 
                  ? 'bg-white shadow-sm text-indigo-600 font-medium' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <button className="flex items-center gap-2 flex-1 text-left" onClick={() => setActiveConversationId(conv.id)}>
                <MessageSquare size={16} className={activeConversationId === conv.id ? 'text-indigo-500' : 'text-slate-400'} />
                <span className="truncate">{conv.title}</span>
              </button>
              <button
                className="p-2 text-slate-400 hover:text-red-600"
                disabled={streaming}
                onClick={async () => {
                  if (!window.confirm('确认删除该会话？')) return;
                  try {
                    if (activeConversationId === conv.id) {
                      setActiveConversationId(null);
                      setMessages([]);
                    }
                    await api.deleteConversation(conv.id);
                    const next = conversations.filter(c => c.id !== conv.id);
                    setConversations(next);
                  } catch (err) {
                    alert('删除会话失败');
                  }
                }}
                title="删除会话"
              >
                🗑️
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-10">暂无历史</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversationId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {loading && messages.length === 0 ? (
                  <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-slate-400"/></div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Bot size={18} className="text-indigo-600" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <User size={18} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-3 bg-white border border-slate-300 rounded-xl text-sm"
                  disabled={streaming}
                >
                  {models.length === 0 ? (
                    <option value="gpt-3.5-turbo">默认: gpt-3.5-turbo</option>
                  ) : (
                    models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  )}
                </select>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  disabled={streaming}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || streaming}
                  className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
                <button
                  type="button"
                  onClick={loadModels}
                  className="px-3 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                  title="刷新模型列表"
                >
                  <RefreshCw size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 text-slate-300" />
            <p>选择一个会话或新建会话开始聊天。</p>
          </div>
        )}
      </div>
    </div>
  );
};
