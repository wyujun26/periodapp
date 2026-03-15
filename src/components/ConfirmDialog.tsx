import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-rose/10 dark:bg-rose/20' : 'bg-lavender/20 dark:bg-lavender/30'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              variant === 'danger' ? 'text-rose' : 'text-lavender-dark dark:text-lavender'
            }`} />
          </div>
          <h3 className="text-xl font-bold text-plum dark:text-lavender">{title}</h3>
        </div>
        <p className="text-plum/80 dark:text-lavender/80 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-lavender/20 dark:bg-lavender/30 text-plum dark:text-lavender py-3 rounded-xl font-medium hover:bg-lavender/30 dark:hover:bg-lavender/40 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              variant === 'danger'
                ? 'bg-rose text-white hover:bg-rose-dark'
                : 'bg-plum dark:bg-lavender text-white hover:bg-plum-dark dark:hover:bg-lavender-dark'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
