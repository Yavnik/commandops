'use client';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { setGlobalToast } from '@/lib/toast-helper';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Date.now().toString();
      const newToast = { ...toast, id };
      setToasts(prev => [...prev, newToast]);

      // Auto-remove after duration
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    },
    [removeToast]
  );

  // Register global toast function
  useEffect(() => {
    setGlobalToast(addToast);
    return () => setGlobalToast(null);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[60] toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`relative p-4 pr-12 rounded-lg shadow-lg border transition-all duration-300 ease-in-out animate-in slide-in-from-right-full backdrop-blur-md ${
              toast.type === 'success'
                ? 'toast-success bg-[var(--color-secondary)] border-[var(--color-success)] text-[var(--color-success)]'
                : toast.type === 'error'
                  ? 'toast-error bg-[var(--color-secondary)] border-[var(--color-danger)] text-[var(--color-danger)]'
                  : 'bg-[var(--color-secondary)] border-[var(--color-border)] text-[var(--color-primary-text)]'
            }`}
          >
            <div className="font-mono text-sm">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-sm hover:bg-[var(--color-border)] transition-colors font-mono text-xs text-[var(--color-secondary-text)] hover:text-[var(--color-primary-text)]"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
