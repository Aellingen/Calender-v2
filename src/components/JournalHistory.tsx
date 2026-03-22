import { format } from 'date-fns';
import { useJournalHistory } from '../hooks/useJournal';
import { usePillars } from '../hooks/usePillars';
import type { JournalEntry, Pillar } from '../lib/types';
import { useMemo } from 'react';

const MOOD_ICONS: Record<number, string> = {
  1: '😫',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export function JournalHistory() {
  const { data: entries, isLoading } = useJournalHistory(30);
  const { data: pillars } = usePillars();

  const pillarMap = useMemo(() => {
    const map = new Map<string, Pillar>();
    pillars?.forEach((p: Pillar) => map.set(p.id, p));
    return map;
  }, [pillars]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-[var(--r-lg)] animate-shimmer"
          />
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 rounded-[var(--r-xl)]"
        style={{ background: 'var(--bg-warm)', border: '1px dashed var(--border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No journal entries yet. Start reflecting!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry: JournalEntry) => (
        <div
          key={entry.id}
          className="px-4 py-3 rounded-[var(--r-lg)]"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {format(new Date(entry.entry_date + 'T00:00:00'), 'EEE, MMM d')}
            </span>
            {entry.mood && (
              <span className="text-sm">{MOOD_ICONS[entry.mood]}</span>
            )}
            <div className="flex-1" />
            {entry.pillar_ids?.map((pid: string) => {
              const pillar = pillarMap.get(pid);
              if (!pillar) return null;
              return (
                <span
                  key={pid}
                  className="w-2 h-2 rounded-full"
                  style={{ background: pillar.color }}
                  title={pillar.name}
                />
              );
            })}
          </div>

          {/* Content */}
          {entry.content && (
            <p
              className="text-sm line-clamp-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              {entry.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
