import React, { useState } from 'react';
import { LogOut, User, Bell, Lock, Info, ChevronRight, Moon, Sun, Trash2, Mail, Key } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { ConfirmDialog } from './ConfirmDialog';
import type { ToastType } from './Toast';

interface SettingsScreenProps {
  userEmail: string;
  onSignOut: () => void;
  onShowToast: (message: string, type: ToastType) => void;
}

export function SettingsScreen({ userEmail, onSignOut, onShowToast }: SettingsScreenProps) {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [showReminders, setShowReminders] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleReminder = async (field: string, value: boolean) => {
    try {
      await updateSettings({ [field]: value });
      onShowToast('Reminder settings updated', 'success');
    } catch (error) {
      onShowToast('Failed to update settings', 'error');
    }
  };

  const handleUpdateDaysBefore = async (days: number) => {
    try {
      await updateSettings({ reminder_period_days_before: days });
      onShowToast('Reminder timing updated', 'success');
    } catch (error) {
      onShowToast('Failed to update settings', 'error');
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      onShowToast('Please enter a valid email', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      onShowToast('Verification email sent to new address', 'success');
      setShowEmailDialog(false);
      setNewEmail('');
    } catch (error: any) {
      onShowToast(error.message || 'Failed to update email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      onShowToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      onShowToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      onShowToast('Password updated successfully', 'success');
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      onShowToast(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete all user data
      await supabase.from('daily_logs').delete().eq('user_id', user.id);
      await supabase.from('cycles').delete().eq('user_id', user.id);
      await supabase.from('user_settings').delete().eq('user_id', user.id);

      onShowToast('All data deleted successfully', 'success');
      setShowDeleteConfirm(false);
      
      // Sign out after deletion
      setTimeout(() => {
        onSignOut();
      }, 1500);
    } catch (error: any) {
      onShowToast(error.message || 'Failed to delete data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-cream dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-lavender-light dark:border-gray-700 px-4 py-4">
        <h2 className="text-xl font-bold text-plum dark:text-lavender">Settings</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Account Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAccount(!showAccount)}
            className="w-full flex items-center justify-between p-4 hover:bg-lavender-light/50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-plum dark:bg-lavender rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-plum dark:text-lavender">Account</p>
                <p className="text-sm text-plum/70 dark:text-lavender/70">{userEmail}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-plum dark:text-lavender transition-transform ${showAccount ? 'rotate-90' : ''}`} />
          </button>

          {showAccount && (
            <div className="border-t border-lavender-light dark:border-gray-700 divide-y divide-lavender-light dark:divide-gray-700">
              <button
                onClick={() => setShowEmailDialog(true)}
                className="w-full flex items-center gap-3 p-4 hover:bg-lavender-light/50 dark:hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5 text-plum dark:text-lavender" />
                <span className="flex-1 text-left text-plum dark:text-lavender font-medium">Update Email</span>
              </button>
              <button
                onClick={() => setShowPasswordDialog(true)}
                className="w-full flex items-center gap-3 p-4 hover:bg-lavender-light/50 dark:hover:bg-gray-700 transition-colors"
              >
                <Key className="w-5 h-5 text-plum dark:text-lavender" />
                <span className="flex-1 text-left text-plum dark:text-lavender font-medium">Change Password</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-3 p-4 hover:bg-rose/10 dark:hover:bg-rose/20 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-rose" />
                <span className="flex-1 text-left text-rose font-medium">Delete All Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 hover:bg-lavender-light/50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-plum dark:text-lavender" />
              ) : (
                <Sun className="w-5 h-5 text-plum dark:text-lavender" />
              )}
              <span className="text-plum dark:text-lavender font-medium">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <div className={`relative w-12 h-7 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-plum dark:bg-lavender' : 'bg-plum/20 dark:bg-lavender/20'
            }`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </button>
        </div>

        {/* Reminders Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowReminders(!showReminders)}
            className="w-full flex items-center justify-between p-4 hover:bg-lavender-light/50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-plum dark:text-lavender" />
              <span className="text-plum dark:text-lavender font-medium">Reminders</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-plum dark:text-lavender transition-transform ${showReminders ? 'rotate-90' : ''}`} />
          </button>

          {showReminders && settings && (
            <div className="border-t border-lavender-light dark:border-gray-700 p-4 space-y-4">
              {/* Period Reminder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-plum dark:text-lavender text-sm">Period Due</p>
                    <p className="text-xs text-plum/60 dark:text-lavender/60">Get notified before your period starts</p>
                  </div>
                  <button
                    onClick={() => handleToggleReminder('reminder_period_enabled', !settings.reminder_period_enabled)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      settings.reminder_period_enabled ? 'bg-plum dark:bg-lavender' : 'bg-plum/20 dark:bg-lavender/20'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.reminder_period_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {settings.reminder_period_enabled && (
                  <div className="pl-4 space-y-2">
                    <p className="text-xs text-plum/70 dark:text-lavender/70 font-medium">Notify me:</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(days => (
                        <button
                          key={days}
                          onClick={() => handleUpdateDaysBefore(days)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            settings.reminder_period_days_before === days
                              ? 'bg-plum dark:bg-lavender text-white'
                              : 'bg-lavender/20 dark:bg-lavender/30 text-plum dark:text-lavender hover:bg-lavender/30 dark:hover:bg-lavender/40'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-plum/50 dark:text-lavender/50">before predicted start</p>
                  </div>
                )}
              </div>

              {/* Fertile Window Reminder */}
              <div className="flex items-center justify-between pt-3 border-t border-lavender-light dark:border-gray-700">
                <div>
                  <p className="font-medium text-plum dark:text-lavender text-sm">Fertile Window</p>
                  <p className="text-xs text-plum/60 dark:text-lavender/60">Get notified when fertile window starts</p>
                </div>
                <button
                  onClick={() => handleToggleReminder('reminder_fertile_enabled', !settings.reminder_fertile_enabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.reminder_fertile_enabled ? 'bg-plum dark:bg-lavender' : 'bg-plum/20 dark:bg-lavender/20'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.reminder_fertile_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Daily Log Reminder */}
              <div className="flex items-center justify-between pt-3 border-t border-lavender-light dark:border-gray-700">
                <div>
                  <p className="font-medium text-plum dark:text-lavender text-sm">Daily Log</p>
                  <p className="text-xs text-plum/60 dark:text-lavender/60">Remind me to log my day</p>
                </div>
                <button
                  onClick={() => handleToggleReminder('reminder_daily_log_enabled', !settings.reminder_daily_log_enabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.reminder_daily_log_enabled ? 'bg-plum dark:bg-lavender' : 'bg-plum/20 dark:bg-lavender/20'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.reminder_daily_log_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Other Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm divide-y divide-lavender-light dark:divide-gray-700">
          <button className="w-full flex items-center gap-3 p-4 hover:bg-lavender-light/50 dark:hover:bg-gray-700 transition-colors">
            <Lock className="w-5 h-5 text-plum dark:text-lavender" />
            <span className="flex-1 text-left text-plum dark:text-lavender font-medium">Privacy</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-lavender-light/50 dark:hover:bg-gray-700 transition-colors">
            <Info className="w-5 h-5 text-plum dark:text-lavender" />
            <span className="flex-1 text-left text-plum dark:text-lavender font-medium">About</span>
          </button>
        </div>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="w-full bg-rose text-white py-4 rounded-xl font-medium hover:bg-rose-dark transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>

        <div className="text-center text-sm text-plum/50 dark:text-lavender/50 pt-4">
          <p>Period Tracker v1.0</p>
          <p className="mt-1">Built with ChatAndBuild</p>
        </div>
      </div>

      {/* Email Update Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-plum dark:text-lavender mb-4">Update Email</h3>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              className="w-full px-4 py-3 rounded-xl border-2 border-lavender-light dark:border-gray-600 bg-white dark:bg-gray-700 text-plum dark:text-lavender focus:border-plum dark:focus:border-lavender outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmailDialog(false);
                  setNewEmail('');
                }}
                className="flex-1 bg-lavender/20 dark:bg-lavender/30 text-plum dark:text-lavender py-3 rounded-xl font-medium hover:bg-lavender/30 dark:hover:bg-lavender/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmail}
                disabled={loading}
                className="flex-1 bg-plum dark:bg-lavender text-white py-3 rounded-xl font-medium hover:bg-plum-dark dark:hover:bg-lavender-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-plum dark:text-lavender mb-4">Change Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 rounded-xl border-2 border-lavender-light dark:border-gray-600 bg-white dark:bg-gray-700 text-plum dark:text-lavender focus:border-plum dark:focus:border-lavender outline-none mb-3"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-3 rounded-xl border-2 border-lavender-light dark:border-gray-600 bg-white dark:bg-gray-700 text-plum dark:text-lavender focus:border-plum dark:focus:border-lavender outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 bg-lavender/20 dark:bg-lavender/30 text-plum dark:text-lavender py-3 rounded-xl font-medium hover:bg-lavender/30 dark:hover:bg-lavender/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="flex-1 bg-plum dark:bg-lavender text-white py-3 rounded-xl font-medium hover:bg-plum-dark dark:hover:bg-lavender-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete All Data?"
          message="This will permanently delete all your cycles, logs, and settings. This action cannot be undone."
          confirmText="Delete Everything"
          cancelText="Keep My Data"
          variant="danger"
          onConfirm={handleDeleteAllData}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
