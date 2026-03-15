import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { usePeriods } from '../contexts/PeriodContext';
import { calculateFertilityWindow } from '../utils/fertilityCalculations';

export function CalendarScreen() {
  const { periods, avgCycleLength } = usePeriods();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get fertility window
  const fertilityWindow = calculateFertilityWindow(periods, avgCycleLength);

  // Determine day type
  const getDayType = (date: Date) => {
    // Check if it's a period day
    const isPeriodDay = periods.some(period => {
      const start = new Date(period.start_date);
      const end = period.end_date ? new Date(period.end_date) : start;
      return date >= start && date <= end;
    });

    if (isPeriodDay) return 'period';

    // Check fertility window
    if (fertilityWindow) {
      const dateStr = format(date, 'yyyy-MM-dd');
      if (fertilityWindow.ovulationDate === dateStr) return 'ovulation';
      if (fertilityWindow.fertileWindow.includes(dateStr)) return 'fertile';
    }

    return 'normal';
  };

  const getDayStyles = (type: string) => {
    switch (type) {
      case 'period':
        return 'bg-rose text-white';
      case 'ovulation':
        return 'bg-plum dark:bg-lavender text-white';
      case 'fertile':
        return 'bg-lavender/30 dark:bg-lavender/20 text-plum dark:text-lavender';
      default:
        return 'text-plum dark:text-lavender';
    }
  };

  // Empty state
  if (periods.length === 0) {
    return (
      <div className="h-full flex flex-col bg-cream dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-lavender-light dark:border-gray-700 px-4 py-4">
          <h2 className="text-xl font-bold text-plum dark:text-lavender">Calendar</h2>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-lavender/20 dark:bg-lavender/30 rounded-full mb-4">
              <CalendarIcon className="w-10 h-10 text-lavender-dark dark:text-lavender" />
            </div>
            <h3 className="text-xl font-bold text-plum dark:text-lavender mb-2">No Cycles Yet</h3>
            <p className="text-plum/70 dark:text-lavender/70">
              Start tracking your periods to see them on the calendar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-cream dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-lavender-light dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-plum dark:text-lavender">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-lavender-light dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-plum dark:text-lavender" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-lavender-light dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-plum dark:text-lavender" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-plum/60 dark:text-lavender/60 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(day => {
              const dayType = getDayType(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                    ${getDayStyles(dayType)}
                    ${!isCurrentMonth && 'opacity-30'}
                    ${isTodayDate && dayType === 'normal' && 'ring-2 ring-plum dark:ring-lavender'}
                    transition-colors
                  `}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-lavender-light dark:border-gray-700 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose rounded"></div>
              <span className="text-xs text-plum dark:text-lavender">Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-plum dark:bg-lavender rounded"></div>
              <span className="text-xs text-plum dark:text-lavender">Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-lavender/30 dark:bg-lavender/20 rounded"></div>
              <span className="text-xs text-plum dark:text-lavender">Fertile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-plum dark:border-lavender rounded"></div>
              <span className="text-xs text-plum dark:text-lavender">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
