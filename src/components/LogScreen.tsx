import React, { useState } from 'react';
import { Calendar, Droplet, Save, Edit2, Trash2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { usePeriods } from '../contexts/PeriodContext';
import { useDailyLogs } from '../contexts/DailyLogContext';
import { DailyLogForm } from './DailyLogForm';
import type { ToastType } from './Toast';

interface LogScreenProps {
  onShowToast?: (message: string, type: ToastType) => void;
}

export function LogScreen({ onShowToast }: LogScreenProps) {
  const { periods, addPeriod, updatePeriod, deletePeriod } = usePeriods();
  const { dailyLogs } = useDailyLogs();
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [flowIntensity, setFlowIntensity] = useState<'spotting' | 'light' | 'medium' | 'heavy'>('medium');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updatePeriod(editingId, {
          start_date: startDate,
          end_date: endDate || null,
          flow_intensity: flowIntensity,
          notes: notes || null,
        });
        onShowToast?.('Period updated successfully', 'success');
      } else {
        await addPeriod({
          start_date: startDate,
          end_date: endDate || null,
          flow_intensity: flowIntensity,
          notes: notes || null,
        });
        onShowToast?.('Period saved successfully', 'success');
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving period:', error);
      onShowToast?.(
        error.message || 'Failed to save period. Please try again.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
    setFlowIntensity('medium');
    setNotes('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (period: any) => {
    setStartDate(period.start_date);
    setEndDate(period.end_date || '');
    setFlowIntensity(period.flow_intensity || 'medium');
    setNotes(period.notes || '');
    setEditingId(period.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePeriod(id);
      onShowToast?.('Period deleted successfully', 'success');
    } catch (error: any) {
      console.error('Error deleting period:', error);
      onShowToast?.(
        error.message || 'Failed to delete period. Please try again.',
        'error'
      );
    }
  };

  const getFlowColor = (intensity: string) => {
    switch (intensity) {
      case 'spotting': return 'bg-rose/20 text-rose-dark';
      case 'light': return 'bg-rose/40 text-rose-dark';
      case 'medium': return 'bg-rose/60 text-white';
      case 'heavy': return 'bg-rose text-white';
      default: return 'bg-lavender text-plum';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-lavender-light dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-plum dark:text-lavender">
            {isEditing ? 'Edit Period' : 'Log Period'}
          </h2>
          <button
            onClick={() => setShowDailyLog(true)}
            className="flex items-center gap-2 bg-plum dark:bg-lavender text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-plum-dark dark:hover:bg-lavender-dark transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Daily Log
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Daily Logs Summary */}
        {dailyLogs.length > 0 && (
          <div className="bg-gradient-to-br from-plum to-plum-dark dark:from-lavender dark:to-lavender-dark rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Recent Daily Logs</h3>
              <span className="text-sm opacity-90">{dailyLogs.length} entries</span>
            </div>
            <p className="text-sm opacity-90">
              Track your daily symptoms, mood, and notes
            </p>
          </div>
        )}

        {/* Period Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-plum dark:text-lavender mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lavender-dark" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-cream dark:bg-gray-700 text-plum dark:text-lavender rounded-xl border-2 border-transparent focus:border-plum dark:focus:border-lavender focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-plum dark:text-lavender mb-2">
              End Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lavender-dark" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full pl-11 pr-4 py-3 bg-cream dark:bg-gray-700 text-plum dark:text-lavender rounded-xl border-2 border-transparent focus:border-plum dark:focus:border-lavender focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-plum dark:text-lavender mb-3">
              Flow Intensity
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['spotting', 'light', 'medium', 'heavy'] as const).map((intensity) => (
                <button
                  key={intensity}
                  type="button"
                  onClick={() => setFlowIntensity(intensity)}
                  className={`py-3 px-4 rounded-xl font-medium transition-all capitalize ${
                    flowIntensity === intensity
                      ? 'bg-plum dark:bg-lavender text-white'
                      : 'bg-cream dark:bg-gray-700 text-plum dark:text-lavender hover:bg-cream-dark dark:hover:bg-gray-600'
                  }`}
                >
                  <Droplet className="w-4 h-4 mx-auto mb-1" fill={flowIntensity === intensity ? 'currentColor' : 'none'} />
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-plum dark:text-lavender mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-cream dark:bg-gray-700 text-plum dark:text-lavender rounded-xl border-2 border-transparent focus:border-plum dark:focus:border-lavender focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="How are you feeling?"
              maxLength={200}
            />
            <p className="text-xs text-plum/50 dark:text-lavender/50 mt-1">
              {notes.length}/200 characters
            </p>
          </div>

          <div className="flex gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-cream dark:bg-gray-700 text-plum dark:text-lavender py-4 rounded-xl font-medium hover:bg-cream-dark dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-plum dark:bg-lavender text-white py-4 rounded-xl font-medium hover:bg-plum-dark dark:hover:bg-lavender-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Save Period'}
            </button>
          </div>
        </form>

        {/* Period History */}
        {periods.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-plum dark:text-lavender px-1">Period History</h3>
            {periods.map((period) => {
              const duration = period.end_date 
                ? Math.round((new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
                : null;

              return (
                <div key={period.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-plum dark:text-lavender" />
                        <span className="font-medium text-plum dark:text-lavender">
                          {format(new Date(period.start_date), 'MMM d, yyyy')}
                          {period.end_date && ` - ${format(new Date(period.end_date), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                      {duration && (
                        <p className="text-sm text-plum/70 dark:text-lavender/70 ml-6">{duration} days</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(period)}
                        className="p-2 hover:bg-cream dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-plum dark:text-lavender" />
                      </button>
                      <button
                        onClick={() => handleDelete(period.id)}
                        className="p-2 hover:bg-rose/10 dark:hover:bg-rose/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-rose" />
                      </button>
                    </div>
                  </div>

                  {period.flow_intensity && (
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-4 h-4 text-plum dark:text-lavender" />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getFlowColor(period.flow_intensity)}`}>
                        {period.flow_intensity}
                      </span>
                    </div>
                  )}

                  {period.notes && (
                    <p className="text-sm text-plum/70 dark:text-lavender/70 bg-cream dark:bg-gray-700 rounded-lg p-3 mt-2">
                      {period.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDailyLog && <DailyLogForm onClose={() => setShowDailyLog(false)} />}
    </div>
  );
}
