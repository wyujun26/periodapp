import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { Layout } from './components/Layout';
import { HomeScreen } from './components/HomeScreen';
import { LogScreen } from './components/LogScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PeriodProvider } from './contexts/PeriodContext';
import { DailyLogProvider } from './contexts/DailyLogContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast, type ToastType } from './components/Toast';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        showToast('Failed to restore session. Please sign in again.', 'error');
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setActiveTab('home');
      showToast('Signed out successfully', 'success');
    } catch (error: any) {
      console.error('Sign out error:', error);
      showToast(error.message || 'Failed to sign out', 'error');
    }
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-plum dark:text-lavender">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <AuthScreen onShowToast={showToast} />
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PeriodProvider userId={user.id}>
          <DailyLogProvider userId={user.id}>
            <SettingsProvider userId={user.id}>
              <Layout activeTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'home' && (
                  <HomeScreen onNavigateToLog={() => setActiveTab('log')} />
                )}
                {activeTab === 'log' && <LogScreen onShowToast={showToast} />}
                {activeTab === 'calendar' && <CalendarScreen />}
                {activeTab === 'insights' && <InsightsScreen />}
                {activeTab === 'settings' && (
                  <SettingsScreen
                    userEmail={user.email || ''}
                    onSignOut={handleSignOut}
                    onShowToast={showToast}
                  />
                )}
              </Layout>
              {toast && (
                <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
                />
              )}
            </SettingsProvider>
          </DailyLogProvider>
        </PeriodProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
