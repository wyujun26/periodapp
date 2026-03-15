import React, { useState } from 'react';
import { X, Droplet, Sparkles, ClipboardList } from 'lucide-react';
import type { ReminderBanner as ReminderBannerType } from '../utils/reminderCalculations';

interface ReminderBannerProps {
  reminder: ReminderBannerType;
  onDismiss: (id: string) => void;
  onAction?: () => void;
}

export function ReminderBanner({ reminder, onDismiss, onAction }: ReminderBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(reminder.id), 300);
  };

  const icons = {
    droplet: Droplet,
    sparkles: Sparkles,
    clipboard: ClipboardList,
  };

  const Icon = icons[reminder.icon];

  const colorClasses = {
    rose: 'bg-rose/10 border-rose/30 text-rose-dark',
    lavender: 'bg-lavender/20 border-lavender/40 text-lavender-dark',
    plum: 'bg-plum/10 border-plum/30 text-plum-dark',
  };

  const iconColorClasses = {
    rose: 'bg-rose/20 text-rose',
    lavender: 'bg-lavender/30 text-lavender-dark',
    plum: 'bg-plum/20 text-plum',
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        rounded-2xl border-2 p-4 shadow-sm transition-all duration-300
        ${colorClasses[reminder.color]}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColorClasses[reminder.color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm">{reminder.title}</h3>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm opacity-90">{reminder.message}</p>
          
          {onAction && reminder.type === 'daily-log' && (
            <button
              onClick={onAction}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              Log Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
