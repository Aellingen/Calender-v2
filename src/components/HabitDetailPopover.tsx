import type { Habit, Pillar } from '../lib/types';
import { PillarBadge } from './PillarBadge';

interface HabitDetailPopoverProps {
  habit: Habit;
  pillar: Pillar | undefined;
  isCompleted: boolean;
  onClose: () => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  custom: 'Custom days',
};

export function HabitDetailPopover({ habit, pillar, isCompleted, onClose }: HabitDetailPopoverProps) {
  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 rounded-[var(--r-xl)] animate-scale-in p-4"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display text-sm" style={{ color: 'var(--text)' }}>
              {habit.name}
            </h3>
            {pillar && (
              <div className="mt-1">
                <PillarBadge name={pillar.name} color={pillar.color} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full text-xs cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
          >
            &#x2715;
          </button>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Status</span>
            <span
              className="font-semibold"
              style={{ color: isCompleted ? 'var(--success)' : 'var(--text-secondary)' }}
            >
              {isCompleted ? 'Done today' : 'Pending'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Frequency</span>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {FREQUENCY_LABELS[habit.frequency]}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Current streak</span>
            <span
              className="font-display font-semibold"
              style={{
                color: habit.current_streak >= 30
                  ? 'var(--success)'
                  : habit.current_streak >= 7
                    ? 'var(--warm)'
                    : 'var(--text-secondary)',
              }}
            >
              {habit.current_streak} days
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Longest streak</span>
            <span className="font-display font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {habit.longest_streak} days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
