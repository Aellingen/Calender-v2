import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { quickParseText } from '../lib/api';
import { useCreateAction } from '../hooks/useActions';
import { useCreateHabit } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { usePillars } from '../hooks/usePillars';
import { toast } from './Toast';
import type { Goal, Pillar } from '../lib/types';
import type { QuickParseResult } from '../lib/api';

interface QuickAddBarProps {
  onOpenFullModal: () => void;
}

export function QuickAddBar({ onOpenFullModal }: QuickAddBarProps) {
  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<QuickParseResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: goals } = useGoals('active');
  const { data: pillars } = usePillars();
  const createAction = useCreateAction();
  const createHabit = useCreateHabit();

  const goalMap = new Map<string, Goal>();
  goals?.forEach((g: Goal) => goalMap.set(g.name.toLowerCase(), g));

  const pillarMap = new Map<string, Pillar>();
  pillars?.forEach((p: Pillar) => pillarMap.set(p.name.toLowerCase(), p));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    // If we already have a parse result, create the entity
    if (parseResult) {
      await createEntity(parseResult);
      return;
    }

    // Parse the natural language input
    setIsParsing(true);
    try {
      const result = await quickParseText(input.trim());
      setParseResult(result);
    } catch {
      // Fallback: just open the full modal
      toast('Could not parse — opening full form', 'info');
      onOpenFullModal();
    } finally {
      setIsParsing(false);
    }
  }

  async function createEntity(result: QuickParseResult) {
    try {
      if (result.type === 'habit') {
        const pillarId = result.pillar_id
          ?? (result.pillar_name ? pillarMap.get(result.pillar_name.toLowerCase())?.id : undefined);

        if (!pillarId) {
          toast('Please select a pillar for this habit', 'error');
          onOpenFullModal();
          return;
        }

        await createHabit.mutateAsync({
          name: result.name,
          pillar_id: pillarId,
          goal_id: result.goal_id ?? null,
          icon: result.icon ?? null,
          frequency: (result.frequency as 'daily' | 'weekdays' | 'weekends' | 'custom') ?? 'daily',
        });
        toast('Habit created', 'success');
      } else {
        // Action
        const goalId = result.goal_id
          ?? (result.goal_name ? goalMap.get(result.goal_name.toLowerCase())?.id : undefined);

        if (!goalId) {
          toast('Please select a goal for this action', 'error');
          onOpenFullModal();
          return;
        }

        await createAction.mutateAsync({
          name: result.name,
          goal_id: goalId,
          scheduled_date: result.scheduled_date ?? format(new Date(), 'yyyy-MM-dd'),
          scheduled_time: result.scheduled_time ?? null,
          estimated_minutes: result.estimated_minutes ?? null,
          priority: result.priority ?? 2,
        });
        toast('Action created', 'success');
      }

      setInput('');
      setParseResult(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to create', 'error');
    }
  }

  function handleClear() {
    setParseResult(null);
    setInput('');
    inputRef.current?.focus();
  }

  return (
    <div className="mt-6">
      {/* Parse result preview */}
      {parseResult && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 mb-2 rounded-[var(--r-lg)] animate-slide-up"
          style={{
            background: 'var(--accent-softer)',
            border: '1px solid var(--accent-light)',
          }}
        >
          <span className="text-xs">
            {parseResult.type === 'habit' ? '🔄' : '⚡'}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-text)' }}>
              {parseResult.type === 'habit' ? 'Habit' : 'Action'}:
            </span>{' '}
            <span className="text-xs" style={{ color: 'var(--text)' }}>
              {parseResult.name}
            </span>
            {parseResult.goal_name && (
              <span className="text-[10px] ml-1.5" style={{ color: 'var(--text-muted)' }}>
                → {parseResult.goal_name}
              </span>
            )}
            {parseResult.scheduled_date && (
              <span className="text-[10px] ml-1.5" style={{ color: 'var(--text-muted)' }}>
                📅 {parseResult.scheduled_date}
              </span>
            )}
            {parseResult.scheduled_time && (
              <span className="text-[10px] ml-1.5" style={{ color: 'var(--text-muted)' }}>
                🕐 {parseResult.scheduled_time}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => createEntity(parseResult)}
            disabled={createAction.isPending || createHabit.isPending}
            className="px-2.5 py-1 text-[11px] font-semibold text-white rounded-[var(--r-sm)] cursor-pointer"
            style={{ background: 'var(--success)' }}
          >
            Create
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-[var(--r-lg)] transition-all"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <span className="text-base leading-none" style={{ color: 'var(--accent)' }}>+</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (parseResult) setParseResult(null);
            }}
            placeholder="Type naturally: 'Review sales deck tomorrow at 2pm for 30 min'"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text)' }}
          />
          {input.trim() && (
            <button
              type="submit"
              disabled={isParsing}
              className="px-3 py-1 text-xs font-semibold rounded-[var(--r-sm)] cursor-pointer"
              style={{
                background: 'var(--accent)',
                color: 'white',
                opacity: isParsing ? 0.6 : 1,
              }}
            >
              {isParsing ? '...' : parseResult ? 'Create' : 'Parse'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
