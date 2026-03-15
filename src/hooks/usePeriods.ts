import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Period } from '../types';

export function usePeriods(userId: string | undefined) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchPeriods();
  }, [userId]);

  const fetchPeriods = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (!error && data) {
      setPeriods(data);
    }
    setLoading(false);
  };

  const addPeriod = async (period: Omit<Period, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('periods')
      .insert([{ ...period, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      setPeriods([data, ...periods]);
    }
    return { data, error };
  };

  const updatePeriod = async (id: string, updates: Partial<Period>) => {
    const { data, error } = await supabase
      .from('periods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setPeriods(periods.map(p => p.id === id ? data : p));
    }
    return { data, error };
  };

  return { periods, loading, addPeriod, updatePeriod, refetch: fetchPeriods };
}
