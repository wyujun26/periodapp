import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type DailyLog = Database['public']['Tables']['daily_logs']['Row'];
type DailyLogInsert = Database['public']['Tables']['daily_logs']['Insert'];

export type Mood = 'happy' | 'calm' | 'anxious' | 'irritable' | 'sad';
export type Symptom = 'cramps' | 'bloating' | 'headache' | 'fatigue' | 'tender_breasts' | 'acne';

interface DailyLogContextType {
  dailyLogs: DailyLog[];
  loading: boolean;
  getLogForDate: (date: string) => DailyLog | undefined;
  addOrUpdateLog: (log: Omit<DailyLogInsert, 'user_id'>) => Promise<void>;
  deleteLog: (date: string) => Promise<void>;
}

const DailyLogContext = createContext<DailyLogContextType | undefined>(undefined);

export function DailyLogProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchDailyLogs();
    } else {
      setDailyLogs([]);
      setLoading(false);
    }
  }, [userId]);

  const fetchDailyLogs = async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (!error && data) {
      setDailyLogs(data);
    }
    setLoading(false);
  };

  const getLogForDate = (date: string) => {
    return dailyLogs.find(log => log.date === date);
  };

  const addOrUpdateLog = async (log: Omit<DailyLogInsert, 'user_id'>) => {
    if (!userId) return;

    const existingLog = dailyLogs.find(l => l.date === log.date);

    if (existingLog) {
      // Update existing log
      const { data, error } = await supabase
        .from('daily_logs')
        .update(log)
        .eq('user_id', userId)
        .eq('date', log.date)
        .select()
        .single();

      if (!error && data) {
        setDailyLogs(prev => prev.map(l => l.date === log.date ? data : l));
      }
    } else {
      // Insert new log
      const { data, error } = await supabase
        .from('daily_logs')
        .insert({ ...log, user_id: userId })
        .select()
        .single();

      if (!error && data) {
        setDailyLogs(prev => [data, ...prev]);
      }
    }
  };

  const deleteLog = async (date: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (!error) {
      setDailyLogs(prev => prev.filter(l => l.date !== date));
    }
  };

  return (
    <DailyLogContext.Provider value={{
      dailyLogs,
      loading,
      getLogForDate,
      addOrUpdateLog,
      deleteLog,
    }}>
      {children}
    </DailyLogContext.Provider>
  );
}

export function useDailyLogs() {
  const context = useContext(DailyLogContext);
  if (context === undefined) {
    throw new Error('useDailyLogs must be used within a DailyLogProvider');
  }
  return context;
}
