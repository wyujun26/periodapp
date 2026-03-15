import React, { useMemo, useState } from 'react';
import { Calendar, TrendingUp, Activity, Smile, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { usePeriods } from '../contexts/PeriodContext';
import { useDailyLogs, type Symptom } from '../contexts/DailyLogContext';
import { getAIInsights } from '../lib/anthropic';
import { anonymizeCycleData } from '../utils/anonymizeData';

const COLORS = {
  plum: '#6B2D5E',
  lavender: '#C4B5D4',
  rose: '#E85D75',
  cream: '#FAF8F5',
};

const MOOD_COLORS = {
  happy: '#FFD700',
  calm: '#87CEEB',
  anxious: '#FFA500',
  irritable: '#FF6347',
  sad: '#4682B4',
};

const SYMPTOM_LABELS: Record<Symptom, string> = {
  cramps: 'Cramps',
  bloating: 'Bloating',
  headache: 'Headache',
  fatigue: 'Fatigue',
  tender_breasts: 'Tender Breasts',
  acne: 'Acne',
};

export function InsightsScreen() {
  const { periods, avgCycleLength } = usePeriods();
  const { dailyLogs } = useDailyLogs();
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    symptomTrends: string[];
    wellnessSuggestions: string[];
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Get last 6 completed cycles
  const completedCycles = useMemo(() => {
    return periods
      .filter(p => p.end_date)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, 6)
      .reverse();
  }, [periods]);

  // Cycle length data
  const cycleLengthData = useMemo(() => {
    if (completedCycles.length < 2) return [];

    const data = [];
    for (let i = 1; i < completedCycles.length; i++) {
      const prevStart = new Date(completedCycles[i - 1].start_date);
      const currentStart = new Date(completedCycles[i].start_date);
      const cycleLength = differenceInDays(currentStart, prevStart);

      data.push({
        cycle: `Cycle ${i}`,
        length: cycleLength,
      });
    }
    return data;
  }, [completedCycles]);

  // Period duration data
  const periodDurationData = useMemo(() => {
    return completedCycles.map((period, index) => {
      const start = new Date(period.start_date);
      const end = new Date(period.end_date!);
      const duration = differenceInDays(end, start) + 1;

      return {
        cycle: `Cycle ${index + 1}`,
        duration,
      };
    });
  }, [completedCycles]);

  // Symptom frequency by cycle phase
  const symptomFrequencyData = useMemo(() => {
    const symptomCounts: Record<Symptom, number> = {
      cramps: 0,
      bloating: 0,
      headache: 0,
      fatigue: 0,
      tender_breasts: 0,
      acne: 0,
    };

    dailyLogs.forEach(log => {
      if (log.symptoms) {
        log.symptoms.forEach(symptom => {
          symptomCounts[symptom as Symptom]++;
        });
      }
    });

    return Object.entries(symptomCounts)
      .filter(([_, count]) => count > 0)
      .map(([symptom, count]) => ({
        symptom: SYMPTOM_LABELS[symptom as Symptom],
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [dailyLogs]);

  // Mood distribution (last 30 days)
  const moodDistributionData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moodCounts: Record<string, number> = {
      happy: 0,
      calm: 0,
      anxious: 0,
      irritable: 0,
      sad: 0,
    };

    dailyLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate >= thirtyDaysAgo && log.mood) {
        moodCounts[log.mood]++;
      }
    });

    return Object.entries(moodCounts)
      .filter(([_, count]) => count > 0)
      .map(([mood, count]) => ({
        name: mood.charAt(0).toUpperCase() + mood.slice(1),
        value: count,
        color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS],
      }));
  }, [dailyLogs]);

  // Cycle history
  const cycleHistory = useMemo(() => {
    return completedCycles.map(period => {
      const start = new Date(period.start_date);
      const end = new Date(period.end_date!);
      const duration = differenceInDays(end, start) + 1;

      // Get symptoms during this period
      const periodLogs = dailyLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= start && logDate <= end;
      });

      const symptomSet = new Set<string>();
      periodLogs.forEach(log => {
        if (log.symptoms) {
          log.symptoms.forEach(s => symptomSet.add(SYMPTOM_LABELS[s as Symptom]));
        }
      });

      return {
        id: period.id,
        startDate: format(start, 'MMM d, yyyy'),
        endDate: format(end, 'MMM d, yyyy'),
        duration,
        symptoms: Array.from(symptomSet),
      };
    }).reverse();
  }, [completedCycles, dailyLogs]);

  const handleGetAIInsights = async () => {
    setLoadingAI(true);
    setAiError(null);

    try {
      const anonymizedData = anonymizeCycleData(periods, dailyLogs, avgCycleLength);
      const insights = await getAIInsights(anonymizedData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      setAiError('Unable to generate insights. Please try again later.');
    } finally {
      setLoadingAI(false);
    }
  };

  if (completedCycles.length < 2) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-lavender-light px-4 py-4">
          <h2 className="text-xl font-bold text-plum">Insights</h2>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-lavender/20 rounded-full mb-4">
              <TrendingUp className="w-10 h-10 text-lavender-dark" />
            </div>
            <h3 className="text-xl font-bold text-plum mb-2">Not Enough Data Yet</h3>
            <p className="text-plum/70 mb-4">
              Log at least 2 complete cycles to see your personalized insights and trends.
            </p>
            <div className="bg-lavender/10 rounded-2xl p-4 text-sm text-plum/80">
              <AlertCircle className="w-5 h-5 inline-block mr-2" />
              Keep tracking your periods and daily symptoms to unlock detailed analytics!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-cream">
      <div className="bg-white border-b border-lavender-light px-4 py-4">
        <h2 className="text-xl font-bold text-plum">Insights</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* AI Insights Section */}
          <div className="bg-gradient-to-br from-plum to-plum-dark rounded-2xl p-4 shadow-lg text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">AI-Powered Insights</h3>
            </div>

            {!aiInsights && !loadingAI && (
              <div className="space-y-3">
                <p className="text-sm text-white/90">
                  Get personalized insights about your cycle patterns, symptoms, and wellness suggestions.
                </p>
                <button
                  onClick={handleGetAIInsights}
                  className="w-full bg-white text-plum font-medium py-3 px-4 rounded-xl hover:bg-cream transition-colors"
                >
                  Get Insights
                </button>
                <p className="text-xs text-white/70">
                  ⓘ Only anonymized cycle data is analyzed. No personal information is shared.
                </p>
              </div>
            )}

            {loadingAI && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}

            {aiError && (
              <div className="bg-white/10 rounded-xl p-3 text-sm">
                <AlertCircle className="w-4 h-4 inline-block mr-2" />
                {aiError}
              </div>
            )}

            {aiInsights && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-white/10 rounded-xl p-3">
                  <h4 className="font-medium text-sm mb-2">Your Cycle Patterns</h4>
                  <p className="text-sm text-white/90">{aiInsights.summary}</p>
                </div>

                {/* Symptom Trends */}
                {aiInsights.symptomTrends.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-3">
                    <h4 className="font-medium text-sm mb-2">Notable Trends</h4>
                    <ul className="space-y-1.5">
                      {aiInsights.symptomTrends.map((trend, index) => (
                        <li key={index} className="text-sm text-white/90 flex items-start gap-2">
                          <span className="text-white/60">•</span>
                          <span>{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Wellness Suggestions */}
                {aiInsights.wellnessSuggestions.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-3">
                    <h4 className="font-medium text-sm mb-2">Wellness Suggestions</h4>
                    <ul className="space-y-1.5">
                      {aiInsights.wellnessSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-white/90 flex items-start gap-2">
                          <span className="text-white/60">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-white/5 rounded-xl p-3 text-xs text-white/70">
                  <AlertCircle className="w-3.5 h-3.5 inline-block mr-1.5" />
                  These insights are for informational purposes only and do not constitute medical advice. 
                  Consult a healthcare provider for medical concerns.
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleGetAIInsights}
                  disabled={loadingAI}
                  className="w-full bg-white/20 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  Refresh Insights
                </button>
              </div>
            )}
          </div>

          {/* Cycle Length Chart */}
          {cycleLengthData.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-plum" />
                <h3 className="font-semibold text-plum">Cycle Length Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cycleLengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C4B5D4" opacity={0.3} />
                  <XAxis dataKey="cycle" stroke="#6B2D5E" fontSize={12} />
                  <YAxis stroke="#6B2D5E" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #C4B5D4',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="length"
                    stroke={COLORS.plum}
                    strokeWidth={2}
                    dot={{ fill: COLORS.plum, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Period Duration Chart */}
          {periodDurationData.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-rose" />
                <h3 className="font-semibold text-plum">Period Duration</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={periodDurationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C4B5D4" opacity={0.3} />
                  <XAxis dataKey="cycle" stroke="#6B2D5E" fontSize={12} />
                  <YAxis stroke="#6B2D5E" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #C4B5D4',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="duration" fill={COLORS.rose} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Symptom Frequency Chart */}
          {symptomFrequencyData.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-lavender-dark" />
                <h3 className="font-semibold text-plum">Most Common Symptoms</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={symptomFrequencyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#C4B5D4" opacity={0.3} />
                  <XAxis type="number" stroke="#6B2D5E" fontSize={12} />
                  <YAxis dataKey="symptom" type="category" stroke="#6B2D5E" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #C4B5D4',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS.lavender} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Mood Distribution Chart */}
          {moodDistributionData.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Smile className="w-5 h-5 text-plum" />
                <h3 className="font-semibold text-plum">Mood Distribution (Last 30 Days)</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={moodDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #C4B5D4',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-sm text-plum">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Cycle History */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-plum mb-4">Cycle History</h3>
            <div className="space-y-3">
              {cycleHistory.map((cycle) => (
                <div
                  key={cycle.id}
                  className="bg-cream rounded-xl p-4 border border-lavender-light"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-plum">
                        {cycle.startDate} - {cycle.endDate}
                      </div>
                      <div className="text-xs text-plum/60 mt-1">
                        {cycle.duration} {cycle.duration === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>
                  {cycle.symptoms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cycle.symptoms.map((symptom) => (
                        <span
                          key={symptom}
                          className="px-2 py-1 bg-lavender/20 text-plum text-xs rounded-lg"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
