import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
    error: <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900',
    error: 'border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900',
    info: 'border-brand-200 dark:border-brand-800/80 bg-white dark:bg-slate-900'
  };

  return (
    <div className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start justify-between space-x-3 transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 ${borders[toast.type]}`}>
      <div className="flex items-start space-x-2.5">
        {icons[toast.type]}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {toast.message}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
