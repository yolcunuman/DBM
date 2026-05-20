import { useState, useEffect } from 'react';

/**
 * useToast — Galerist site içi bildirim hook'u
 * Kullanım:
 *   const { showToast, ToastUI } = useToast();
 *   showToast('Mesaj!', 'success' | 'error' | 'info');
 *   // JSX içinde: {ToastUI}
 */
export const useToast = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(p => ({ ...p, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const icons = {
    success: '✓',
    error: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/15 border-red-500/30 text-red-400',
    info: 'bg-primary/15 border-primary/30 text-primary-light',
  };

  const ToastUI = toast.show ? (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm ${colors[toast.type] || colors.info}`}
      style={{ animation: 'toastSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateY(0.75rem); opacity: 0; }
          to   { transform: translateY(0);       opacity: 1; }
        }
      `}</style>
      <span className="text-sm font-bold shrink-0">{icons[toast.type] || icons.info}</span>
      <p className="text-xs font-semibold leading-snug">{toast.message}</p>
      <button
        onClick={() => setToast(p => ({ ...p, show: false }))}
        className="ml-1 text-base opacity-60 hover:opacity-100 transition-opacity shrink-0"
      >
        ×
      </button>
    </div>
  ) : null;

  return { showToast, ToastUI };
};
