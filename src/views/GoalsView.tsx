import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGoals, useReorderGoals } from '../hooks/useGoals';
import { usePillars } from '../hooks/usePillars';
import { useActions } from '../hooks/useActions';
import { useHabits } from '../hooks/useHabits';
import { GoalCard } from '../components/GoalCard';
import { CreateGoalModal } from '../components/CreateGoalModal';
import { GoalDetailModal } from '../components/GoalDetailModal';
import { Spinner } from '../components/Spinner';
import type { Goal, Pillar, Action, Habit } from '../lib/types';

type StatusFilter = 'active' | 'paused' | 'archived' | 'complete' | 'all';

interface SortableGoalCardProps {
  goal: Goal;
  pillar: Pillar;
  actions: Action[];
  habitCount: number;
  onClick: () => void;
}

function SortableGoalCard({ goal, pillar, actions, habitCount, onClick }: SortableGoalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GoalCard
        goal={goal}
        pillar={pillar}
        actions={actions}
        habitCount={habitCount}
        onClick={onClick}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
      />
    </div>
  );
}

export default function GoalsView() {
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: pillars, isLoading: pillarsLoading } = usePillars();
  const { data: allActions } = useActions();
  const { data: allHabits } = useHabits();
  const reorderGoals = useReorderGoals();

  const [pillarFilter, setPillarFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const pillarMap = useMemo(() => {
    const map = new Map<string, Pillar>();
    pillars?.forEach((p: Pillar) => map.set(p.id, p));
    return map;
  }, [pillars]);

  const actionsByGoal = useMemo(() => {
    const map = new Map<string, Action[]>();
    allActions?.forEach((a: Action) => {
      const list = map.get(a.goal_id) ?? [];
      list.push(a);
      map.set(a.goal_id, list);
    });
    return map;
  }, [allActions]);

  const habitCountByGoal = useMemo(() => {
    const map = new Map<string, number>();
    allHabits?.forEach((h: Habit) => {
      if (h.goal_id) {
        map.set(h.goal_id, (map.get(h.goal_id) ?? 0) + 1);
      }
    });
    return map;
  }, [allHabits]);

  const filteredGoals = useMemo(() => {
    if (!goals) return [];
    return goals.filter((g: Goal) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (pillarFilter && g.pillar_id !== pillarFilter) return false;
      return true;
    });
  }, [goals, statusFilter, pillarFilter]);

  const selectedGoal = selectedGoalId
    ? goals?.find((g: Goal) => g.id === selectedGoalId) ?? null
    : null;
  const selectedPillar = selectedGoal
    ? pillarMap.get(selectedGoal.pillar_id) ?? null
    : null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !filteredGoals.length) return;

    const oldIndex = filteredGoals.findIndex((g: Goal) => g.id === active.id);
    const newIndex = filteredGoals.findIndex((g: Goal) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredGoals, oldIndex, newIndex);
    reorderGoals.mutate(reordered.map((g: Goal) => g.id));
  }

  if (goalsLoading || pillarsLoading) {
    return <Spinner />;
  }

  return (
    <div className="animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl" style={{ color: 'var(--text)' }}>
          Goals
        </h1>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-[var(--r-lg)] cursor-pointer"
          style={{
            background: 'var(--accent)',
            boxShadow: 'var(--shadow-accent)',
          }}
        >
          <span className="text-base leading-none">+</span>
          New Goal
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Pillar filters */}
        <button
          type="button"
          onClick={() => setPillarFilter(null)}
          className="px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] transition-all cursor-pointer"
          style={{
            background: !pillarFilter ? 'var(--accent-softer)' : 'var(--bg)',
            color: !pillarFilter ? 'var(--accent)' : 'var(--text-secondary)',
            border: !pillarFilter ? '1px solid var(--accent-light)' : '1px solid var(--border)',
          }}
        >
          All Pillars
        </button>
        {pillars?.map((p: Pillar) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPillarFilter(pillarFilter === p.id ? null : p.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] transition-all cursor-pointer"
            style={{
              background: pillarFilter === p.id ? `${p.color}20` : 'var(--bg)',
              color: pillarFilter === p.id ? p.color : 'var(--text-secondary)',
              border: pillarFilter === p.id ? `2px solid ${p.color}` : '1px solid var(--border)',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </button>
        ))}

        {/* Divider */}
        <span className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        {/* Status filters */}
        {(['all', 'active', 'paused', 'complete', 'archived'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-[var(--r-full)] capitalize transition-all cursor-pointer"
            style={{
              background: statusFilter === s ? 'var(--surface)' : 'transparent',
              color: statusFilter === s ? 'var(--text)' : 'var(--text-muted)',
              border: statusFilter === s ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Goals grid */}
      {filteredGoals.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredGoals.map((g: Goal) => g.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredGoals.map((goal: Goal) => {
                const pillar = pillarMap.get(goal.pillar_id);
                if (!pillar) return null;
                return (
                  <SortableGoalCard
                    key={goal.id}
                    goal={goal}
                    pillar={pillar}
                    actions={actionsByGoal.get(goal.id) ?? []}
                    habitCount={habitCountByGoal.get(goal.id) ?? 0}
                    onClick={() => setSelectedGoalId(goal.id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-[var(--r-xl)]"
          style={{ background: 'var(--bg-warm)', border: '1px dashed var(--border)' }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            {goals?.length
              ? 'No goals match your filters.'
              : "You haven't created any goals yet."}
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-semibold text-white rounded-[var(--r-lg)] cursor-pointer"
            style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
          >
            Create your first goal
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          preselectedPillarId={pillarFilter ?? undefined}
        />
      )}
      {selectedGoal && selectedPillar && (
        <GoalDetailModal
          goal={selectedGoal}
          pillar={selectedPillar}
          actions={actionsByGoal.get(selectedGoal.id) ?? []}
          habitCount={habitCountByGoal.get(selectedGoal.id) ?? 0}
          onClose={() => setSelectedGoalId(null)}
        />
      )}
    </div>
  );
}
