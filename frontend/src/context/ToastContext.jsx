import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
  }, []);

  const toast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const helpers = {
    success: (msg, d) => toast(msg, 'success', d),
    error:   (msg, d) => toast(msg, 'error', d),
    info:    (msg, d) => toast(msg, 'info', d),
    warning: (msg, d) => toast(msg, 'warning', d),
  };

  return (
    <ToastContext.Provider value={helpers}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={`toast toast-${t.type} animate-fade-up`}>
              <Icon className="w-4 h-4 shrink-0" />
              <p className="flex-1 text-sm">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-1 opacity-70 hover:opacity-100 transition-opacity shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
