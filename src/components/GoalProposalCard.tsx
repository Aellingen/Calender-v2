import { useState } from 'react';
import type { AIProposal, AIProposalGoal, AIProposalAction, AIProposalHabit } from '../lib/types';
import { usePillars } from '../hooks/usePillars';
import { useGoals } from '../hooks/useGoals';
import type { Pillar, Goal } from '../lib/types';

interface GoalProposalCardProps {
  proposal: AIProposal;
  onApprove: (editedData?: Record<string, unknown>) => void | Promise<void>;
  onReject: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  goal: '🎯',
  action: '⚡',
  habit: '🔄',
};

const TYPE_LABELS: Record<string, string> = {
  goal: 'Goal',
  action: 'Action',
  habit: 'Habit',
};

export function GoalProposalCard({ proposal, onApprove, onReject }: GoalProposalCardProps) {
  const { data: pillars } = usePillars();
  const { data: goals } = useGoals('active');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown>>({ ...proposal.data });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isResolved = proposal.status !== 'pending';

  if (isResolved) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-xs"
        style={{
          background: proposal.status === 'approved' ? 'var(--success-softer)' : 'var(--bg)',
          border: `1px solid ${proposal.status === 'approved' ? 'var(--success-light)' : 'var(--border)'}`,
          opacity: proposal.status === 'rejected' ? 0.5 : 1,
        }}
      >
        <span>{TYPE_ICONS[proposal.type]}</span>
        <span
          style={{
            color: proposal.status === 'approved' ? 'var(--success)' : 'var(--text-muted)',
            textDecoration: proposal.status === 'rejected' ? 'line-through' : 'none',
          }}
        >
          {(proposal.data as { name: string }).name}
        </span>
        <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {proposal.status === 'approved' ? '✓ Created' : '✕ Rejected'}
        </span>
      </div>
    );
  }

  async function handleApprove() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await onApprove(editData);
      } else {
        await onApprove();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReject() {
    if (isSubmitting) return;
    onReject();
  }

  return (
    <div
      className="rounded-[var(--r-md)] overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--accent-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: 'var(--accent-softer)', borderBottom: '1px solid var(--accent-light)' }}
      >
        <span className="text-sm">{TYPE_ICONS[proposal.type]}</span>
        <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-text)' }}>
          {TYPE_LABELS[proposal.type]} Proposal
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        {isEditing ? (
          <EditForm
            type={proposal.type}
            data={editData}
            onChange={setEditData}
            pillars={pillars ?? []}
            goals={goals ?? []}
          />
        ) : (
          <ProposalPreview type={proposal.type} data={proposal.data} />
        )}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={handleApprove}
          disabled={isSubmitting}
          className="flex-1 py-1.5 text-[11px] font-semibold text-white rounded-[var(--r-sm)] cursor-pointer"
          style={{ background: 'var(--success)', opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? 'Creating...' : isEditing ? 'Save & Create' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-[11px] font-semibold rounded-[var(--r-sm)] cursor-pointer"
          style={{
            background: 'var(--bg)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-[11px] font-semibold rounded-[var(--r-sm)] cursor-pointer"
          style={{ color: 'var(--danger)', background: 'var(--danger-softer)' }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function ProposalPreview({ type, data }: { type: string; data: AIProposalGoal | AIProposalAction | AIProposalHabit }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
        {data.name}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {type === 'goal' && (
          <>
            {(data as AIProposalGoal).pillar_name && (
              <Badge label={(data as AIProposalGoal).pillar_name!} />
            )}
            {(data as AIProposalGoal).goal_type && (
              <Badge label={(data as AIProposalGoal).goal_type!} />
            )}
            {(data as AIProposalGoal).description && (
              <p className="text-[11px] w-full" style={{ color: 'var(--text-muted)' }}>
                {(data as AIProposalGoal).description}
              </p>
            )}
          </>
        )}
        {type === 'action' && (
          <>
            {(data as AIProposalAction).goal_name && (
              <Badge label={`→ ${(data as AIProposalAction).goal_name}`} />
            )}
            {(data as AIProposalAction).estimated_minutes && (
              <Badge label={`${(data as AIProposalAction).estimated_minutes}min`} />
            )}
          </>
        )}
        {type === 'habit' && (
          <>
            {(data as AIProposalHabit).pillar_name && (
              <Badge label={(data as AIProposalHabit).pillar_name!} />
            )}
            {(data as AIProposalHabit).frequency && (
              <Badge label={(data as AIProposalHabit).frequency!} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-[var(--r-sm)] capitalize"
      style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
    >
      {label}
    </span>
  );
}

interface EditFormProps {
  type: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  pillars: Pillar[];
  goals: Goal[];
}

function EditForm({ type, data, onChange, pillars, goals }: EditFormProps) {
  function updateField(key: string, value: unknown) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-2">
      {/* Name */}
      <input
        type="text"
        value={(data.name as string) ?? ''}
        onChange={(e) => updateField('name', e.target.value)}
        className="w-full px-2 py-1.5 text-xs rounded-[var(--r-sm)] outline-none"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
        placeholder="Name"
      />

      {/* Pillar picker (for goals and habits) */}
      {(type === 'goal' || type === 'habit') && (
        <select
          value={(data.pillar_name as string) ?? ''}
          onChange={(e) => updateField('pillar_name', e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded-[var(--r-sm)] outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <option value="">Select pillar...</option>
          {pillars.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      )}

      {/* Goal picker (for actions) */}
      {type === 'action' && (
        <select
          value={(data.goal_name as string) ?? ''}
          onChange={(e) => updateField('goal_name', e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded-[var(--r-sm)] outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <option value="">Select goal...</option>
          {goals.map((g) => (
            <option key={g.id} value={g.name}>{g.name}</option>
          ))}
        </select>
      )}

      {/* Description (goals only) */}
      {type === 'goal' && (
        <textarea
          value={(data.description as string) ?? ''}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded-[var(--r-sm)] outline-none resize-none"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          placeholder="Description"
          rows={2}
        />
      )}

      {/* Frequency (habits only) */}
      {type === 'habit' && (
        <select
          value={(data.frequency as string) ?? 'daily'}
          onChange={(e) => updateField('frequency', e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded-[var(--r-sm)] outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekends">Weekends</option>
          <option value="custom">Custom</option>
        </select>
      )}
    </div>
  );
}
