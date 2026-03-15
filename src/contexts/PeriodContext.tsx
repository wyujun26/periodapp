import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Period = Database['public']['Tables']['cycles']['Row'];
type PeriodInsert = Database['public']['Tables']['cycles']['Insert'];

interface PeriodContextType {
  periods: Period[];
  loading: boolean;
  addPeriod: (period: Omit<PeriodInsert, 'user_id'>) => Promise<void>;
  updatePeriod: (id: string, updates: Partial<PeriodInsert>) => Promise<void>;
  deletePeriod: (id: string) => Promise<void>;
  avgCycleLength: number;
  avgPeriodLength: number;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPeriods();
    } else {
      setPeriods([]);
      setLoading(false);
    }
  }, [userId]);

  const fetchPeriods = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching periods:', error);
        throw error;
      }

      if (data) {
        setPeriods(data);
      }
    } catch (error) {
      console.error('Failed to fetch periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPeriod = async (period: Omit<PeriodInsert, 'user_id'>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('cycles')
        .insert({ ...period, user_id: userId })
        .select()
        .single();

      if (error) {
        console.error('Error adding period:', error);
        throw new Error(error.message || 'Failed to save period');
      }

      if (data) {
        setPeriods(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add period:', error);
      throw error;
    }
  };

  const updatePeriod = async (id: string, updates: Partial<PeriodInsert>) => {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating period:', error);
        throw new Error(error.message || 'Failed to update period');
      }

      if (data) {
        setPeriods(prev => prev.map(p => p.id === id ? data : p));
      }
    } catch (error) {
      console.error('Failed to update period:', error);
      throw error;
    }
  };

  const deletePeriod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cycles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting period:', error);
        throw new Error(error.message || 'Failed to delete period');
      }

      setPeriods(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete period:', error);
      throw error;
    }
  };

  // Calculate average cycle length (minimum 2 cycles required)
  const avgCycleLength = React.useMemo(() => {
    if (periods.length < 2) return 28; // Default

    const sortedPeriods = [...periods].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const cycleLengths: number[] = [];
    for (let i = 1; i < sortedPeriods.length; i++) {
      const prevStart = new Date(sortedPeriods[i - 1].start_date);
      const currentStart = new Date(sortedPeriods[i].start_date);
      const daysBetween = Math.round((currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
      if (daysBetween > 0 && daysBetween < 60) { // Reasonable cycle length
        cycleLengths.push(daysBetween);
      }
    }

    if (cycleLengths.length === 0) return 28;
    return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  }, [periods]);

  // Calculate average period length
  const avgPeriodLength = React.useMemo(() => {
    const completedPeriods = periods.filter(p => p.end_date);
    if (completedPeriods.length === 0) return 5; // Default

    const periodLengths = completedPeriods.map(p => {
      const start = new Date(p.start_date);
      const end = new Date(p.end_date!);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    });

    return Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
  }, [periods]);

  return (
    <PeriodContext.Provider value={{
      periods,
      loading,
      addPeriod,
      updatePeriod,
      deletePeriod,
      avgCycleLength,
      avgPeriodLength,
    }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriods() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error('usePeriods must be used within a PeriodProvider');
  }
  return context;
}
