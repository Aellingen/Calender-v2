import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { fetchActionDensity } from '../lib/api';

interface CalendarSidebarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CalendarSidebar({ selectedDate, onSelectDate }: CalendarSidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rangeStart = format(calStart, 'yyyy-MM-dd');
  const rangeEnd = format(calEnd, 'yyyy-MM-dd');

  const { data: density } = useQuery({
    queryKey: ['action-density', rangeStart, rangeEnd],
    queryFn: () => fetchActionDensity(rangeStart, rangeEnd),
  });

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [calStart, calEnd]);

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-full text-xs cursor-pointer"
          style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
        >
          &#x2039;
        </button>
        <span className="font-display text-sm" style={{ color: 'var(--text)' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-full text-xs cursor-pointer"
          style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
        >
          &#x203A;
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold py-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {weeks.flat().map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDateObj);
          const today = isToday(day);
          const count = density?.[dateStr] ?? 0;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className="relative w-full aspect-square flex flex-col items-center justify-center rounded-[var(--r-sm)] text-xs cursor-pointer transition-all"
              style={{
                background: isSelected ? 'var(--accent-softer)' : 'transparent',
                color: !inMonth
                  ? 'var(--text-dim)'
                  : isSelected
                    ? 'var(--accent)'
                    : today
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                fontWeight: today || isSelected ? 700 : 400,
                border: isSelected ? '1px solid var(--accent-light)' : '1px solid transparent',
              }}
            >
              {day.getDate()}
              {/* Density dots */}
              {count > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ background: isSelected ? 'var(--accent)' : 'var(--text-muted)' }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
