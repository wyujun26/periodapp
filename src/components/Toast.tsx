import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-rose/10 dark:bg-rose/20 border-rose/30 dark:border-rose/40 text-rose-dark dark:text-rose-light',
    info: 'bg-lavender/10 dark:bg-lavender/20 border-lavender/30 dark:border-lavender/40 text-plum dark:text-lavender',
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-in`}>
      <div className={`${colors[type]} border-2 rounded-xl p-4 shadow-lg flex items-start gap-3`}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
