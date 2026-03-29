import { useState, useMemo } from 'react';
import { useCreateHabit } from '../hooks/useHabits';
import { usePillars } from '../hooks/usePillars';
import { useGoals } from '../hooks/useGoals';
import type { Pillar, Goal } from '../lib/types';

interface CreateHabitModalProps {
  onClose: () => void;
  preselectedPillarId?: string;
  preselectedGoalId?: string;
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom' },
] as const;

const DAY_LABELS = [
  { iso: 1, label: 'Mon' },
  { iso: 2, label: 'Tue' },
  { iso: 3, label: 'Wed' },
  { iso: 4, label: 'Thu' },
  { iso: 5, label: 'Fri' },
  { iso: 6, label: 'Sat' },
  { iso: 7, label: 'Sun' },
] as const;

export function CreateHabitModal({ onClose, preselectedPillarId, preselectedGoalId }: CreateHabitModalProps) {
  const { data: pillars } = usePillars();
  const { data: goals } = useGoals('active');
  const createHabit = useCreateHabit();

  const [name, setName] = useState('');
  const [pillarId, setPillarId] = useState(preselectedPillarId ?? '');
  const [goalId, setGoalId] = useState(preselectedGoalId ?? '');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [icon, setIcon] = useState('');

  const canSubmit = name.trim() && pillarId;

  // Filter goals by selected pillar
  const filteredGoals = useMemo(() => {
    if (!goals || !pillarId) return [];
    return goals.filter((g: Goal) => g.pillar_id === pillarId);
  }, [goals, pillarId]);

  const selectedPillar = pillars?.find((p: Pillar) => p.id === pillarId);

  function toggleDay(iso: number) {
    setCustomDays((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await createHabit.mutateAsync({
        name: name.trim(),
        pillar_id: pillarId,
        goal_id: goalId || null,
        icon: icon.trim() || null,
        frequency,
        custom_days: frequency === 'custom' ? customDays : null,
      });
      onClose();
    } catch {
      // Error toast handled by hook onError
    }
  }

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
            New Habit
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
          {/* Name + Icon */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Habit name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Meditate 10 min"
                autoFocus
                className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div className="w-20">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Icon
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🧘"
                maxLength={2}
                className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none text-center"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
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
                  onClick={() => {
                    setPillarId(p.id);
                    setGoalId(''); // Reset goal when pillar changes
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] transition-all cursor-pointer"
                  style={{
                    background: p.id === pillarId ? `${p.color}20` : 'var(--bg)',
                    color: p.id === pillarId ? p.color : 'var(--text-secondary)',
                    border: p.id === pillarId ? `2px solid ${p.color}` : '1px solid var(--border)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Goal picker (optional, filtered by pillar) */}
          {pillarId && filteredGoals.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Linked goal (optional)
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
                <option value="">No linked goal</option>
                {filteredGoals.map((g: Goal) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className="py-2 rounded-[var(--r-md)] text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: frequency === f.value ? 'var(--accent-softer)' : 'var(--bg)',
                    color: frequency === f.value ? 'var(--accent)' : 'var(--text-secondary)',
                    border: frequency === f.value ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom day picker */}
          {frequency === 'custom' && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Which days?
              </label>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => toggleDay(d.iso)}
                    className="flex-1 py-2 rounded-[var(--r-md)] text-xs font-semibold cursor-pointer transition-all"
                    style={{
                      background: customDays.includes(d.iso) ? 'var(--accent-softer)' : 'var(--bg)',
                      color: customDays.includes(d.iso) ? 'var(--accent)' : 'var(--text-muted)',
                      border: customDays.includes(d.iso) ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            disabled={!canSubmit || createHabit.isPending}
            className="px-5 py-2 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
            style={{
              background: canSubmit ? (selectedPillar?.color ?? 'var(--accent)') : 'var(--text-dim)',
              boxShadow: canSubmit ? 'var(--shadow-accent)' : 'none',
              opacity: canSubmit && !createHabit.isPending ? 1 : 0.6,
            }}
          >
            {createHabit.isPending ? 'Creating...' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
}
