import { useState } from 'react';
import { useCreateGoal } from '../hooks/useGoals';
import { usePillars } from '../hooks/usePillars';
import type { Pillar } from '../lib/types';

interface CreateGoalModalProps {
  onClose: () => void;
  preselectedPillarId?: string;
}

const GOAL_TYPES = [
  { value: 'outcome', label: 'Outcome', desc: 'A result to achieve' },
  { value: 'process', label: 'Process', desc: 'An ongoing practice' },
  { value: 'milestone', label: 'Milestone', desc: 'A specific checkpoint' },
] as const;

export function CreateGoalModal({ onClose, preselectedPillarId }: CreateGoalModalProps) {
  const { data: pillars } = usePillars();
  const createGoal = useCreateGoal();

  const [name, setName] = useState('');
  const [pillarId, setPillarId] = useState(preselectedPillarId ?? '');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<'outcome' | 'process' | 'milestone'>('outcome');
  const [mode, setMode] = useState<'checked' | 'counted'>('checked');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');

  const canSubmit = name.trim() && pillarId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    await createGoal.mutateAsync({
      name: name.trim(),
      pillar_id: pillarId,
      description: description.trim() || null,
      goal_type: goalType,
      mode,
      target: mode === 'counted' && target ? Number(target) : null,
      unit: mode === 'counted' && unit ? unit.trim() : null,
      deadline: deadline || null,
    });
    onClose();
  }

  const selectedPillar = pillars?.find((p: Pillar) => p.id === pillarId);

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
            New Goal
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
              Goal name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What do you want to achieve?"
              autoFocus
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Pillar picker */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Pillar *
            </label>
            <div className="flex flex-wrap gap-2">
              {pillars?.map((p: Pillar) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPillarId(p.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] transition-all cursor-pointer"
                  style={{
                    background: p.id === pillarId ? `${p.color}20` : 'var(--bg)',
                    color: p.id === pillarId ? p.color : 'var(--text-secondary)',
                    border: p.id === pillarId ? `2px solid ${p.color}` : '1px solid var(--border)',
                    transform: p.id === pillarId ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: p.color }}
                  />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this goal matter?"
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none resize-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Goal type */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_TYPES.map((gt) => (
                <button
                  key={gt.value}
                  type="button"
                  onClick={() => setGoalType(gt.value)}
                  className="text-center py-2 rounded-[var(--r-md)] text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: goalType === gt.value ? 'var(--accent-softer)' : 'var(--bg)',
                    color: goalType === gt.value ? 'var(--accent)' : 'var(--text-secondary)',
                    border: goalType === gt.value ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                  }}
                >
                  {gt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Tracking mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('checked')}
                className="flex-1 py-2 rounded-[var(--r-md)] text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: mode === 'checked' ? 'var(--accent-softer)' : 'var(--bg)',
                  color: mode === 'checked' ? 'var(--accent)' : 'var(--text-secondary)',
                  border: mode === 'checked' ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                }}
              >
                Checked (done/not done)
              </button>
              <button
                type="button"
                onClick={() => setMode('counted')}
                className="flex-1 py-2 rounded-[var(--r-md)] text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: mode === 'counted' ? 'var(--accent-softer)' : 'var(--bg)',
                  color: mode === 'counted' ? 'var(--accent)' : 'var(--text-secondary)',
                  border: mode === 'counted' ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                }}
              >
                Counted (numeric)
              </button>
            </div>
          </div>

          {/* Target/Unit (if counted) */}
          {mode === 'counted' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Target
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="100"
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
                  Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="pages, km, etc."
                  className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
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
            disabled={!canSubmit || createGoal.isPending}
            className="px-5 py-2 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
            style={{
              background: canSubmit ? (selectedPillar?.color ?? 'var(--accent)') : 'var(--text-dim)',
              boxShadow: canSubmit ? 'var(--shadow-accent)' : 'none',
              opacity: canSubmit && !createGoal.isPending ? 1 : 0.6,
            }}
          >
            {createGoal.isPending ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
}
