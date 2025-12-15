import React, { createContext, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  text: string;
  ttl?: number;
}

interface ToastContextValue {
  push: (t: { type: ToastType; text: string; ttl?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = (t: { type: ToastType; text: string; ttl?: number }) => {
    const id = Date.now() + Math.random();
    const ttl = t.ttl ?? 3000;
    const item: ToastItem = { id, type: t.type, text: t.text, ttl };
    setItems(prev => [...prev, item]);
    window.setTimeout(() => {
      setItems(prev => prev.filter(x => x.id !== id));
    }, ttl);
  };

  const remove = (id: number) => {
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const value = useMemo<ToastContextValue>(() => ({ push }), [items]);

  const iconFor = (type: ToastType) => {
    if (type === 'success') return <CheckCircle size={16} />;
    if (type === 'error') return <AlertCircle size={16} />;
    if (type === 'warning') return <AlertTriangle size={16} />;
    return <Info size={16} />;
  };

  const styleFor = (type: ToastType) => {
    if (type === 'success') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (type === 'error') return 'bg-red-50 text-red-700 border border-red-200';
    if (type === 'warning') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 space-y-2 w-[320px]">
          {items.map(item => (
            <div key={item.id} className={`flex items-start gap-2 rounded-lg px-3 py-2 shadow-sm ${styleFor(item.type)}`}>
              <div className="mt-0.5">{iconFor(item.type)}</div>
              <div className="text-sm flex-1">{item.text}</div>
              <button onClick={() => remove(item.id)} className="p-1 rounded hover:bg-black/5">
                <X size={14} className="text-slate-500" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

