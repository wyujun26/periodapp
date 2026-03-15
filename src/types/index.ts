export interface Period {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  flow_intensity: 'light' | 'medium' | 'heavy' | null;
  notes: string | null;
  created_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  date: string;
  symptom_type: string;
  severity: number;
  notes: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  avg_cycle_length: number;
  avg_period_length: number;
  created_at: string;
  updated_at: string;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleStats {
  currentDay: number;
  daysUntilNext: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  currentPhase: CyclePhase;
  fertilityStatus: 'low' | 'medium' | 'high';
}
