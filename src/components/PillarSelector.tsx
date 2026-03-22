import type { DefaultPillar } from '../lib/constants';

interface PillarSelectorProps {
  pillars: DefaultPillar[];
  selectedIndices: Set<number>;
  onToggle: (index: number) => void;
  min: number;
  max: number;
}

const ICON_MAP: Record<string, string> = {
  heart: '\u2764\uFE0F',
  briefcase: '\uD83D\uDCBC',
  book: '\uD83D\uDCDA',
  users: '\uD83D\uDC65',
  wallet: '\uD83D\uDCB0',
  palette: '\uD83C\uDFA8',
};

export function PillarSelector({
  pillars,
  selectedIndices,
  onToggle,
  min,
  max,
}: PillarSelectorProps) {
  const count = selectedIndices.size;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pillars.map((pillar, index) => {
          const isSelected = selectedIndices.has(index);
          const isDisabled = !isSelected && count >= max;

          return (
            <button
              key={pillar.name}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggle(index)}
              className="relative flex flex-col items-center gap-2 p-5 rounded-[var(--r-xl)] transition-all cursor-pointer"
              style={{
                background: isSelected ? `${pillar.color}10` : 'var(--card)',
                border: isSelected
                  ? `2.5px solid ${pillar.color}`
                  : '1px solid var(--border)',
                boxShadow: isSelected ? `0 4px 16px ${pillar.color}20` : 'var(--shadow-sm)',
                opacity: isDisabled ? 0.45 : 1,
                transform: isSelected ? 'translateY(-2px)' : 'none',
                transition: 'all 0.25s var(--ease-out)',
              }}
            >
              {isSelected && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: pillar.color }}
                >
                  &#x2713;
                </span>
              )}
              <span className="text-2xl">{ICON_MAP[pillar.icon] ?? pillar.icon}</span>
              <span
                className="font-semibold text-sm"
                style={{ color: isSelected ? pillar.color : 'var(--text)' }}
              >
                {pillar.name}
              </span>
              <span
                className="w-6 h-1 rounded-full"
                style={{ background: pillar.color, opacity: isSelected ? 1 : 0.4 }}
              />
            </button>
          );
        })}
      </div>
      <p
        className="text-center text-xs"
        style={{ color: count < min ? 'var(--danger)' : 'var(--text-muted)' }}
      >
        {count} of {min}&ndash;{max} selected
      </p>
    </div>
  );
}
