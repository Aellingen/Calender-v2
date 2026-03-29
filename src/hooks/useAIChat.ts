import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sendAIChatMessage, approveAIProposals } from '../lib/api';
import { useUIStore } from '../lib/store';
import { toast } from '../components/Toast';
import type { AIMessage, AIProposal } from '../lib/types';

export function useAIChat() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const aiChatContext = useUIStore((s) => s.aiChatContext);

  // When context changes with an initial message, auto-send it
  useEffect(() => {
    if (aiChatContext?.initialMessage && messages.length === 0 && !isLoading) {
      sendMessage(aiChatContext.initialMessage);
    }
    // Only run when context changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiChatContext]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const optimisticUserMsg: AIMessage = {
      id: `temp-user-${Date.now()}`,
      thread_id: threadId ?? '',
      role: 'user',
      content,
      proposals: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsLoading(true);

    try {
      const response = await sendAIChatMessage(
        threadId,
        content,
        aiChatContext?.type,
        aiChatContext?.id,
      );

      if (response.thread_id && !threadId) {
        setThreadId(response.thread_id);
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUserMsg.id),
        {
          id: response.user_message_id,
          thread_id: response.thread_id,
          role: 'user',
          content,
          proposals: null,
          created_at: new Date().toISOString(),
        },
        {
          id: response.assistant_message_id,
          thread_id: response.thread_id,
          role: 'assistant',
          content: response.message,
          proposals: response.proposals.length > 0 ? response.proposals : null,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
      toast(error instanceof Error ? error.message : 'AI request failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, isLoading, aiChatContext]);

  const startNewThread = useCallback(() => {
    setThreadId(null);
    setMessages([]);
  }, []);

  const approveProposal = useCallback(async (
    messageId: string,
    proposal: AIProposal,
    editedData?: Record<string, unknown>,
  ) => {
    try {
      const dataToSend = editedData
        ? { ...proposal.data, ...editedData }
        : proposal.data;

      const response = await approveAIProposals([
        { id: proposal.id, type: proposal.type, data: { ...dataToSend } as Record<string, unknown> },
      ]);

      if (response.errors.length > 0) {
        toast(response.errors[0].error, 'error');
        return;
      }

      // Update proposal status in messages
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId || !msg.proposals) return msg;
          return {
            ...msg,
            proposals: msg.proposals.map((p) =>
              p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
            ),
          };
        }),
      );

      // Invalidate only the relevant query
      if (proposal.type === 'goal') {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      } else if (proposal.type === 'action') {
        queryClient.invalidateQueries({ queryKey: ['actions'] });
      } else if (proposal.type === 'habit') {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      }

      toast(`${proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)} created`, 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to create', 'error');
    }
  }, [queryClient]);

  const rejectProposal = useCallback((messageId: string, proposalId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.proposals) return msg;
        return {
          ...msg,
          proposals: msg.proposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'rejected' as const } : p,
          ),
        };
      }),
    );
  }, []);

  return {
    messages,
    isLoading,
    threadId,
    sendMessage,
    startNewThread,
    approveProposal,
    rejectProposal,
  };
}
