import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../lib/store';
import { useAIChat } from '../hooks/useAIChat';
import { useAIUsage } from '../hooks/useAIUsage';
import { GoalProposalCard } from './GoalProposalCard';
import type { AIMessage, AIProposal } from '../lib/types';

export function AIChatPanel() {
  const { isAIChatOpen, closeAIChat } = useUIStore();
  const {
    messages,
    isLoading,
    sendMessage,
    startNewThread,
    approveProposal,
    rejectProposal,
  } = useAIChat();

  const { data: usageCount } = useAIUsage();
  const atLimit = typeof usageCount === 'number' && usageCount >= 10;

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isAIChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isAIChatOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || atLimit) return;
    sendMessage(input.trim());
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  if (!isAIChatOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(28,25,23,0.2)' }}
        onClick={closeAIChat}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full flex flex-col ai-chat-panel"
        style={{
          width: 'min(420px, 100%)',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 300ms var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <h2 className="font-display text-sm" style={{ color: 'var(--text)' }}>
              Momentum AI
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {typeof usageCount === 'number' && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-[var(--r-full)]"
                style={{
                  background: usageCount >= 8 ? 'var(--danger-softer)' : 'var(--bg)',
                  color: usageCount >= 8 ? 'var(--danger)' : 'var(--text-muted)',
                  border: `1px solid ${usageCount >= 8 ? 'var(--danger-light)' : 'var(--border)'}`,
                }}
              >
                {usageCount}/10 today
              </span>
            )}
            <button
              type="button"
              onClick={() => startNewThread()}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-[var(--r-full)] cursor-pointer"
              style={{
                background: 'var(--bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              New Chat
            </button>
            <button
              type="button"
              onClick={closeAIChat}
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm cursor-pointer"
              style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <EmptyState onSuggestion={sendMessage} />
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onApprove={(proposal, editedData) =>
                approveProposal(msg.id, proposal, editedData)
              }
              onReject={(proposalId) => rejectProposal(msg.id, proposalId)}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                style={{ background: 'var(--accent-softer)', color: 'var(--accent)' }}
              >
                ✨
              </span>
              <div
                className="px-3 py-2.5 rounded-[var(--r-md)] rounded-tl-none"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-light)', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-light)', animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-light)', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 px-4 pb-4 pt-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            className="flex items-end gap-2 rounded-[var(--r-md)] overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={atLimit ? 'Daily AI limit reached (10/day)' : 'Ask about goals, habits, or productivity...'}
              disabled={atLimit}
              rows={1}
              className="flex-1 px-3 py-2.5 text-sm outline-none resize-none bg-transparent"
              style={{
                color: 'var(--text)',
                maxHeight: '120px',
                opacity: atLimit ? 0.5 : 1,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || atLimit}
              className="px-3 py-2.5 text-sm font-semibold cursor-pointer shrink-0"
              style={{
                color: input.trim() && !isLoading && !atLimit ? 'var(--accent)' : 'var(--text-dim)',
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

interface MessageBubbleProps {
  message: AIMessage;
  onApprove: (proposal: AIProposal, editedData?: Record<string, unknown>) => void;
  onReject: (proposalId: string) => void;
}

function MessageBubble({ message, onApprove, onReject }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
        style={{
          background: isUser ? 'var(--bg)' : 'var(--accent-softer)',
          color: isUser ? 'var(--text-secondary)' : 'var(--accent)',
          border: isUser ? '1px solid var(--border)' : 'none',
        }}
      >
        {isUser ? '👤' : '✨'}
      </span>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block text-sm px-3 py-2.5 rounded-[var(--r-md)] ${
            isUser ? 'rounded-tr-none' : 'rounded-tl-none'
          }`}
          style={{
            background: isUser ? 'var(--accent)' : 'var(--card)',
            color: isUser ? 'white' : 'var(--text)',
            border: isUser ? 'none' : '1px solid var(--border)',
            maxWidth: '85%',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.content}
        </div>

        {/* Proposals */}
        {message.proposals && message.proposals.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.proposals.map((proposal) => (
              <GoalProposalCard
                key={proposal.id}
                proposal={proposal}
                onApprove={(editedData) => onApprove(proposal, editedData)}
                onReject={() => onReject(proposal.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onSuggestion }: { onSuggestion: (msg: string) => void }) {
  const suggestions = [
    'Help me break down a fitness goal',
    'I want to learn a new language',
    'Suggest habits for better productivity',
    'Help me plan my career development',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-3xl mb-3">✨</span>
      <h3 className="font-display text-base mb-1" style={{ color: 'var(--text)' }}>
        How can I help?
      </h3>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        I can help decompose goals, suggest habits, and plan actions.
      </p>
      <div className="space-y-2 w-full max-w-[280px]">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="w-full px-3 py-2 text-xs text-left rounded-[var(--r-md)] cursor-pointer transition-all"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-light)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
