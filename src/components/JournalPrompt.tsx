import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTodayJournal, useUpsertJournal } from '../hooks/useJournal';
import { usePillars } from '../hooks/usePillars';
import { useUIStore } from '../lib/store';
import type { Pillar } from '../lib/types';

const MOODS = [
  { value: 1 as const, label: '😫' },
  { value: 2 as const, label: '😕' },
  { value: 3 as const, label: '😐' },
  { value: 4 as const, label: '🙂' },
  { value: 5 as const, label: '😊' },
];

export function JournalPrompt() {
  const { isJournalPromptOpen, closeJournalPrompt } = useUIStore();
  const { data: existing } = useTodayJournal();
  const { data: pillars } = usePillars();
  const upsertJournal = useUpsertJournal();

  const [content, setContent] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);

  // Load existing entry
  useEffect(() => {
    if (existing) {
      setContent(existing.content ?? '');
      setMood(existing.mood);
      setSelectedPillars(existing.pillar_ids ?? []);
    }
  }, [existing]);

  if (!isJournalPromptOpen) return null;

  function togglePillar(id: string) {
    setSelectedPillars((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, id];
    });
  }

  async function handleSubmit() {
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      await upsertJournal.mutateAsync({
        entry_date: today,
        content: content.trim() || null,
        mood,
        pillar_ids: selectedPillars,
      });
      closeJournalPrompt();
    } catch {
      // Error toast handled by hook onError
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ top: '3.5rem', background: 'rgba(28,25,23,0.15)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeJournalPrompt(); }}
    >
      <div
        className="w-full max-w-md rounded-[var(--r-2xl)] animate-modal-in overflow-hidden"
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
            {existing ? 'Edit Reflection' : 'Daily Reflection'}
          </h2>
          <button
            type="button"
            onClick={closeJournalPrompt}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
          >
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Anything worth remembering about today?"
            rows={4}
            autoFocus
            className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none resize-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />

          {/* Mood selector */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              How was today?
            </label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? null : m.value)}
                  className="flex-1 py-2 text-xl rounded-[var(--r-md)] cursor-pointer transition-all"
                  style={{
                    background: mood === m.value ? 'var(--accent-softer)' : 'var(--bg)',
                    border: mood === m.value ? '2px solid var(--accent-light)' : '1px solid var(--border)',
                    transform: mood === m.value ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pillar tags */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Related pillars (up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {pillars?.map((p: Pillar) => {
                const isSelected = selectedPillars.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePillar(p.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] cursor-pointer transition-all"
                    style={{
                      background: isSelected ? `${p.color}20` : 'var(--bg)',
                      color: isSelected ? p.color : 'var(--text-secondary)',
                      border: isSelected ? `2px solid ${p.color}` : '1px solid var(--border)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </button>
                );
              })}
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
            onClick={closeJournalPrompt}
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
            type="button"
            onClick={handleSubmit}
            disabled={upsertJournal.isPending}
            className="px-5 py-2 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
            style={{
              background: 'var(--accent)',
              boxShadow: 'var(--shadow-accent)',
              opacity: upsertJournal.isPending ? 0.6 : 1,
            }}
          >
            {upsertJournal.isPending ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  );
}
