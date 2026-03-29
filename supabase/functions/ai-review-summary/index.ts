import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3';
import { corsHeaders } from '../_shared/cors.ts';

const reviewSummarySchema = z.object({
  review_id: z.string().uuid(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pillar_breakdown: z.record(z.string(), z.unknown()),
  note: z.string().max(2000).optional(),
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
    const parsedInput = reviewSummarySchema.safeParse(rawBody);
    if (!parsedInput.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: parsedInput.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = parsedInput.data;

    // Rate limit check
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

    // Load context data
    const [pillarsRes, goalsRes, habitsRes, settingsRes] = await Promise.all([
      supabase.from('pillars').select('id, name, color').eq('is_archived', false),
      supabase.from('goals').select('id, name, pillar_id, status').eq('status', 'active'),
      supabase.from('habits').select('id, name, pillar_id, current_streak, longest_streak').eq('is_active', true),
      supabase.from('user_settings').select('journal_ai_access').single(),
    ]);

    const pillars = pillarsRes.data ?? [];
    const goals = goalsRes.data ?? [];
    const habits = habitsRes.data ?? [];
    const journalAccess = settingsRes.data?.journal_ai_access ?? false;

    const pillarMap = Object.fromEntries(pillars.map((p: { id: string; name: string }) => [p.id, p.name]));

    // Optionally load journal entries for context
    let journalContext = '';
    if (journalAccess) {
      const { data: journals } = await supabase
        .from('journal_entries')
        .select('entry_date, content, mood')
        .gte('entry_date', body.period_start)
        .lte('entry_date', body.period_end)
        .order('entry_date', { ascending: true });

      if (journals && journals.length > 0) {
        journalContext = '\n\nJOURNAL ENTRIES THIS WEEK (paraphrase only, never quote directly):\n' +
          journals.map((j: { entry_date: string; content: string | null; mood: number | null }) =>
            `- ${j.entry_date}: mood ${j.mood ?? '?'}/5${j.content ? ` — ${j.content.slice(0, 100)}` : ''}`
          ).join('\n');
      }
    }

    // Build pillar breakdown context
    const breakdownText = Object.entries(body.pillar_breakdown).map(([id, data]) => {
      const d = data as Record<string, unknown>;
      return `- ${d.name}: ${d.actionsCompleted}/${d.actionsTotal} actions (${d.completionPct}%), ${d.habits} habits, avg streak ${d.avgStreak} days`;
    }).join('\n');

    const goalList = goals.map((g: { name: string; pillar_id: string }) =>
      `- ${g.name} [${pillarMap[g.pillar_id] ?? 'Unknown'}]`
    ).join('\n');

    const habitList = habits.map((h: { name: string; current_streak: number; longest_streak: number }) =>
      `- ${h.name}: ${h.current_streak} day streak (best: ${h.longest_streak})`
    ).join('\n');

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
          max_tokens: 1024,
          system: `You are analyzing a user's weekly review for the Momentum goal tracking app. Write a concise, encouraging weekly summary (3-5 paragraphs). Be specific about what went well and what could improve. Never quote journal entries directly — paraphrase indirectly.

PILLAR PERFORMANCE:
${breakdownText}

ACTIVE GOALS:
${goalList || '(none)'}

HABIT STREAKS:
${habitList || '(none)'}

USER'S REFLECTION NOTE: ${body.note || '(none)'}${journalContext}

Return ONLY valid JSON:
{
  "summary": "Your analysis here (use \\n for paragraphs)",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`,
          messages: [{ role: 'user', content: `Generate my weekly review summary for ${body.period_start} to ${body.period_end}.` }],
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

    let parsed: { summary: string; highlights: string[]; suggestions: string[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      try {
        const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          parsed = JSON.parse(match[1].trim());
        } else {
          parsed = { summary: rawContent, highlights: [], suggestions: [] };
        }
      } catch {
        parsed = { summary: rawContent, highlights: [], suggestions: [] };
      }
    }

    // Save the AI summary to the review
    if (body.review_id) {
      await supabase
        .from('reviews')
        .update({ ai_summary: parsed.summary })
        .eq('id', body.review_id);
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
