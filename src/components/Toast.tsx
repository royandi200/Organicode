import { useEffect } from 'react';
import { X, TrendingUp, MessageSquare, Bell } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Toast as ToastType } from '@/types';

const icons = {
  oferta: MessageSquare,
  precio: TrendingUp,
  sistema: Bell,
};

const borderColors = {
  oferta: 'border-volcanic-gold',
  precio: 'border-blue-500',
  sistema: 'border-text-muted',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useAppStore((s) => s.removeToast);
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div
      className={`w-80 bg-surface/95 backdrop-blur-xl border-l-2 ${borderColors[toast.type]} rounded-r-lg shadow-float p-4 animate-slide-in-up`}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.animationPlayState = 'paused';
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-volcanic-gold mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-warm">{toast.title}</p>
          <p className="text-xs text-text-sand mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="text-text-muted hover:text-text-warm transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
