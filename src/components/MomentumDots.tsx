interface MomentumDotsProps {
  active: number;
  total: number;
  color?: string;
}

export function MomentumDots({ active, total, color = 'var(--accent)' }: MomentumDotsProps) {
  const dots = Array.from({ length: Math.min(total, 10) }, (_, i) => i < active);

  return (
    <div className="flex items-center gap-1">
      {dots.map((filled, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full transition-colors"
          style={{
            background: filled ? color : 'var(--slider-bg)',
            transition: 'background 0.2s var(--ease-out)',
          }}
        />
      ))}
      {total > 10 && (
        <span className="text-[10px] ml-0.5" style={{ color: 'var(--text-muted)' }}>
          +{total - 10}
        </span>
      )}
    </div>
  );
}
