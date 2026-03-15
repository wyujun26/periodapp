import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (updates: Partial<UserSettingsUpdate>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSettings();
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [userId]);

  const fetchSettings = async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No settings found, create default
      const { data: newSettings } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          avg_cycle_length: 28,
          avg_period_length: 5,
          reminder_period_enabled: true,
          reminder_period_days_before: 3,
          reminder_fertile_enabled: true,
          reminder_daily_log_enabled: true,
        })
        .select()
        .single();

      if (newSettings) {
        setSettings(newSettings);
      }
    } else if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const updateSettings = async (updates: Partial<UserSettingsUpdate>) => {
    if (!userId || !settings) return;

    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) {
      setSettings(data);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
