import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

    // Load user's current state
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const hour = new Date().getHours();

    const [actionsRes, habitsRes, completionsRes, goalsRes, pillarsRes] = await Promise.all([
      supabase.from('actions').select('name, status, scheduled_date, priority').eq('scheduled_date', today),
      supabase.from('habits').select('id, name, current_streak, frequency, pillar_id').eq('is_active', true),
      supabase.from('habit_completions').select('habit_id').eq('completed_date', today),
      supabase.from('goals').select('name, status, pillar_id').eq('status', 'active'),
      supabase.from('pillars').select('id, name').eq('is_archived', false),
    ]);

    const actions = actionsRes.data ?? [];
    const habits = habitsRes.data ?? [];
    const completions = completionsRes.data ?? [];
    const goals = goalsRes.data ?? [];
    const pillars = pillarsRes.data ?? [];

    const pillarMap = Object.fromEntries(pillars.map((p: { id: string; name: string }) => [p.id, p.name]));

    const completedHabitIds = new Set(completions.map((c: { habit_id: string }) => c.habit_id));
    const todayActions = actions.length;
    const completedActions = actions.filter((a: { status: string }) => a.status === 'complete').length;
    const pendingActions = todayActions - completedActions;
    const totalHabitsToday = habits.length;
    const completedHabitsToday = completedHabitIds.size;

    // Build context string
    const habitSummary = habits.map((h: { id: string; name: string; current_streak: number; pillar_id: string }) => {
      const done = completedHabitIds.has(h.id);
      return `- ${h.name} (${h.current_streak} day streak, ${done ? 'done' : 'pending'})`;
    }).join('\n');

    const actionSummary = actions.map((a: { name: string; status: string; priority: number }) =>
      `- ${a.name} (${a.status}, priority ${a.priority})`
    ).join('\n');

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 15000);

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
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          system: `You are a brief productivity coach. Generate a single short coaching nudge (1-2 sentences max). Be encouraging, specific, and actionable. No generic motivational quotes.

Context:
- Day: ${dayOfWeek}, ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}
- Today's actions: ${pendingActions} pending, ${completedActions} done out of ${todayActions}
- Today's habits: ${completedHabitsToday}/${totalHabitsToday} complete
- Active goals: ${goals.length}

Habits today:
${habitSummary || '(none)'}

Actions today:
${actionSummary || '(none)'}

Return ONLY valid JSON:
{ "nudge": "your coaching message", "type": "motivation" | "reminder" | "celebration" }

Types:
- "celebration" if user is making great progress
- "reminder" if habits/actions are pending
- "motivation" if user seems stuck or it's early in the day`,
          messages: [{ role: 'user', content: 'Give me a nudge for right now.' }],
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
      throw new Error('AI service temporarily unavailable');
    }

    const claudeData = await claudeResponse.json();
    const rawContent = claudeData.content?.[0]?.text ?? '';

    let parsed: { nudge: string; type: string };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1].trim());
      } else {
        parsed = { nudge: rawContent, type: 'motivation' };
      }
    }

    return new Response(JSON.stringify(parsed), {
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
