import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useTodayHabits, useTodayCompletions, useToggleHabitCompletion } from '../hooks/useHabits';
import { usePillars } from '../hooks/usePillars';
import { HabitCircle } from './HabitCircle';
import { HabitDetailPopover } from './HabitDetailPopover';
import type { Habit, Pillar, HabitCompletion } from '../lib/types';

export function HabitStrip() {
  const { data: habits } = useTodayHabits();
  const { data: completions } = useTodayCompletions();
  const { data: pillars } = usePillars();
  const toggleCompletion = useToggleHabitCompletion();
  const [popoverHabitId, setPopoverHabitId] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const pillarMap = useMemo(() => {
    const map = new Map<string, Pillar>();
    pillars?.forEach((p: Pillar) => map.set(p.id, p));
    return map;
  }, [pillars]);

  const completionSet = useMemo(() => {
    const set = new Set<string>();
    completions?.forEach((c: HabitCompletion) => set.add(c.habit_id));
    return set;
  }, [completions]);

  // Sort: incomplete first, then by sort_order
  const sortedHabits = useMemo(() => {
    if (!habits) return [];
    return [...habits].sort((a: Habit, b: Habit) => {
      const aComplete = completionSet.has(a.id) ? 1 : 0;
      const bComplete = completionSet.has(b.id) ? 1 : 0;
      if (aComplete !== bComplete) return aComplete - bComplete;
      return a.sort_order - b.sort_order;
    });
  }, [habits, completionSet]);

  if (!habits || habits.length === 0) return null;

  const popoverHabit = popoverHabitId ? habits.find((h: Habit) => h.id === popoverHabitId) : null;

  return (
    <div className="relative mb-5">
      <div
        className="flex items-start gap-4 px-4 py-3 rounded-[var(--r-lg)] overflow-x-auto no-scrollbar"
        style={{
          background: 'var(--bg-warm)',
          border: '1px solid var(--border)',
        }}
      >
        {sortedHabits.map((habit: Habit) => {
          const pillar = pillarMap.get(habit.pillar_id);
          const isCompleted = completionSet.has(habit.id);
          return (
            <div key={habit.id} style={{ opacity: isCompleted ? 0.6 : 1 }}>
              <HabitCircle
                habit={habit}
                pillarColor={pillar?.color ?? 'var(--accent)'}
                isCompleted={isCompleted}
                onToggle={() => toggleCompletion.mutate({ habitId: habit.id, date: today })}
                onLongPress={() => setPopoverHabitId(habit.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Detail popover */}
      {popoverHabit && (
        <HabitDetailPopover
          habit={popoverHabit}
          pillar={pillarMap.get(popoverHabit.pillar_id)}
          isCompleted={completionSet.has(popoverHabit.id)}
          onClose={() => setPopoverHabitId(null)}
        />
      )}
    </div>
  );
}
