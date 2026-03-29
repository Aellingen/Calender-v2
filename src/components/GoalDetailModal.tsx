import { useState } from 'react';
import { format } from 'date-fns';
import type { Goal, Pillar, Action } from '../lib/types';
import { useUpdateGoal, useDeleteGoal } from '../hooks/useGoals';
import { useHabitsByGoal } from '../hooks/useHabits';
import { usePillars } from '../hooks/usePillars';
import { useUIStore } from '../lib/store';
import { PillarBadge } from './PillarBadge';
import { ProgressRing } from './ProgressRing';
import { CreateHabitModal } from './CreateHabitModal';

interface GoalDetailModalProps {
  goal: Goal;
  pillar: Pillar;
  actions: Action[];
  onClose: () => void;
}

const STATUS_OPTIONS = ['active', 'paused', 'archived', 'complete'] as const;
const GOAL_TYPE_LABELS: Record<string, string> = {
  outcome: 'Outcome',
  process: 'Process',
  milestone: 'Milestone',
};

export function GoalDetailModal({
  goal,
  pillar,
  actions,
  onClose,
}: GoalDetailModalProps) {
  const { data: pillars } = usePillars();
  const { data: linkedHabits } = useHabitsByGoal(goal.id);
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const { openAIChatWithContext } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [name, setName] = useState(goal.name);
  const [description, setDescription] = useState(goal.description ?? '');
  const [status, setStatus] = useState(goal.status);
  const [editPillarId, setEditPillarId] = useState(goal.pillar_id);
  const [deadline, setDeadline] = useState(goal.deadline ?? '');

  const done = actions.filter((a) => a.status === 'complete').length;
  const total = actions.length;
  const progress = total > 0 ? done / total : 0;

  async function handleSave() {
    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        data: {
          name: name.trim(),
          description: description.trim() || null,
          status,
          pillar_id: editPillarId,
          deadline: deadline || null,
        },
      });
      setIsEditing(false);
    } catch {
      // Error toast handled by hook onError
    }
  }

  async function handleDelete() {
    try {
      await deleteGoal.mutateAsync(goal.id);
      onClose();
    } catch {
      // Error toast handled by hook onError
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ top: '3.5rem', background: 'rgba(28,25,23,0.15)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-[var(--r-2xl)] animate-modal-in overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color header strip */}
        <div className="h-2" style={{ background: pillar.color }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-3">
          <div className="flex-1 min-w-0 pr-4">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full font-display text-lg outline-none bg-transparent"
                style={{
                  color: 'var(--text)',
                  borderBottom: `2px solid ${pillar.color}`,
                  paddingBottom: '2px',
                }}
              />
            ) : (
              <h2 className="font-display text-lg" style={{ color: 'var(--text)' }}>
                {goal.name}
              </h2>
            )}
            <div className="mt-1.5">
              <PillarBadge name={pillar.name} color={pillar.color} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProgressRing progress={progress} color={pillar.color} />
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm cursor-pointer"
              style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3">
            <span
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-[var(--r-full)]"
              style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {GOAL_TYPE_LABELS[goal.goal_type]}
            </span>
            <span
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-[var(--r-full)] capitalize"
              style={{
                background: status === 'active' ? 'var(--success-softer)' : 'var(--bg)',
                color: status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                border: `1px solid ${status === 'active' ? 'var(--success-light)' : 'var(--border)'}`,
              }}
            >
              {status}
            </span>
            {goal.mode === 'counted' && goal.target && (
              <span
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-[var(--r-full)]"
                style={{ background: 'var(--accent-softer)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}
              >
                {goal.current_value} / {goal.target} {goal.unit ?? ''}
              </span>
            )}
            {goal.deadline && (
              <span
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-[var(--r-full)]"
                style={{ background: 'var(--warm-softer)', color: 'var(--warm)', border: '1px solid var(--warm-light)' }}
              >
                Due {format(new Date(goal.deadline), 'MMM d, yyyy')}
              </span>
            )}
          </div>

          {/* Description */}
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Description..."
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none resize-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          ) : goal.description ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {goal.description}
            </p>
          ) : null}

          {/* Edit: pillar picker */}
          {isEditing && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Pillar
              </label>
              <div className="flex flex-wrap gap-2">
                {pillars?.map((p: Pillar) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEditPillarId(p.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] cursor-pointer"
                    style={{
                      background: p.id === editPillarId ? `${p.color}20` : 'var(--bg)',
                      color: p.id === editPillarId ? p.color : 'var(--text-secondary)',
                      border: p.id === editPillarId ? `2px solid ${p.color}` : '1px solid var(--border)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Edit: status + deadline */}
          {isEditing && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Goal['status'])}
                  className="w-full px-3 py-2 text-sm rounded-[var(--r-md)] outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-[var(--r-md)] outline-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions list */}
          <div>
            <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Actions ({done}/{total} complete)
            </h3>
            {actions.length > 0 ? (
              <div className="space-y-1.5">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm"
                    style={{
                      background: action.status === 'complete' ? 'var(--success-softer)' : 'var(--bg)',
                      border: `1px solid ${action.status === 'complete' ? 'var(--success-light)' : 'var(--border)'}`,
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0"
                      style={{
                        background: action.status === 'complete' ? 'var(--success)' : 'transparent',
                        border: action.status === 'complete' ? 'none' : '2px solid var(--border)',
                        color: 'white',
                      }}
                    >
                      {action.status === 'complete' ? '&#x2713;' : ''}
                    </span>
                    <span
                      style={{
                        color: action.status === 'complete' ? 'var(--success)' : 'var(--text)',
                        textDecoration: action.status === 'complete' ? 'line-through' : 'none',
                      }}
                    >
                      {action.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No actions yet. Add actions to track progress.
              </p>
            )}
          </div>

          {/* Linked habits section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Linked Habits ({linkedHabits?.length ?? 0})
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setShowCreateHabit(true)}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-[var(--r-sm)] cursor-pointer"
                  style={{ color: 'var(--accent)', background: 'var(--accent-softer)' }}
                >
                  + Add habit
                </button>
              )}
            </div>
            {linkedHabits && linkedHabits.length > 0 ? (
              <div className="space-y-1.5">
                {linkedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-sm">{habit.icon || habit.name.charAt(0)}</span>
                    <span style={{ color: 'var(--text)' }}>{habit.name}</span>
                    {habit.current_streak > 0 && (
                      <span
                        className="ml-auto font-display text-xs"
                        style={{
                          color: habit.current_streak >= 30
                            ? 'var(--success)'
                            : habit.current_streak >= 7
                              ? 'var(--warm)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {habit.current_streak} day streak
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No habits linked. Add a habit to build consistency.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteGoal.isPending}
                className="px-3 py-2 text-xs font-semibold rounded-[var(--r-md)] cursor-pointer"
                style={{
                  color: 'var(--danger)',
                  background: 'var(--danger-softer)',
                  border: '1px solid var(--danger-light)',
                  opacity: deleteGoal.isPending ? 0.5 : 1,
                }}
              >
                {deleteGoal.isPending ? 'Deleting...' : 'Delete Goal'}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-[var(--r-md)] cursor-pointer"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!name.trim() || updateGoal.isPending}
                  className="px-5 py-2 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
                  style={{
                    background: pillar.color,
                    opacity: name.trim() && !updateGoal.isPending ? 1 : 0.6,
                  }}
                >
                  {updateGoal.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openAIChatWithContext({
                      type: 'goal',
                      id: goal.id,
                      initialMessage: `Help me break down my goal "${goal.name}" into actionable steps`,
                    });
                    onClose();
                  }}
                  className="px-3 py-2 text-sm font-semibold rounded-[var(--r-md)] cursor-pointer"
                  style={{
                    color: 'var(--accent)',
                    background: 'var(--accent-softer)',
                    border: '1px solid var(--accent-light)',
                  }}
                >
                  ✨ Ask AI
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-semibold rounded-[var(--r-md)] cursor-pointer"
                  style={{
                    color: 'var(--accent)',
                    background: 'var(--accent-softer)',
                    border: '1px solid var(--accent-light)',
                  }}
                >
                  Edit
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold rounded-[var(--r-md)] cursor-pointer"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>

      {/* Create habit modal */}
      {showCreateHabit && (
        <CreateHabitModal
          onClose={() => setShowCreateHabit(false)}
          preselectedPillarId={goal.pillar_id}
          preselectedGoalId={goal.id}
        />
      )}
    </div>
  );
}
