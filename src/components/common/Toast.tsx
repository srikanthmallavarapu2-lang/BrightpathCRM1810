import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItemData {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastItemData;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          bgColor: '#ffffff',
          borderColor: '#10b981',
          iconColor: '#059669',
          titleColor: '#065f46',
          defaultTitle: 'Success',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: '#ffffff',
          borderColor: '#ef4444',
          iconColor: '#dc2626',
          titleColor: '#991b1b',
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: '#ffffff',
          borderColor: '#f59e0b',
          iconColor: '#d97706',
          titleColor: '#92400e',
          defaultTitle: 'Warning',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: '#ffffff',
          borderColor: '#2563eb',
          iconColor: '#2563eb',
          titleColor: '#1e40af',
          defaultTitle: 'Notification',
        };
    }
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <div
      className="toast-item fade-in-slide"
      style={{
        background: config.bgColor,
        borderLeft: `4px solid ${config.borderColor}`,
        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem',
        minWidth: '280px',
        maxWidth: '420px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        borderTop: '1px solid var(--border-subtle)',
        borderRight: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        pointerEvents: 'auto',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ color: config.iconColor, flexShrink: 0, marginTop: '2px' }}>
        <Icon size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h5
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: config.titleColor,
            marginBottom: '2px',
          }}
        >
          {toast.title || config.defaultTitle}
        </h5>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}
        >
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          color: 'var(--text-muted)',
          padding: '2px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastItemData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        pointerEvents: 'none',
        maxWidth: '100%',
      }}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
