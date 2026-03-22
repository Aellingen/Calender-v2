import { useState } from 'react';
import { format } from 'date-fns';
import { useCreateAction } from '../hooks/useActions';
import { useGoals } from '../hooks/useGoals';
import { usePillars } from '../hooks/usePillars';
import type { Goal, Pillar } from '../lib/types';

interface CreateActionModalProps {
  onClose: () => void;
  prefilledDate?: string;
  prefilledGoalId?: string;
}

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Normal' },
  { value: 3, label: 'High' },
] as const;

export function CreateActionModal({ onClose, prefilledDate, prefilledGoalId }: CreateActionModalProps) {
  const { data: goals } = useGoals('active');
  const { data: pillars } = usePillars();
  const createAction = useCreateAction();

  const [name, setName] = useState('');
  const [goalId, setGoalId] = useState(prefilledGoalId ?? '');
  const [scheduledDate, setScheduledDate] = useState(prefilledDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [scheduledTime, setScheduledTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [priority, setPriority] = useState(2);

  const canSubmit = name.trim() && goalId;

  const pillarMap = new Map<string, Pillar>();
  pillars?.forEach((p: Pillar) => pillarMap.set(p.id, p));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    await createAction.mutateAsync({
      name: name.trim(),
      goal_id: goalId,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime || null,
      estimated_minutes: estimatedMinutes ? Number(estimatedMinutes) : null,
      priority,
    });
    onClose();
  }

  const selectedGoal = goals?.find((g: Goal) => g.id === goalId);
  const selectedPillar = selectedGoal ? pillarMap.get(selectedGoal.pillar_id) : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(28,25,23,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[var(--r-2xl)] animate-modal-in overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-display text-lg" style={{ color: 'var(--text)' }}>
            New Action
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
          >
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Action name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to get done?"
              autoFocus
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Goal picker */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Goal *
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none cursor-pointer"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              <option value="">Select a goal...</option>
              {goals?.map((g: Goal) => {
                const p = pillarMap.get(g.pillar_id);
                return (
                  <option key={g.id} value={g.id}>
                    {p ? `${p.name} → ` : ''}{g.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date + Time row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Scheduled date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          {/* Duration + Priority */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Estimated (minutes)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="30"
                min="1"
                className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Priority
              </label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className="flex-1 py-2 rounded-[var(--r-md)] text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      background: priority === p.value ? 'var(--accent-softer)' : 'var(--bg)',
                      color: priority === p.value ? 'var(--accent)' : 'var(--text-secondary)',
                      border: priority === p.value ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-[var(--r-md)] cursor-pointer"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || createAction.isPending}
            className="px-5 py-2 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
            style={{
              background: canSubmit ? (selectedPillar?.color ?? 'var(--accent)') : 'var(--text-dim)',
              boxShadow: canSubmit ? 'var(--shadow-accent)' : 'none',
              opacity: canSubmit && !createAction.isPending ? 1 : 0.6,
            }}
          >
            {createAction.isPending ? 'Creating...' : 'Create Action'}
          </button>
        </div>
      </form>
    </div>
  );
}
