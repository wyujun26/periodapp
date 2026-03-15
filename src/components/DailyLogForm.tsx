import React, { useState, useEffect } from 'react';
import { Smile, Frown, Meh, Zap, Cloud, Calendar, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useDailyLogs, type Mood, type Symptom } from '../contexts/DailyLogContext';

const MOODS: { value: Mood; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'happy', label: 'Happy', icon: <Smile className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600 border-yellow-300' },
  { value: 'calm', label: 'Calm', icon: <Cloud className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600 border-blue-300' },
  { value: 'anxious', label: 'Anxious', icon: <Zap className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600 border-orange-300' },
  { value: 'irritable', label: 'Irritable', icon: <Frown className="w-6 h-6" />, color: 'bg-red-100 text-red-600 border-red-300' },
  { value: 'sad', label: 'Sad', icon: <Meh className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600 border-purple-300' },
];

const SYMPTOMS: { value: Symptom; label: string }[] = [
  { value: 'cramps', label: 'Cramps' },
  { value: 'bloating', label: 'Bloating' },
  { value: 'headache', label: 'Headache' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'tender_breasts', label: 'Tender Breasts' },
  { value: 'acne', label: 'Acne' },
];

const FLOW_INTENSITIES = ['spotting', 'light', 'medium', 'heavy'] as const;

interface DailyLogFormProps {
  onClose: () => void;
}

export function DailyLogForm({ onClose }: DailyLogFormProps) {
  const { getLogForDate, addOrUpdateLog } = useDailyLogs();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mood, setMood] = useState<Mood | null>(null);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Load existing log when date changes
  useEffect(() => {
    const existingLog = getLogForDate(selectedDate);
    if (existingLog) {
      setMood(existingLog.mood as Mood | null);
      setSymptoms((existingLog.symptoms as Symptom[]) || []);
      setFlowIntensity(existingLog.flow_intensity);
      setNotes(existingLog.notes || '');
    } else {
      setMood(null);
      setSymptoms([]);
      setFlowIntensity(null);
      setNotes('');
    }
  }, [selectedDate, getLogForDate]);

  const toggleSymptom = (symptom: Symptom) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await addOrUpdateLog({
      date: selectedDate,
      mood,
      symptoms: symptoms.length > 0 ? symptoms : null,
      flow_intensity: flowIntensity,
      notes: notes.trim() || null,
    });

    setSaving(false);
    onClose();
  };

  const hasData = mood || symptoms.length > 0 || flowIntensity || notes.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-lavender-light px-4 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-plum">Daily Log</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-plum" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Date Selection */}
          <div className="bg-cream rounded-2xl p-4">
            <label className="block text-sm font-medium text-plum mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lavender-dark" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-plum focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-plum mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((moodOption) => (
                <button
                  key={moodOption.value}
                  type="button"
                  onClick={() => setMood(mood === moodOption.value ? null : moodOption.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    mood === moodOption.value
                      ? moodOption.color
                      : 'bg-white border-lavender-light hover:border-lavender'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {moodOption.icon}
                    <span className="text-xs font-medium">{moodOption.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-plum mb-3">
              Symptoms (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOMS.map((symptom) => (
                <button
                  key={symptom.value}
                  type="button"
                  onClick={() => toggleSymptom(symptom.value)}
                  className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                    symptoms.includes(symptom.value)
                      ? 'bg-plum text-white'
                      : 'bg-cream text-plum hover:bg-cream-dark'
                  }`}
                >
                  {symptom.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flow Intensity */}
          <div>
            <label className="block text-sm font-medium text-plum mb-3">
              Flow Intensity (if on period)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FLOW_INTENSITIES.map((intensity) => (
                <button
                  key={intensity}
                  type="button"
                  onClick={() => setFlowIntensity(flowIntensity === intensity ? null : intensity)}
                  className={`py-3 px-3 rounded-xl font-medium transition-all capitalize text-sm ${
                    flowIntensity === intensity
                      ? 'bg-rose text-white'
                      : 'bg-cream text-plum hover:bg-cream-dark'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-plum mb-2">
              Notes (optional, max 200 characters)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              className="w-full px-4 py-3 bg-cream rounded-xl border-2 border-transparent focus:border-plum focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="How are you feeling today?"
            />
            <p className="text-xs text-plum/50 mt-1 text-right">
              {notes.length}/200
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !hasData}
            className="w-full bg-plum text-white py-4 rounded-xl font-medium hover:bg-plum-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Daily Log'}
          </button>
        </form>
      </div>
    </div>
  );
}
