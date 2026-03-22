import type { Habit } from '../lib/types';

interface HabitCircleProps {
  habit: Habit;
  pillarColor: string;
  isCompleted: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}

export function HabitCircle({ habit, pillarColor, isCompleted, onToggle, onLongPress }: HabitCircleProps) {
  const icon = habit.icon || habit.name.charAt(0).toUpperCase();
  const streakColor =
    habit.current_streak >= 30
      ? 'var(--success)'
      : habit.current_streak >= 7
        ? 'var(--warm)'
        : 'var(--text-muted)';

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={onToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          onLongPress();
        }}
        className="relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-all"
        style={{
          background: isCompleted ? pillarColor : 'transparent',
          border: isCompleted ? 'none' : `2.5px solid ${pillarColor}40`,
          color: isCompleted ? 'white' : 'var(--text-secondary)',
        }}
      >
        {isCompleted ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="animate-scale-in">
            <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span>{icon}</span>
        )}
      </button>
      <span
        className="text-[10px] max-w-[52px] truncate text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        {habit.name}
      </span>
      {habit.current_streak > 0 && (
        <span
          className="font-display text-[10px]"
          style={{ color: streakColor }}
        >
          {habit.current_streak}
        </span>
      )}
    </div>
  );
}
