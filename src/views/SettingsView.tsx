import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { Spinner } from '../components/Spinner';
import { JournalHistory } from '../components/JournalHistory';

export default function SettingsView() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [journalAiAccess, setJournalAiAccess] = useState(true);
  const [promptTime, setPromptTime] = useState('20:00');
  const [showJournalHistory, setShowJournalHistory] = useState(false);

  useEffect(() => {
    if (settings) {
      setJournalAiAccess(settings.journal_ai_access);
      setPromptTime(settings.journal_prompt_time ?? '20:00');
    }
  }, [settings]);

  function handleSave() {
    updateSettings.mutate({
      journal_ai_access: journalAiAccess,
      journal_prompt_time: promptTime,
    });
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="animate-slide-up max-w-xl">
      <h1 className="font-display text-2xl mb-5" style={{ color: 'var(--text)' }}>
        Settings
      </h1>

      <div className="space-y-6">
        {/* Journal settings */}
        <div
          className="px-5 py-4 rounded-[var(--r-xl)]"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-display text-sm mb-4" style={{ color: 'var(--text)' }}>
            Journal
          </h2>

          <div className="space-y-4">
            {/* AI access toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  AI access to journal
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Allow AI to read journal entries for personalized coaching (Phase 2)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setJournalAiAccess(!journalAiAccess)}
                className="w-10 h-6 rounded-full cursor-pointer transition-colors relative"
                style={{
                  background: journalAiAccess ? 'var(--accent)' : 'var(--slider-bg)',
                }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full transition-transform"
                  style={{
                    background: 'white',
                    left: journalAiAccess ? '22px' : '2px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />
              </button>
            </div>

            {/* Prompt time */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Reflection prompt time
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  When to show the "Reflect" button
                </p>
              </div>
              <input
                type="time"
                value={promptTime}
                onChange={(e) => setPromptTime(e.target.value)}
                className="px-2 py-1 text-sm rounded-[var(--r-md)] outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="px-4 py-2 text-sm font-semibold text-white rounded-[var(--r-md)] cursor-pointer"
              style={{
                background: 'var(--accent)',
                opacity: updateSettings.isPending ? 0.6 : 1,
              }}
            >
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Journal history toggle */}
        <div
          className="px-5 py-4 rounded-[var(--r-xl)]"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm" style={{ color: 'var(--text)' }}>
              Journal History
            </h2>
            <button
              type="button"
              onClick={() => setShowJournalHistory(!showJournalHistory)}
              className="px-3 py-1.5 text-xs font-semibold rounded-[var(--r-full)] cursor-pointer"
              style={{
                background: 'var(--bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {showJournalHistory ? 'Hide' : 'Show'}
            </button>
          </div>
          {showJournalHistory && <JournalHistory />}
        </div>
      </div>
    </div>
  );
}
