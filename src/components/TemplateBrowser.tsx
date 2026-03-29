import { useState, useMemo } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../data/templates';
import type { Template, TemplateGoal } from '../data/templates';
import { usePillars } from '../hooks/usePillars';
import { useCreateGoal } from '../hooks/useGoals';
import { useCreateAction } from '../hooks/useActions';
import { useCreateHabit } from '../hooks/useHabits';
import { useUIStore } from '../lib/store';
import { toast } from './Toast';
import type { Pillar } from '../lib/types';

interface TemplateBrowserProps {
  onClose: () => void;
}

export function TemplateBrowser({ onClose }: TemplateBrowserProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (category && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.pillar_name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, category]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(28,25,23,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-[var(--r-2xl)] animate-modal-in overflow-hidden flex flex-col"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="font-display text-lg" style={{ color: 'var(--text)' }}>
              {selectedTemplate ? selectedTemplate.name : 'Template Library'}
            </h2>
            {selectedTemplate && (
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="text-xs mt-0.5 cursor-pointer"
                style={{ color: 'var(--accent)' }}
              >
                ← Back to templates
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
          >
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {selectedTemplate ? (
            <TemplatePreview template={selectedTemplate} onClose={onClose} />
          ) : (
            <>
              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-3 py-2.5 text-sm rounded-[var(--r-md)] outline-none mb-4"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                autoFocus
              />

              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] cursor-pointer"
                  style={{
                    background: !category ? 'var(--accent-softer)' : 'var(--bg)',
                    color: !category ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${!category ? 'var(--accent-light)' : 'var(--border)'}`,
                  }}
                >
                  All
                </button>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id === category ? null : c.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] cursor-pointer"
                    style={{
                      background: c.id === category ? 'var(--accent-softer)' : 'var(--bg)',
                      color: c.id === category ? 'var(--accent)' : 'var(--text-secondary)',
                      border: `1px solid ${c.id === category ? 'var(--accent-light)' : 'var(--border)'}`,
                    }}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>

              {/* Template grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onClick={() => setSelectedTemplate(t)}
                  />
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No templates match your search.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
  const totalActions = template.goals.reduce((sum, g) => sum + g.actions.length, 0);
  const totalHabits = template.goals.reduce((sum, g) => sum + g.habits.length, 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left px-4 py-3 rounded-[var(--r-lg)] cursor-pointer transition-all"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-light)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {template.name}
          </h3>
          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {template.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-[var(--r-sm)] capitalize"
              style={{ background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {template.pillar_name}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {template.goals.length} goal{template.goals.length !== 1 ? 's' : ''} · {totalActions} action{totalActions !== 1 ? 's' : ''} · {totalHabits} habit{totalHabits !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function TemplatePreview({ template, onClose }: { template: Template; onClose: () => void }) {
  const { data: pillars } = usePillars();
  const createGoal = useCreateGoal();
  const createAction = useCreateAction();
  const createHabit = useCreateHabit();
  const { openAIChatWithContext } = useUIStore();
  const [isCreating, setIsCreating] = useState(false);

  const pillarByName = useMemo(() => {
    const map = new Map<string, Pillar>();
    pillars?.forEach((p: Pillar) => map.set(p.name.toLowerCase(), p));
    return map;
  }, [pillars]);

  async function handleUseAsIs() {
    setIsCreating(true);
    try {
      for (const templateGoal of template.goals) {
        const pillar = pillarByName.get(templateGoal.pillar_name.toLowerCase());
        if (!pillar) {
          toast(`Pillar "${templateGoal.pillar_name}" not found — skipping "${templateGoal.name}"`, 'error');
          continue;
        }

        const goal = await createGoal.mutateAsync({
          name: templateGoal.name,
          pillar_id: pillar.id,
          description: templateGoal.description,
          goal_type: templateGoal.goal_type,
        });

        // Create actions
        for (const action of templateGoal.actions) {
          await createAction.mutateAsync({
            name: action.name,
            goal_id: goal.id,
            estimated_minutes: action.estimated_minutes ?? null,
            priority: action.priority ?? 2,
          });
        }

        // Create habits
        for (const habit of templateGoal.habits) {
          await createHabit.mutateAsync({
            name: habit.name,
            pillar_id: pillar.id,
            goal_id: goal.id,
            icon: habit.icon,
            frequency: habit.frequency,
            custom_days: habit.custom_days ?? null,
          });
        }
      }

      toast('Template applied successfully!', 'success');
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to apply template', 'error');
    } finally {
      setIsCreating(false);
    }
  }

  function handleUseWithAI() {
    const goalNames = template.goals.map((g) => g.name).join(', ');
    openAIChatWithContext({
      type: 'template',
      initialMessage: `I want to use the "${template.name}" template. It includes these goals: ${goalNames}. Help me customize it for my situation.`,
    });
    onClose();
  }

  return (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {template.description}
      </p>

      {/* Goals breakdown */}
      {template.goals.map((goal, gi) => (
        <GoalPreview key={gi} goal={goal} />
      ))}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleUseWithAI}
          className="flex-1 py-2.5 text-sm font-semibold rounded-[var(--r-md)] cursor-pointer"
          style={{
            background: 'var(--accent-softer)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-light)',
          }}
        >
          ✨ Use with AI
        </button>
        <button
          type="button"
          onClick={handleUseAsIs}
          disabled={isCreating}
          className="flex-1 py-2.5 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
          style={{
            background: 'var(--accent)',
            boxShadow: 'var(--shadow-accent)',
            opacity: isCreating ? 0.6 : 1,
          }}
        >
          {isCreating ? 'Creating...' : 'Use as-is'}
        </button>
      </div>
    </div>
  );
}

function GoalPreview({ goal }: { goal: TemplateGoal }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="rounded-[var(--r-lg)] overflow-hidden"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 cursor-pointer text-left"
      >
        <span className="text-sm">🎯</span>
        <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {goal.name}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-[var(--r-sm)] capitalize"
          style={{ background: 'var(--card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          {goal.goal_type}
        </span>
        <span
          className="text-xs transition-transform"
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          &#x25B6;
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {goal.description}
          </p>

          {/* Actions */}
          {goal.actions.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Actions ({goal.actions.length})
              </p>
              <div className="space-y-1">
                {goal.actions.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--r-sm)] text-xs"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>⚡</span>
                    <span style={{ color: 'var(--text)' }}>{a.name}</span>
                    {a.estimated_minutes && (
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {a.estimated_minutes}min
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habits */}
          {goal.habits.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Habits ({goal.habits.length})
              </p>
              <div className="space-y-1">
                {goal.habits.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--r-sm)] text-xs"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <span>{h.icon}</span>
                    <span style={{ color: 'var(--text)' }}>{h.name}</span>
                    <span className="ml-auto text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>
                      {h.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
