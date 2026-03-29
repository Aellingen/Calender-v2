import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useReviews, useSubmitReview } from '../hooks/useReviews';
import { usePillars } from '../hooks/usePillars';
import { useGoals } from '../hooks/useGoals';
import { useActions } from '../hooks/useActions';
import { useHabits } from '../hooks/useHabits';
import { generateReviewSummary } from '../lib/api';
import { toast } from './Toast';
import type { Pillar, Goal, Action, Habit, Review } from '../lib/types';
import type { ReviewSummaryResult } from '../lib/api';

interface ReviewPanelProps {
  onClose: () => void;
}

export function ReviewPanel({ onClose }: ReviewPanelProps) {
  const { data: reviews } = useReviews('weekly');
  const { data: pillars } = usePillars();
  const { data: goals } = useGoals('active');
  const { data: allActions } = useActions();
  const { data: habits } = useHabits();
  const submitReview = useSubmitReview();

  const [note, setNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [aiSummary, setAiSummary] = useState<ReviewSummaryResult | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Compute per-pillar stats for this week
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  const pillarBreakdown = useMemo(() => {
    if (!pillars || !goals || !allActions || !habits) return [];

    return pillars.map((pillar: Pillar) => {
      const pillarGoals = goals.filter((g: Goal) => g.pillar_id === pillar.id);
      const pillarActions = allActions.filter((a: Action) => {
        const goal = pillarGoals.find((g: Goal) => g.id === a.goal_id);
        return !!goal;
      });
      const completed = pillarActions.filter((a: Action) => a.status === 'complete').length;
      const total = pillarActions.length;
      const pillarHabits = habits.filter((h: Habit) => h.pillar_id === pillar.id);

      return {
        pillar,
        goalCount: pillarGoals.length,
        actionTotal: total,
        actionCompleted: completed,
        completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
        habitCount: pillarHabits.length,
        avgStreak: pillarHabits.length > 0
          ? Math.round(pillarHabits.reduce((sum: number, h: Habit) => sum + h.current_streak, 0) / pillarHabits.length)
          : 0,
      };
    });
  }, [pillars, goals, allActions, habits]);

  async function handleSubmitReview() {
    const breakdown: Record<string, unknown> = {};
    pillarBreakdown.forEach((pb) => {
      breakdown[pb.pillar.id] = {
        name: pb.pillar.name,
        goals: pb.goalCount,
        actionsCompleted: pb.actionCompleted,
        actionsTotal: pb.actionTotal,
        completionPct: pb.completionPct,
        habits: pb.habitCount,
        avgStreak: pb.avgStreak,
      };
    });

    try {
      const review = await submitReview.mutateAsync({
        review_type: 'weekly',
        period_start: weekStartStr,
        period_end: weekEndStr,
        note: note.trim() || null,
        pillar_breakdown: breakdown,
      });

      // Generate AI summary after sealing
      setIsGeneratingSummary(true);
      try {
        const summary = await generateReviewSummary({
          review_id: review.id,
          period_start: weekStartStr,
          period_end: weekEndStr,
          pillar_breakdown: breakdown,
          note: note.trim() || undefined,
        });
        setAiSummary(summary);
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Could not generate AI summary', 'error');
      } finally {
        setIsGeneratingSummary(false);
      }

      setNote('');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to save review', 'error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ top: '3.5rem', background: 'rgba(28,25,23,0.15)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl rounded-[var(--r-2xl)] animate-modal-in overflow-hidden"
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
          <div>
            <h2 className="font-display text-lg" style={{ color: 'var(--text)' }}>
              Weekly Review
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setShowHistory(!showHistory); setAiSummary(null); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] cursor-pointer"
              style={{
                background: showHistory ? 'var(--accent-softer)' : 'var(--bg)',
                color: showHistory ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${showHistory ? 'var(--accent-light)' : 'var(--border)'}`,
              }}
            >
              {showHistory ? 'Current' : 'History'}
            </button>
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
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {showHistory ? (
            // Review history
            <div className="space-y-3">
              {reviews && reviews.length > 0 ? (
                reviews.map((review: Review) => (
                  <div
                    key={review.id}
                    className="px-4 py-3 rounded-[var(--r-lg)]"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {format(new Date(review.period_start), 'MMM d')} – {format(new Date(review.period_end), 'MMM d')}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {review.note && (
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {review.note}
                      </p>
                    )}
                    {review.ai_summary && (
                      <div
                        className="mt-2 px-3 py-2 rounded-[var(--r-md)] text-xs"
                        style={{ background: 'var(--accent-softer)', border: '1px solid var(--accent-light)' }}
                      >
                        <span className="font-semibold" style={{ color: 'var(--accent-text)' }}>
                          ✨ AI Summary
                        </span>
                        <p className="mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                          {review.ai_summary}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No reviews yet.
                </p>
              )}
            </div>
          ) : aiSummary ? (
            // AI Summary view (shown after sealing)
            <div className="space-y-4 animate-slide-up">
              <div
                className="px-4 py-4 rounded-[var(--r-lg)]"
                style={{ background: 'var(--accent-softer)', border: '1px solid var(--accent-light)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">✨</span>
                  <span className="font-display text-sm" style={{ color: 'var(--accent-text)' }}>
                    AI Review Summary
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {aiSummary.summary}
                </p>
              </div>

              {aiSummary.highlights.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--success)' }}>
                    Highlights
                  </h3>
                  <ul className="space-y-1">
                    {aiSummary.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--success)' }}>✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSummary.suggestions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                    Suggestions
                  </h3>
                  <ul className="space-y-1">
                    {aiSummary.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent)' }}>→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-sm font-semibold rounded-[var(--r-md)] cursor-pointer"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  boxShadow: 'var(--shadow-accent)',
                }}
              >
                Done
              </button>
            </div>
          ) : (
            // Current week breakdown
            <div className="space-y-4">
              {/* Per-pillar stats */}
              <div className="space-y-2">
                {pillarBreakdown.map((pb) => (
                  <div
                    key={pb.pillar.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)]"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${pb.pillar.color}`,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {pb.pillar.name}
                      </span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {pb.goalCount} goal{pb.goalCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {pb.actionCompleted}/{pb.actionTotal} actions
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {pb.habitCount} habit{pb.habitCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-display text-lg"
                        style={{
                          color: pb.completionPct >= 80 ? 'var(--success)' : pb.completionPct >= 50 ? 'var(--warm)' : 'var(--text-muted)',
                        }}
                      >
                        {pb.completionPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Reflection note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What went well this week? What could be better?"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none resize-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitReview.isPending || isGeneratingSummary}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
                style={{
                  background: 'var(--accent)',
                  boxShadow: 'var(--shadow-accent)',
                  opacity: (submitReview.isPending || isGeneratingSummary) ? 0.6 : 1,
                }}
              >
                {isGeneratingSummary ? '✨ Generating AI summary...' : submitReview.isPending ? 'Saving...' : 'Save & Get AI Summary'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
