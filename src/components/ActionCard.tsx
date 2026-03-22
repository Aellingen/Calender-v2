import type { Action, Goal, Pillar } from '../lib/types';

interface ActionCardProps {
  action: Action;
  goal: Goal | undefined;
  pillar: Pillar | undefined;
  onToggleComplete: () => void;
}

export function ActionCard({ action, goal, pillar, onToggleComplete }: ActionCardProps) {
  const isComplete = action.status === 'complete';

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] transition-all group"
      style={{
        background: 'var(--card)',
        border: `1px solid ${isComplete ? 'var(--success-light)' : 'var(--border)'}`,
        opacity: isComplete ? 0.7 : 1,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Completion toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all"
        style={{
          background: isComplete ? 'var(--success)' : 'transparent',
          border: isComplete ? 'none' : '2px solid var(--border)',
          color: 'white',
        }}
      >
        {isComplete && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Time */}
      <span
        className="w-12 text-xs font-semibold shrink-0 text-right"
        style={{ color: 'var(--text-muted)' }}
      >
        {action.scheduled_time
          ? action.scheduled_time.slice(0, 5)
          : '—'}
      </span>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color: isComplete ? 'var(--success)' : 'var(--text)',
            textDecoration: isComplete ? 'line-through' : 'none',
          }}
        >
          {action.name}
        </p>
        {goal && (
          <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
            {goal.name}
          </p>
        )}
      </div>

      {/* Pillar dot */}
      {pillar && (
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: pillar.color }}
          title={pillar.name}
        />
      )}

      {/* Duration badge */}
      {action.estimated_minutes && !isComplete && (
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--r-sm)] shrink-0"
          style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
        >
          {action.estimated_minutes}m
        </span>
      )}

      {/* Priority indicator */}
      {action.priority >= 3 && !isComplete && (
        <span
          className="text-[10px] font-bold shrink-0"
          style={{ color: 'var(--warm)' }}
        >
          !
        </span>
      )}
    </div>
  );
}
