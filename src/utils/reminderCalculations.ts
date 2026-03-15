import { differenceInDays, isSameDay, addDays, parseISO } from 'date-fns';
import type { Database } from '../types/database';
import type { FertilityWindow } from './fertilityCalculations';

type Period = Database['public']['Tables']['periods']['Row'];
type DailyLog = Database['public']['Tables']['daily_logs']['Row'];
type UserSettings = Database['public']['Tables']['user_settings']['Row'];

export interface ReminderBanner {
  id: string;
  type: 'period' | 'fertile' | 'daily-log';
  title: string;
  message: string;
  icon: 'droplet' | 'sparkles' | 'clipboard';
  color: 'rose' | 'lavender' | 'plum';
}

export function getActiveReminders(
  settings: UserSettings | null,
  periods: Period[],
  dailyLogs: DailyLog[],
  fertilityWindow: FertilityWindow | null,
  avgCycleLength: number
): ReminderBanner[] {
  if (!settings) return [];

  const reminders: ReminderBanner[] = [];
  const today = new Date();

  // Period due reminder
  if (settings.reminder_period_enabled && periods.length > 0) {
    const latestPeriod = periods[0];
    const cycleStart = parseISO(latestPeriod.start_date);
    const nextPeriodDate = addDays(cycleStart, avgCycleLength);
    const daysUntilPeriod = differenceInDays(nextPeriodDate, today);

    if (daysUntilPeriod > 0 && daysUntilPeriod <= settings.reminder_period_days_before) {
      reminders.push({
        id: 'period-reminder',
        type: 'period',
        title: 'Period Coming Soon',
        message: `Your period is expected in ${daysUntilPeriod} day${daysUntilPeriod !== 1 ? 's' : ''}`,
        icon: 'droplet',
        color: 'rose',
      });
    }
  }

  // Fertile window reminder
  if (settings.reminder_fertile_enabled && fertilityWindow) {
    const isFertileWindowStart = isSameDay(today, fertilityWindow.fertileStart);
    const isInFertileWindow = fertilityWindow.status === 'fertile' || fertilityWindow.status === 'ovulating';

    if (isFertileWindowStart || (isInFertileWindow && fertilityWindow.daysUntilFertile === 0)) {
      reminders.push({
        id: 'fertile-reminder',
        type: 'fertile',
        title: 'Fertile Window',
        message: fertilityWindow.status === 'ovulating' 
          ? 'Today is your predicted ovulation day'
          : 'Your fertile window has started',
        icon: 'sparkles',
        color: 'lavender',
      });
    }
  }

  // Daily log reminder
  if (settings.reminder_daily_log_enabled) {
    const todayLog = dailyLogs.find(log => 
      isSameDay(parseISO(log.date), today)
    );

    if (!todayLog) {
      reminders.push({
        id: 'daily-log-reminder',
        type: 'daily-log',
        title: 'Log Your Day',
        message: 'Track your mood and symptoms for today',
        icon: 'clipboard',
        color: 'plum',
      });
    }
  }

  return reminders;
}
