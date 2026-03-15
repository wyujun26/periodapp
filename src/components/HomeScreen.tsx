import React, { useState, useEffect } from 'react';
import { Droplet, Calendar, Activity, Heart, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { usePeriods } from '../contexts/PeriodContext';
import { useDailyLogs } from '../contexts/DailyLogContext';
import { useSettings } from '../contexts/SettingsContext';
import { differenceInDays } from 'date-fns';
import { calculateFertilityWindow } from '../utils/fertilityCalculations';
import { getActiveReminders } from '../utils/reminderCalculations';
import { ReminderBanner } from './ReminderBanner';

interface HomeScreenProps {
  onNavigateToLog: () => void;
}

export function HomeScreen({ onNavigateToLog }: HomeScreenProps) {
  const { periods, avgCycleLength, avgPeriodLength } = usePeriods();
  const { dailyLogs } = useDailyLogs();
  const { settings } = useSettings();
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());

  // Calculate current cycle day and next period
  const latestPeriod = periods[0];
  const currentDay = latestPeriod 
    ? differenceInDays(new Date(), new Date(latestPeriod.start_date)) + 1
    : 0;
  
  const daysUntilNext = latestPeriod
    ? avgCycleLength - currentDay
    : 0;

  // Calculate fertility window
  const fertilityWindow = calculateFertilityWindow(periods, avgCycleLength);

  // Get active reminders
  const activeReminders = getActiveReminders(
    settings,
    periods,
    dailyLogs,
    fertilityWindow,
    avgCycleLength
  ).filter(reminder => !dismissedReminders.has(reminder.id));

  // Reset dismissed reminders daily
  useEffect(() => {
    const resetTime = new Date();
    resetTime.setHours(0, 0, 0, 0);
    const now = new Date();
    const msUntilMidnight = resetTime.getTime() + 24 * 60 * 60 * 1000 - now.getTime();

    const timer = setTimeout(() => {
      setDismissedReminders(new Set());
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const handleDismissReminder = (id: string) => {
    setDismissedReminders(prev => new Set(prev).add(id));
  };

  // Determine current phase
  const getCurrentPhase = () => {
    if (!latestPeriod) return 'unknown';
    
    if (currentDay <= avgPeriodLength) return 'menstrual';
    if (currentDay <= 13) return 'follicular';
    if (currentDay <= 17) return 'ovulation';
    return 'luteal';
  };

  const currentPhase = getCurrentPhase();

  const phaseInfo = {
    menstrual: {
      name: 'Menstrual',
      emoji: '🌙',
      description: 'Rest and recharge',
      gradient: 'from-rose to-rose-dark',
    },
    follicular: {
      name: 'Follicular',
      emoji: '🌱',
      description: 'Energy is rising',
      gradient: 'from-plum to-plum-dark',
    },
    ovulation: {
      name: 'Ovulation',
      emoji: '✨',
      description: 'Peak energy and fertility',
      gradient: 'from-lavender-dark to-plum',
    },
    luteal: {
      name: 'Luteal',
      emoji: '🍂',
      description: 'Winding down',
      gradient: 'from-plum-dark to-plum',
    },
    unknown: {
      name: 'Getting Started',
      emoji: '💜',
      description: 'Log your first period',
      gradient: 'from-plum to-plum-dark',
    },
  };

  const phase = phaseInfo[currentPhase];

  // Get fertility status color
  const getFertilityColor = () => {
    if (!fertilityWindow) return 'bg-lavender/20 text-lavender-dark';
    
    switch (fertilityWindow.status) {
      case 'ovulating':
        return 'bg-plum/20 text-plum-dark border-plum/30';
      case 'fertile':
        return 'bg-lavender/30 text-lavender-dark border-lavender/40';
      default:
        return 'bg-lavender/10 text-plum/70 border-lavender/20';
    }
  };

  // Empty state
  if (periods.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-lavender-light px-4 py-4">
          <h2 className="text-xl font-bold text-plum">Your Cycle</h2>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-plum/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-plum" />
            </div>
            <h3 className="text-2xl font-bold text-plum mb-2">Welcome!</h3>
            <p className="text-plum/70 mb-6">
              Start tracking your cycle by logging your first period
            </p>
            <button
              onClick={onNavigateToLog}
              className="bg-plum text-white px-6 py-3 rounded-xl font-medium hover:bg-plum-dark transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Your First Period
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-lavender-light px-4 py-4">
        <h2 className="text-xl font-bold text-plum">Your Cycle</h2>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {/* Reminder Banners */}
        {activeReminders.map(reminder => (
          <ReminderBanner
            key={reminder.id}
            reminder={reminder}
            onDismiss={handleDismissReminder}
            onAction={reminder.type === 'daily-log' ? onNavigateToLog : undefined}
          />
        ))}

        {/* Current Phase Card */}
        <div className={`bg-gradient-to-br ${phase.gradient} rounded-2xl p-5 text-white shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm opacity-90">Current Phase</p>
              <h3 className="text-2xl font-bold">{phase.name}</h3>
            </div>
            <span className="text-4xl">{phase.emoji}</span>
          </div>
          <p className="text-sm opacity-90">{phase.description}</p>
        </div>

        {/* Fertility Status Card */}
        {fertilityWindow && (
          <div className={`rounded-2xl p-4 border-2 ${getFertilityColor()}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium opacity-80">Fertility Status</p>
                <p className="font-bold">{fertilityWindow.statusMessage}</p>
              </div>
            </div>
            <div className="bg-white/30 rounded-lg p-2 mt-2">
              <p className="text-xs flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="opacity-90">
                  Estimates are predictions only and not a substitute for medical advice or contraception.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-plum/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-plum" />
              </div>
              <p className="text-xs text-plum/70 font-medium">Cycle Day</p>
            </div>
            <p className="text-2xl font-bold text-plum">{currentDay}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-rose/10 rounded-lg flex items-center justify-center">
                <Droplet className="w-4 h-4 text-rose" />
              </div>
              <p className="text-xs text-plum/70 font-medium">Next Period</p>
            </div>
            <p className="text-2xl font-bold text-plum">{Math.max(0, daysUntilNext)}d</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-lavender/30 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-plum" />
              </div>
              <p className="text-xs text-plum/70 font-medium">Avg Cycle</p>
            </div>
            <p className="text-2xl font-bold text-plum">{avgCycleLength}d</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-lavender/30 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-plum" />
              </div>
              <p className="text-xs text-plum/70 font-medium">Avg Period</p>
            </div>
            <p className="text-2xl font-bold text-plum">{avgPeriodLength}d</p>
          </div>
        </div>
      </div>
    </div>
  );
}
