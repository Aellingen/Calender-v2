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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePillars, useReorderPillars, useUpdatePillar, useArchivePillar } from '../hooks/usePillars';
import { useGoals } from '../hooks/useGoals';
import { useHabits } from '../hooks/useHabits';
import { useActions } from '../hooks/useActions';
import { useUIStore } from '../lib/store';
import { PillarBadge } from './PillarBadge';
import { ProgressRing } from './ProgressRing';
import { GoalDetailModal } from './GoalDetailModal';
import type { Pillar, Goal, Habit, Action } from '../lib/types';

const ICON_MAP: Record<string, string> = {
  heart: '❤️',
  briefcase: '💼',
  book: '📚',
  users: '👥',
  wallet: '💰',
  palette: '🎨',
};

interface PillarCardData {
  pillar: Pillar;
  goals: Goal[];
  habits: Habit[];
  actionsByGoal: Map<string, Action[]>;
}

interface SortablePillarCardProps {
  data: PillarCardData;
  isEditMode: boolean;
  onGoalClick: (goalId: string) => void;
  onEditPillar: (pillar: Pillar, updates: { name?: string; color?: string }) => void;
  onArchivePillar: (pillarId: string) => void;
}

function SortablePillarCard({ data, isEditMode, onGoalClick, onEditPillar, onArchivePillar }: SortablePillarCardProps) {
  const { pillar, goals, habits, actionsByGoal } = data;
  const [expanded, setExpanded] = useState(true);
  const [editName, setEditName] = useState(pillar.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pillar.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalActions = goals.reduce((sum, g) => sum + (actionsByGoal.get(g.id)?.length ?? 0), 0);
  const completedActions = goals.reduce((sum, g) => {
    const acts = actionsByGoal.get(g.id) ?? [];
    return sum + acts.filter((a) => a.status === 'complete').length;
  }, 0);
  const completionPct = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="rounded-[var(--r-xl)] overflow-hidden mb-3"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Color bar */}
        <div className="h-2" style={{ background: pillar.color }} />

        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          onClick={() => !isEditMode && setExpanded(!expanded)}
        >
          {isEditMode && (
            <button
              type="button"
              className="cursor-grab p-1"
              style={{ color: 'var(--text-muted)' }}
              {...listeners}
              {...attributes}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="13" r="1.5" />
                <circle cx="11" cy="13" r="1.5" />
              </svg>
            </button>
          )}

          <span className="text-lg">{ICON_MAP[pillar.icon] ?? '●'}</span>

          {isEditMode ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => {
                if (editName.trim() && editName !== pillar.name) {
                  onEditPillar(pillar, { name: editName.trim() });
                }
              }}
              className="flex-1 font-display text-sm outline-none bg-transparent"
              style={{ color: 'var(--text)', borderBottom: `2px solid ${pillar.color}` }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 font-display text-sm" style={{ color: 'var(--text)' }}>
              {pillar.name}
            </span>
          )}

          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {goals.length} goal{goals.length !== 1 ? 's' : ''} · {habits.length} habit{habits.length !== 1 ? 's' : ''} · {completionPct}%
          </span>

          {isEditMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (goals.length > 0 || habits.length > 0) {
                  if (!window.confirm(`"${pillar.name}" has active goals/habits. Archive anyway?`)) return;
                }
                onArchivePillar(pillar.id);
              }}
              className="text-[10px] font-semibold px-2 py-1 rounded-[var(--r-sm)] cursor-pointer"
              style={{ color: 'var(--danger)', background: 'var(--danger-softer)' }}
            >
              Archive
            </button>
          )}

          {!isEditMode && (
            <span
              className="text-xs transition-transform"
              style={{
                color: 'var(--text-muted)',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              &#x25B6;
            </span>
          )}
        </div>

        {/* Expanded content */}
        {expanded && !isEditMode && (
          <div className="px-4 pb-4 space-y-2">
            {/* Goals */}
            {goals.map((goal) => {
              const goalActions = actionsByGoal.get(goal.id) ?? [];
              const done = goalActions.filter((a) => a.status === 'complete').length;
              const total = goalActions.length;
              const progress = total > 0 ? done / total : 0;

              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => onGoalClick(goal.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] cursor-pointer transition-all text-left"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <ProgressRing size={28} strokeWidth={3} progress={progress} color={pillar.color} />
                  <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                    {goal.name}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {done}/{total}
                  </span>
                </button>
              );
            })}

            {/* Habits */}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)]"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <span className="text-sm">{habit.icon || habit.name.charAt(0)}</span>
                <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                  {habit.name}
                </span>
                {habit.current_streak > 0 && (
                  <span
                    className="font-display text-[10px]"
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

            {/* Empty pillar */}
            {goals.length === 0 && habits.length === 0 && (
              <p className="text-xs py-2 text-center" style={{ color: 'var(--text-muted)' }}>
                No goals or habits yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function LifeMapOverlay() {
  const { isLifeMapOpen, closeLifeMap } = useUIStore();
  const { data: pillars } = usePillars();
  const { data: goals } = useGoals('active');
  const { data: habits } = useHabits();
  const { data: allActions } = useActions();
  const reorderPillars = useReorderPillars();
  const updatePillar = useUpdatePillar();
  const archivePillar = useArchivePillar();

  const [isEditMode, setIsEditMode] = useState(false);
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

  const pillarData: PillarCardData[] = useMemo(() => {
    if (!pillars) return [];
    return pillars.map((pillar: Pillar) => ({
      pillar,
      goals: (goals ?? []).filter((g: Goal) => g.pillar_id === pillar.id),
      habits: (habits ?? []).filter((h: Habit) => h.pillar_id === pillar.id),
      actionsByGoal,
    }));
  }, [pillars, goals, habits, actionsByGoal]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !pillars) return;

    const oldIndex = pillars.findIndex((p: Pillar) => p.id === active.id);
    const newIndex = pillars.findIndex((p: Pillar) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(pillars, oldIndex, newIndex);
    reorderPillars.mutate(reordered.map((p: Pillar) => p.id));
  }

  function handleEditPillar(pillar: Pillar, updates: { name?: string; color?: string }) {
    updatePillar.mutate({ id: pillar.id, data: updates });
  }

  function handleArchivePillar(pillarId: string) {
    archivePillar.mutate(pillarId);
  }

  const selectedGoal = selectedGoalId ? goals?.find((g: Goal) => g.id === selectedGoalId) ?? null : null;
  const selectedPillar = selectedGoal ? pillarMap.get(selectedGoal.pillar_id) ?? null : null;

  if (!isLifeMapOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(28,25,23,0.3)' }}
        onClick={closeLifeMap}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full flex flex-col"
        style={{
          width: 'min(70%, 720px)',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 300ms var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-display text-lg" style={{ color: 'var(--text)' }}>
            Life Map
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] cursor-pointer"
              style={{
                background: isEditMode ? 'var(--accent-softer)' : 'var(--bg)',
                color: isEditMode ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${isEditMode ? 'var(--accent-light)' : 'var(--border)'}`,
              }}
            >
              {isEditMode ? 'Done' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={closeLifeMap}
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm cursor-pointer"
              style={{ color: 'var(--text-muted)', background: 'var(--surface)' }}
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pillarData.map((d) => d.pillar.id)}
              strategy={verticalListSortingStrategy}
            >
              {pillarData.map((data) => (
                <SortablePillarCard
                  key={data.pillar.id}
                  data={data}
                  isEditMode={isEditMode}
                  onGoalClick={(id) => setSelectedGoalId(id)}
                  onEditPillar={handleEditPillar}
                  onArchivePillar={handleArchivePillar}
                />
              ))}
            </SortableContext>
          </DndContext>

          {pillarData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No pillars yet. Complete onboarding to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Goal detail modal */}
      {selectedGoal && selectedPillar && (
        <GoalDetailModal
          goal={selectedGoal}
          pillar={selectedPillar}
          actions={actionsByGoal.get(selectedGoal.id) ?? []}
          habitCount={(habits ?? []).filter((h: Habit) => h.goal_id === selectedGoal.id).length}
          onClose={() => setSelectedGoalId(null)}
        />
      )}
    </>
  );
}
