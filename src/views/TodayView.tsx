import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useTodayActions, useCompleteAction, useUncompleteAction } from '../hooks/useActions';
import { useGoals } from '../hooks/useGoals';
import { usePillars } from '../hooks/usePillars';
import { useTodayJournal } from '../hooks/useJournal';
import { useUIStore } from '../lib/store';
import { ActionCard } from '../components/ActionCard';
import { CreateActionModal } from '../components/CreateActionModal';
import { HabitStrip } from '../components/HabitStrip';
import { Spinner } from '../components/Spinner';
import type { Goal, Pillar, Action } from '../lib/types';

export default function TodayView() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: actions, isLoading: actionsLoading } = useTodayActions(today);
  const { data: goals } = useGoals();
  const { data: pillars } = usePillars();
  const { data: todayJournal } = useTodayJournal();
  const completeAction = useCompleteAction();
  const uncompleteAction = useUncompleteAction();
  const { openJournalPrompt } = useUIStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const goalMap = useMemo(() => {
    const map = new Map<string, Goal>();
    goals?.forEach((g: Goal) => map.set(g.id, g));
    return map;
  }, [goals]);

  const pillarMap = useMemo(() => {
    const map = new Map<string, Pillar>();
    pillars?.forEach((p: Pillar) => map.set(p.id, p));
    return map;
  }, [pillars]);

  // Sort: incomplete first (by time, then priority), completed at bottom
  const sortedActions = useMemo(() => {
    if (!actions) return [];
    const incomplete = actions
      .filter((a: Action) => a.status !== 'complete')
      .sort((a: Action, b: Action) => {
        // Time ascending, nulls last
        if (a.scheduled_time && b.scheduled_time) return a.scheduled_time.localeCompare(b.scheduled_time);
        if (a.scheduled_time) return -1;
        if (b.scheduled_time) return 1;
        // Priority descending
        return b.priority - a.priority;
      });
    const completed = actions.filter((a: Action) => a.status === 'complete');
    return [...incomplete, ...completed];
  }, [actions]);

  function handleToggle(action: Action) {
    if (action.status === 'complete') {
      uncompleteAction.mutate({ id: action.id });
    } else {
      completeAction.mutate(action.id);
    }
  }

  if (actionsLoading) {
    return <Spinner />;
  }

  const now = new Date();
  const isEvening = now.getHours() >= 20;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl" style={{ color: 'var(--text)' }}>
            Today
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      {/* Habit strip */}
      <HabitStrip />

      {/* Action list */}
      {sortedActions.length > 0 ? (
        <div className="space-y-2">
          {sortedActions.map((action: Action) => {
            const goal = goalMap.get(action.goal_id);
            const pillar = goal ? pillarMap.get(goal.pillar_id) : undefined;
            return (
              <ActionCard
                key={action.id}
                action={action}
                goal={goal}
                pillar={pillar}
                onToggleComplete={() => handleToggle(action)}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-[var(--r-xl)]"
          style={{ background: 'var(--bg-warm)', border: '1px dashed var(--border)' }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            No actions scheduled for today. Create one or move an action to today.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-semibold text-white rounded-[var(--r-lg)] cursor-pointer"
            style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
          >
            Schedule an action
          </button>
        </div>
      )}

      {/* Journal trigger (after 8 PM) */}
      {isEvening && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={openJournalPrompt}
            className="px-5 py-2.5 text-sm font-semibold rounded-[var(--r-lg)] cursor-pointer"
            style={{
              background: 'var(--accent-softer)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-light)',
            }}
          >
            {todayJournal ? 'Edit reflection' : 'Reflect on your day'}
          </button>
        </div>
      )}

      {/* QuickAddBar */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-[var(--r-lg)] cursor-pointer transition-all"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <span className="text-base leading-none" style={{ color: 'var(--accent)' }}>+</span>
          <span className="text-sm">Add an action for today...</span>
        </button>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateActionModal
          onClose={() => setShowCreateModal(false)}
          prefilledDate={today}
        />
      )}
    </div>
  );
}
