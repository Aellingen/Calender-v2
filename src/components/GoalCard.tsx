import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { Goal, Pillar, Action } from '../lib/types';
import { PillarBadge } from './PillarBadge';
import { ProgressRing } from './ProgressRing';
import { MomentumDots } from './MomentumDots';

interface GoalCardProps {
  goal: Goal;
  pillar: Pillar;
  actions: Action[];
  habitCount: number;
  onClick: () => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

export function GoalCard({
  goal,
  pillar,
  actions,
  habitCount,
  onClick,
  dragHandleListeners,
  dragHandleAttributes,
}: GoalCardProps) {
  const completedActions = actions.filter((a) => a.status === 'complete');
  const activeActions = actions.filter((a) => a.status === 'active');
  const total = actions.length;
  const done = completedActions.length;
  const progress = total > 0 ? done / total : 0;

  const previewActions = actions.slice(0, 4);
  const overflow = actions.length - 4;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      className="flex flex-col h-[220px] rounded-[var(--r-xl)] cursor-pointer group"
      style={{
        borderLeft: `5px solid ${pillar.color}`,
        border: `1px solid var(--border)`,
        borderLeftWidth: '5px',
        borderLeftColor: pillar.color,
        background: `linear-gradient(135deg, ${pillar.color}10 0%, transparent 60%), var(--card)`,
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--accent-light)';
        el.style.borderLeftColor = pillar.color;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border)';
        el.style.borderLeftColor = pillar.color;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Zone 1: Header */}
      <div className="flex items-start gap-2 px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <h3
            className="font-display text-base leading-snug line-clamp-2"
            style={{ color: 'var(--text)' }}
          >
            {goal.name}
          </h3>
          {goal.description && (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              {goal.description}
            </p>
          )}
          <div className="mt-1.5">
            <PillarBadge name={pillar.name} color={pillar.color} />
          </div>
        </div>
        <ProgressRing progress={progress} color={pillar.color} />
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--slider-bg)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: pillar.color,
            transition: 'width 0.5s var(--ease-out)',
          }}
        />
      </div>

      {/* Zone 2: Content (flex fill) */}
      <div className="flex-1 px-4 py-2 overflow-hidden">
        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {previewActions.map((action) => (
              <span
                key={action.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-[var(--r-sm)] truncate max-w-[140px]"
                style={{
                  background: action.status === 'complete' ? 'var(--success-softer)' : 'var(--bg)',
                  color: action.status === 'complete' ? 'var(--success)' : 'var(--text-secondary)',
                  border: `1px solid ${action.status === 'complete' ? 'var(--success-light)' : 'var(--border)'}`,
                }}
              >
                {action.status === 'complete' && (
                  <span style={{ color: 'var(--success)' }}>&#x2713;</span>
                )}
                {action.name}
              </span>
            ))}
            {overflow > 0 && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-[var(--r-sm)]"
                style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
              >
                +{overflow}
              </span>
            )}
          </div>
        ) : (
          <div
            className="flex items-center justify-center h-full text-xs rounded-[var(--r-md)]"
            style={{
              border: '1px dashed var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            Add an action
          </div>
        )}
        {habitCount > 0 && (
          <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            &#x27F3; {habitCount} habit{habitCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Zone 3: Footer */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <MomentumDots active={activeActions.length} total={total} color={pillar.color} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {done} / {total} done
          </span>
        </div>
        {/* Drag handle */}
        <button
          type="button"
          className="p-1 rounded cursor-grab opacity-0 group-hover:opacity-60 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
          onClick={(e) => e.stopPropagation()}
          {...dragHandleListeners}
          {...dragHandleAttributes}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
