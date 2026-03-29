import { useAINudge } from '../hooks/useAINudge';

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  motivation: { bg: 'var(--accent-softer)', border: 'var(--accent-light)', icon: '✨' },
  reminder: { bg: 'var(--warm-softer)', border: 'var(--warm-light)', icon: '⏰' },
  celebration: { bg: 'var(--success-softer)', border: 'var(--success-light)', icon: '🎉' },
};

export function NudgeCard() {
  const { data: nudge, isLoading, isError } = useAINudge();

  if (isLoading || isError || !nudge) return null;

  const style = TYPE_STYLES[nudge.type] ?? TYPE_STYLES.motivation;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-[var(--r-lg)] mb-4 animate-slide-up"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <span className="text-base shrink-0 mt-0.5">{style.icon}</span>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {nudge.nudge}
      </p>
    </div>
  );
}
