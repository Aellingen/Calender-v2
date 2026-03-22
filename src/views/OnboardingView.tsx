import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { useCreatePillars } from '../hooks/usePillars';
import { PillarSelector } from '../components/PillarSelector';
import { Spinner } from '../components/Spinner';
import { DEFAULT_PILLARS, MIN_PILLARS, MAX_PILLARS } from '../lib/constants';
import type { CreatePillarInput } from '../lib/api';

interface PillarCustomization {
  name: string;
  description: string;
}

export default function OnboardingView() {
  const navigate = useNavigate();
  const { data: settings, isLoading } = useSettings();
  const createPillars = useCreatePillars();
  const updateSettings = useUpdateSettings();

  const [step, setStep] = useState(1);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [customizations, setCustomizations] = useState<PillarCustomization[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <Spinner />;
  if (settings?.has_completed_onboarding) return <Navigate to="/today" replace />;

  const selectedPillars = Array.from(selectedIndices).map((i) => DEFAULT_PILLARS[i]);
  const canProceedStep1 = selectedIndices.size >= MIN_PILLARS && selectedIndices.size <= MAX_PILLARS;

  function handleToggle(index: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < MAX_PILLARS) {
        next.add(index);
      }
      return next;
    });
  }

  function handleStartStep2() {
    setCustomizations(
      selectedPillars.map((p) => ({ name: p.name, description: '' }))
    );
    setStep(2);
  }

  function handleCustomizationChange(
    index: number,
    field: keyof PillarCustomization,
    value: string
  ) {
    setCustomizations((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const inputs: CreatePillarInput[] = selectedPillars.map((pillar, index) => ({
        name: customizations[index]?.name || pillar.name,
        color: pillar.color,
        icon: pillar.icon,
        description: customizations[index]?.description || null,
        sort_order: index,
      }));

      await createPillars.mutateAsync(inputs);
      await updateSettings.mutateAsync({ has_completed_onboarding: true });
      navigate('/today', { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-xl p-8 rounded-[var(--r-2xl)] animate-scale-in"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: s <= step ? 'var(--accent)' : 'var(--border)',
                transform: s === step ? 'scale(1.3)' : 'scale(1)',
                transition: 'all 0.25s var(--ease-out)',
              }}
            />
          ))}
        </div>

        {/* Step 1: Pillar Selection */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h1
              className="font-display text-2xl text-center mb-2"
              style={{ color: 'var(--text)' }}
            >
              What areas of your life matter most?
            </h1>
            <p
              className="text-sm text-center mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Choose {MIN_PILLARS}&ndash;{MAX_PILLARS} pillars to organize your goals around.
            </p>

            <PillarSelector
              pillars={DEFAULT_PILLARS}
              selectedIndices={selectedIndices}
              onToggle={handleToggle}
              min={MIN_PILLARS}
              max={MAX_PILLARS}
            />

            <button
              type="button"
              disabled={!canProceedStep1}
              onClick={handleStartStep2}
              className="mt-6 w-full py-3 rounded-[var(--r-lg)] font-semibold text-sm text-white transition-all cursor-pointer"
              style={{
                background: canProceedStep1 ? 'var(--accent)' : 'var(--text-dim)',
                boxShadow: canProceedStep1 ? 'var(--shadow-accent)' : 'none',
                opacity: canProceedStep1 ? 1 : 0.6,
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Customize */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h1
              className="font-display text-2xl text-center mb-2"
              style={{ color: 'var(--text)' }}
            >
              Make them yours
            </h1>
            <p
              className="text-sm text-center mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Rename or describe your pillars. Or skip to keep the defaults.
            </p>

            <div className="space-y-4">
              {selectedPillars.map((pillar, index) => (
                <div
                  key={pillar.name}
                  className="flex items-start gap-3 p-4 rounded-[var(--r-lg)]"
                  style={{
                    background: `${pillar.color}08`,
                    border: `1px solid ${pillar.color}25`,
                  }}
                >
                  <span
                    className="mt-1 w-3 h-3 rounded-full shrink-0"
                    style={{ background: pillar.color }}
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={customizations[index]?.name ?? ''}
                      onChange={(e) =>
                        handleCustomizationChange(index, 'name', e.target.value)
                      }
                      className="w-full bg-transparent font-semibold text-sm outline-none"
                      style={{
                        color: 'var(--text)',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '4px',
                      }}
                    />
                    <input
                      type="text"
                      value={customizations[index]?.description ?? ''}
                      onChange={(e) =>
                        handleCustomizationChange(index, 'description', e.target.value)
                      }
                      placeholder="In one sentence, what does success look like here?"
                      className="w-full bg-transparent text-xs outline-none"
                      style={{
                        color: 'var(--text-secondary)',
                        paddingBottom: '2px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-[var(--r-lg)] font-semibold text-sm transition-all cursor-pointer"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-[2] py-3 rounded-[var(--r-lg)] font-semibold text-sm text-white transition-all cursor-pointer"
                style={{
                  background: 'var(--accent)',
                  boxShadow: 'var(--shadow-accent)',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-slide-up text-center">
            <div className="text-4xl mb-4">&#x2728;</div>
            <h1
              className="font-display text-2xl mb-2"
              style={{ color: 'var(--text)' }}
            >
              You&apos;re set. Let&apos;s build your first goal.
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Your {selectedPillars.length} pillars will guide everything you do in Momentum.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {selectedPillars.map((pillar, index) => (
                <span
                  key={pillar.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-full)] text-sm font-semibold"
                  style={{
                    color: pillar.color,
                    background: `${pillar.color}15`,
                    border: `1px solid ${pillar.color}30`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: pillar.color }}
                  />
                  {customizations[index]?.name || pillar.name}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-[var(--r-lg)] font-semibold text-sm transition-all cursor-pointer"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-[2] py-3 rounded-[var(--r-lg)] font-semibold text-sm text-white transition-all cursor-pointer"
                style={{
                  background: 'var(--accent)',
                  boxShadow: 'var(--shadow-accent)',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Setting up...' : "Let's go!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
