import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3';
import { corsHeaders } from '../_shared/cors.ts';

const chatRequestSchema = z.object({
  thread_id: z.string().uuid().optional(),
  message: z.string().min(1).max(10000),
  context_type: z.enum(['general', 'goal', 'review', 'template']).optional(),
  context_id: z.string().uuid().optional(),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.json();
    const parsed = chatRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = parsed.data;

    // Rate limiting: count today's AI messages
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('ai_messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', todayStart.toISOString());
    if ((count ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: 'Daily AI limit reached (10/day)' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create or load thread
    let threadId = body.thread_id;
    if (!threadId) {
      const { data: thread, error: threadError } = await supabase
        .from('ai_threads')
        .insert({
          title: body.message.slice(0, 80),
          context_type: body.context_type ?? 'general',
          context_id: body.context_id ?? null,
        })
        .select()
        .single();
      if (threadError) throw threadError;
      threadId = thread.id;
    }

    // Load thread history
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Load user context
    const [pillarsRes, goalsRes, habitsRes] = await Promise.all([
      supabase.from('pillars').select('id, name, color, icon').eq('is_archived', false).order('sort_order'),
      supabase.from('goals').select('id, name, pillar_id, status, goal_type').eq('status', 'active').order('sort_order'),
      supabase.from('habits').select('id, name, pillar_id, frequency, current_streak').eq('is_active', true).order('sort_order'),
    ]);

    const pillars = pillarsRes.data ?? [];
    const goals = goalsRes.data ?? [];
    const habits = habitsRes.data ?? [];

    const pillarMap = Object.fromEntries(pillars.map((p: { id: string; name: string }) => [p.id, p.name]));

    const pillarList = pillars.map((p: { name: string; icon: string; color: string }) =>
      `- ${p.name} (${p.icon})`
    ).join('\n');

    const goalList = goals.map((g: { name: string; pillar_id: string; goal_type: string }) =>
      `- ${g.name} [${pillarMap[g.pillar_id] ?? 'Unknown'}] (${g.goal_type})`
    ).join('\n') || '(none yet)';

    const habitList = habits.map((h: { name: string; pillar_id: string; frequency: string; current_streak: number }) =>
      `- ${h.name} [${pillarMap[h.pillar_id] ?? 'Unknown'}] ${h.frequency}, ${h.current_streak} day streak`
    ).join('\n') || '(none yet)';

    const systemPrompt = `You are Momentum AI, a goal coaching assistant embedded in the Momentum productivity app. You help users break down aspirations into concrete goals, actions, and habits.

THE USER'S LIFE PILLARS:
${pillarList || '(none set up yet)'}

CURRENT ACTIVE GOALS:
${goalList}

CURRENT HABITS:
${habitList}

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact format — no markdown, no code fences, just raw JSON:
{
  "message": "Your conversational response here",
  "proposals": []
}

When suggesting new items, include them in the proposals array:
{
  "message": "Here's how I'd break this down...",
  "proposals": [
    {
      "id": "unique-short-id",
      "type": "goal",
      "data": {
        "name": "Run a 5K",
        "pillar_name": "Health",
        "description": "Train for and complete a 5K run",
        "goal_type": "milestone"
      }
    },
    {
      "id": "unique-short-id-2",
      "type": "habit",
      "data": {
        "name": "Morning jog",
        "pillar_name": "Health",
        "frequency": "weekdays",
        "icon": "🏃"
      }
    },
    {
      "id": "unique-short-id-3",
      "type": "action",
      "data": {
        "name": "Sign up for local 5K race",
        "goal_name": "Run a 5K",
        "estimated_minutes": 15,
        "priority": 2
      }
    }
  ]
}

RULES:
- Match proposals to existing pillar names when possible
- For actions, reference existing goal names or proposed goal names in goal_name
- Keep names actionable and specific
- Give each proposal a unique "id" string
- Only include proposals when suggesting goals/actions/habits. For general conversation, use an empty proposals array
- Never use pillar_id or goal_id — use names only
- Be encouraging but direct. No fluff.
- Valid goal_type values: "outcome", "process", "milestone"
- Valid frequency values: "daily", "weekdays", "weekends", "custom"
- For "custom" frequency, include "custom_days" as array of ISO day numbers (1=Mon..7=Sun)`;

    // Build messages for Claude
    const claudeMessages = [
      ...(history ?? []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.role === 'assistant' ? m.content : m.content,
      })),
      { role: 'user' as const, content: body.message },
    ];

    // Call Claude API
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30000);

    let claudeResponse: Response;
    try {
      claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: systemPrompt,
          messages: claudeMessages,
        }),
        signal: abortController.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('AI request timed out — please try again');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error('Claude API error:', errText);
      throw new Error('AI service temporarily unavailable');
    }

    const claudeData = await claudeResponse.json();
    const rawContent = claudeData.content?.[0]?.text ?? '';

    // Parse JSON from Claude's response
    const parsed = extractJSON(rawContent);

    // Add status to each proposal
    const proposals = (parsed.proposals ?? []).map((p: { id?: string; type: string; data: Record<string, unknown> }) => ({
      ...p,
      id: p.id ?? `proposal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
    }));

    // Save user message
    const { data: userMsg, error: userMsgErr } = await supabase
      .from('ai_messages')
      .insert({
        thread_id: threadId,
        role: 'user',
        content: body.message,
      })
      .select('id')
      .single();
    if (userMsgErr) throw userMsgErr;

    // Save assistant message
    const { data: assistantMsg, error: assistantMsgErr } = await supabase
      .from('ai_messages')
      .insert({
        thread_id: threadId,
        role: 'assistant',
        content: parsed.message,
        proposals: proposals.length > 0 ? proposals : null,
      })
      .select('id')
      .single();
    if (assistantMsgErr) throw assistantMsgErr;

    // Update thread title if this is the first message
    if (!body.thread_id) {
      await supabase
        .from('ai_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);
    }

    return new Response(JSON.stringify({
      thread_id: threadId,
      message: parsed.message,
      proposals,
      user_message_id: userMsg.id,
      assistant_message_id: assistantMsg.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractJSON(text: string): { message: string; proposals: Array<{ id?: string; type: string; data: Record<string, unknown> }> } {
  // Try parsing whole response as JSON
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // Fall through
      }
    }
    // Return text as message with no proposals
    return { message: text, proposals: [] };
  }
}
