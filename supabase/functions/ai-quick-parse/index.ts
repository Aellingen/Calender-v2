import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3';
import { corsHeaders } from '../_shared/cors.ts';

const quickParseSchema = z.object({
  text: z.string().min(1).max(500),
});

interface ParsedEntity {
  type: 'action' | 'habit';
  name: string;
  goal_name?: string;
  pillar_name?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_minutes?: number;
  priority?: number;
  frequency?: string;
  icon?: string;
}

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
    const parsed = quickParseSchema.safeParse(rawBody);
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

    // Load user context for matching
    const [pillarsRes, goalsRes] = await Promise.all([
      supabase.from('pillars').select('id, name').eq('is_archived', false),
      supabase.from('goals').select('id, name, pillar_id').eq('status', 'active'),
    ]);

    const pillars = pillarsRes.data ?? [];
    const goals = goalsRes.data ?? [];

    const pillarNames = pillars.map((p: { name: string }) => p.name).join(', ');
    const goalNames = goals.map((g: { name: string }) => g.name).join(', ');

    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

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
          max_tokens: 512,
          system: `You parse natural language into structured task/habit data. Today is ${today} (${dayOfWeek}).

The user's pillars: ${pillarNames || '(none)'}
The user's goals: ${goalNames || '(none)'}

Return ONLY valid JSON (no markdown, no code fences):
{
  "type": "action" or "habit",
  "name": "clean task name",
  "goal_name": "matching goal name or null",
  "pillar_name": "matching pillar name or null",
  "scheduled_date": "YYYY-MM-DD or null",
  "scheduled_time": "HH:MM or null",
  "estimated_minutes": number or null,
  "priority": 1-3 or null,
  "frequency": "daily/weekdays/weekends or null (only for habits)",
  "icon": "emoji or null (only for habits)"
}

Rules:
- "tomorrow" = next day from today
- "every day/morning/evening" → type: "habit"
- Default type is "action"
- Match goal_name to existing goals when input references them
- Match pillar_name to existing pillars when input references a category
- Time references like "at 3pm" → scheduled_time: "15:00"
- Duration references like "30 min" → estimated_minutes: 30
- "important/urgent" → priority: 3, "low priority" → priority: 1`,
          messages: [{ role: 'user', content: body.text }],
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

    let parsed: ParsedEntity;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1].trim());
      } else {
        // Fallback: create a basic action from the text
        parsed = { type: 'action', name: body.text.trim() };
      }
    }

    // Resolve names to IDs
    const pillarByName = new Map(pillars.map((p: { id: string; name: string }) => [p.name.toLowerCase(), p.id]));
    const goalByName = new Map(goals.map((g: { id: string; name: string }) => [g.name.toLowerCase(), g.id]));

    const pillarId = parsed.pillar_name ? pillarByName.get(parsed.pillar_name.toLowerCase()) ?? null : null;
    const goalId = parsed.goal_name ? goalByName.get(parsed.goal_name.toLowerCase()) ?? null : null;

    return new Response(JSON.stringify({
      parsed: {
        ...parsed,
        pillar_id: pillarId,
        goal_id: goalId,
      },
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
