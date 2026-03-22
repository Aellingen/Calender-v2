interface PillarBadgeProps {
  name: string;
  color: string;
}

export function PillarBadge({ name, color }: PillarBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-[var(--r-full)]"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      {name}
    </span>
  );
}
