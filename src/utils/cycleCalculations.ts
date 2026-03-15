import { differenceInDays, addDays, parseISO } from 'date-fns';
import type { Period, CycleStats, CyclePhase } from '../types';

export function calculateCycleStats(periods: Period[]): CycleStats {
  const defaultStats: CycleStats = {
    currentDay: 1,
    daysUntilNext: 28,
    avgCycleLength: 28,
    avgPeriodLength: 5,
    currentPhase: 'menstrual',
    fertilityStatus: 'low',
  };

  if (periods.length === 0) return defaultStats;

  const sortedPeriods = [...periods].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const lastPeriod = sortedPeriods[0];
  const today = new Date();
  const lastPeriodStart = parseISO(lastPeriod.start_date);

  const currentDay = differenceInDays(today, lastPeriodStart) + 1;

  const cycleLengths: number[] = [];
  for (let i = 0; i < sortedPeriods.length - 1; i++) {
    const current = parseISO(sortedPeriods[i].start_date);
    const next = parseISO(sortedPeriods[i + 1].start_date);
    cycleLengths.push(differenceInDays(current, next));
  }

  const avgCycleLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;

  const periodLengths = sortedPeriods
    .filter(p => p.end_date)
    .map(p => differenceInDays(parseISO(p.end_date!), parseISO(p.start_date)) + 1);

  const avgPeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;

  const nextPeriodDate = addDays(lastPeriodStart, avgCycleLength);
  const daysUntilNext = differenceInDays(nextPeriodDate, today);

  const currentPhase = getCurrentPhase(currentDay, avgCycleLength);
  const fertilityStatus = getFertilityStatus(currentDay, avgCycleLength);

  return {
    currentDay,
    daysUntilNext: Math.max(0, daysUntilNext),
    avgCycleLength,
    avgPeriodLength,
    currentPhase,
    fertilityStatus,
  };
}

function getCurrentPhase(dayInCycle: number, cycleLength: number): CyclePhase {
  if (dayInCycle <= 5) return 'menstrual';
  if (dayInCycle <= Math.floor(cycleLength / 2) - 3) return 'follicular';
  if (dayInCycle <= Math.floor(cycleLength / 2) + 1) return 'ovulation';
  return 'luteal';
}

function getFertilityStatus(dayInCycle: number, cycleLength: number): 'low' | 'medium' | 'high' {
  const ovulationDay = Math.floor(cycleLength / 2);
  const diff = Math.abs(dayInCycle - ovulationDay);
  
  if (diff <= 1) return 'high';
  if (diff <= 3) return 'medium';
  return 'low';
}

export function getPhaseInfo(phase: CyclePhase) {
  const phaseData = {
    menstrual: {
      name: 'Menstrual',
      description: 'Your period is here',
      gradient: 'from-rose to-rose-dark',
      emoji: '🌙',
    },
    follicular: {
      name: 'Follicular',
      description: 'Energy is building',
      gradient: 'from-lavender to-lavender-dark',
      emoji: '🌱',
    },
    ovulation: {
      name: 'Ovulation',
      description: 'Peak fertility window',
      gradient: 'from-plum-light to-plum',
      emoji: '✨',
    },
    luteal: {
      name: 'Luteal',
      description: 'Winding down',
      gradient: 'from-lavender-light to-lavender',
      emoji: '🌸',
    },
  };

  return phaseData[phase];
}
