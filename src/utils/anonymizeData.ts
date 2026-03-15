import { differenceInDays } from 'date-fns';
import type { Period } from '../types';
import type { DailyLog } from '../contexts/DailyLogContext';

export interface AnonymizedCycleData {
  cycleLengths: number[];
  periodDurations: number[];
  symptomsByPhase: {
    menstrual: string[];
    follicular: string[];
    ovulation: string[];
    luteal: string[];
  };
  moodPatterns: {
    mood: string;
    frequency: number;
  }[];
}

export function anonymizeCycleData(
  periods: Period[],
  dailyLogs: DailyLog[],
  avgCycleLength: number
): AnonymizedCycleData {
  // Get completed cycles
  const completedCycles = periods
    .filter(p => p.end_date)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Calculate cycle lengths
  const cycleLengths: number[] = [];
  for (let i = 1; i < completedCycles.length; i++) {
    const prevStart = new Date(completedCycles[i - 1].start_date);
    const currentStart = new Date(completedCycles[i].start_date);
    cycleLengths.push(differenceInDays(currentStart, prevStart));
  }

  // Calculate period durations
  const periodDurations = completedCycles.map(p => {
    const start = new Date(p.start_date);
    const end = new Date(p.end_date!);
    return differenceInDays(end, start) + 1;
  });

  // Group symptoms by phase
  const symptomsByPhase: AnonymizedCycleData['symptomsByPhase'] = {
    menstrual: [],
    follicular: [],
    ovulation: [],
    luteal: [],
  };

  const symptomCounts: Record<string, Record<string, number>> = {
    menstrual: {},
    follicular: {},
    ovulation: {},
    luteal: {},
  };

  dailyLogs.forEach(log => {
    if (!log.symptoms || log.symptoms.length === 0) return;

    // Find which cycle this log belongs to
    const logDate = new Date(log.date);
    const cycle = completedCycles.find(p => {
      const start = new Date(p.start_date);
      const end = p.end_date ? new Date(p.end_date) : null;
      if (!end) return false;
      
      // Check if within this cycle
      const nextCycle = completedCycles.find(c => 
        new Date(c.start_date) > start
      );
      const cycleEnd = nextCycle ? new Date(nextCycle.start_date) : end;
      
      return logDate >= start && logDate < cycleEnd;
    });

    if (!cycle) return;

    // Determine phase
    const cycleStart = new Date(cycle.start_date);
    const dayInCycle = differenceInDays(logDate, cycleStart) + 1;
    
    let phase: keyof typeof symptomsByPhase;
    if (dayInCycle <= 5) {
      phase = 'menstrual';
    } else if (dayInCycle <= Math.floor(avgCycleLength / 2) - 3) {
      phase = 'follicular';
    } else if (dayInCycle <= Math.floor(avgCycleLength / 2) + 1) {
      phase = 'ovulation';
    } else {
      phase = 'luteal';
    }

    // Count symptoms
    log.symptoms.forEach(symptom => {
      if (!symptomCounts[phase][symptom]) {
        symptomCounts[phase][symptom] = 0;
      }
      symptomCounts[phase][symptom]++;
    });
  });

  // Get top symptoms per phase
  Object.keys(symptomsByPhase).forEach(phase => {
    const counts = symptomCounts[phase as keyof typeof symptomsByPhase];
    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom);
    symptomsByPhase[phase as keyof typeof symptomsByPhase] = sorted;
  });

  // Calculate mood patterns
  const moodCounts: Record<string, number> = {};
  dailyLogs.forEach(log => {
    if (log.mood) {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    }
  });

  const moodPatterns = Object.entries(moodCounts)
    .map(([mood, frequency]) => ({ mood, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  return {
    cycleLengths,
    periodDurations,
    symptomsByPhase,
    moodPatterns,
  };
}
