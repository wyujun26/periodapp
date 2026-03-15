import { differenceInDays, addDays, parseISO, isSameDay, isWithinInterval } from 'date-fns';
import type { Database } from '../types/database';

type Period = Database['public']['Tables']['periods']['Row'];

export interface FertilityWindow {
  ovulationDate: Date;
  fertileStart: Date;
  fertileEnd: Date;
  daysUntilFertile: number;
  daysUntilOvulation: number;
  status: 'fertile' | 'ovulating' | 'not-fertile';
  statusMessage: string;
}

export function calculateFertilityWindow(
  periods: Period[],
  avgCycleLength: number
): FertilityWindow | null {
  if (periods.length === 0) return null;

  // Get the most recent period
  const sortedPeriods = [...periods].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );
  
  const lastPeriod = sortedPeriods[0];
  const cycleStart = parseISO(lastPeriod.start_date);
  const today = new Date();

  // Calculate ovulation date (14 days before next expected period)
  const ovulationDate = addDays(cycleStart, avgCycleLength - 14);
  
  // Fertile window: 5 days before ovulation to 1 day after
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  const daysUntilFertile = differenceInDays(fertileStart, today);
  const daysUntilOvulation = differenceInDays(ovulationDate, today);

  // Determine current status
  let status: 'fertile' | 'ovulating' | 'not-fertile' = 'not-fertile';
  let statusMessage = '';

  if (isSameDay(today, ovulationDate)) {
    status = 'ovulating';
    statusMessage = 'Ovulation day';
  } else if (isWithinInterval(today, { start: fertileStart, end: fertileEnd })) {
    status = 'fertile';
    const daysRemaining = differenceInDays(fertileEnd, today);
    statusMessage = `Fertile window (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining)`;
  } else if (daysUntilFertile > 0) {
    statusMessage = `Fertile window in ${daysUntilFertile} day${daysUntilFertile !== 1 ? 's' : ''}`;
  } else {
    const daysUntilNext = avgCycleLength - differenceInDays(today, cycleStart);
    statusMessage = `Next period in ~${Math.max(0, daysUntilNext)} days`;
  }

  return {
    ovulationDate,
    fertileStart,
    fertileEnd,
    daysUntilFertile,
    daysUntilOvulation,
    status,
    statusMessage,
  };
}

export function isDayInFertileWindow(
  date: Date,
  fertilityWindow: FertilityWindow | null
): boolean {
  if (!fertilityWindow) return false;
  
  return isWithinInterval(date, {
    start: fertilityWindow.fertileStart,
    end: fertilityWindow.fertileEnd,
  });
}

export function isDayOvulation(
  date: Date,
  fertilityWindow: FertilityWindow | null
): boolean {
  if (!fertilityWindow) return false;
  return isSameDay(date, fertilityWindow.ovulationDate);
}

export function isDayInPeriod(
  date: Date,
  periods: Period[]
): boolean {
  return periods.some(period => {
    const start = parseISO(period.start_date);
    const end = period.end_date ? parseISO(period.end_date) : start;
    
    return isWithinInterval(date, { start, end });
  });
}
