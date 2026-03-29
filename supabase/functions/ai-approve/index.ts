import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3';
import { corsHeaders } from '../_shared/cors.ts';

const approveRequestSchema = z.object({
  proposals: z.array(z.object({
    id: z.string().min(1),
    type: z.enum(['goal', 'action', 'habit']),
    data: z.record(z.unknown()),
  })).min(1).max(50),
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
    const parsed = approveRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = parsed.data;

    // Load pillars and goals for name→id resolution
    const [pillarsRes, goalsRes] = await Promise.all([
      supabase.from('pillars').select('id, name').eq('is_archived', false),
      supabase.from('goals').select('id, name').eq('status', 'active'),
    ]);

    const pillars = pillarsRes.data ?? [];
    const goals = goalsRes.data ?? [];

    const pillarByName = new Map(pillars.map((p: { id: string; name: string }) => [p.name.toLowerCase(), p.id]));
    const goalByName = new Map(goals.map((g: { id: string; name: string }) => [g.name.toLowerCase(), g.id]));

    const created: Array<{ proposal_id: string; type: string; entity_id: string }> = [];
    const errors: Array<{ proposal_id: string; error: string }> = [];

    // Track goals created in this batch for action/habit linking
    const newGoalsByName = new Map<string, string>();

    // Process goals first, then actions/habits (so we can link to newly created goals)
    const goalProposals = body.proposals.filter(p => p.type === 'goal');
    const otherProposals = body.proposals.filter(p => p.type !== 'goal');

    for (const proposal of goalProposals) {
      try {
        const data = proposal.data;
        const pillarName = (data.pillar_name as string)?.toLowerCase();
        const pillarId = pillarByName.get(pillarName ?? '');

        if (!pillarId) {
          errors.push({ proposal_id: proposal.id, error: `Pillar "${data.pillar_name}" not found` });
          continue;
        }

        const { data: entity, error: insertError } = await supabase
          .from('goals')
          .insert({
            name: data.name as string,
            pillar_id: pillarId,
            description: (data.description as string) ?? null,
            goal_type: (data.goal_type as string) ?? 'outcome',
            mode: (data.mode as string) ?? 'checked',
            target: (data.target as number) ?? null,
            unit: (data.unit as string) ?? null,
            deadline: (data.deadline as string) ?? null,
            is_ai_generated: true,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        created.push({ proposal_id: proposal.id, type: 'goal', entity_id: entity.id });
        newGoalsByName.set((data.name as string).toLowerCase(), entity.id);
      } catch (err) {
        errors.push({ proposal_id: proposal.id, error: err instanceof Error ? err.message : 'Failed to create goal' });
      }
    }

    for (const proposal of otherProposals) {
      try {
        const data = proposal.data;

        if (proposal.type === 'action') {
          // Resolve goal
          const goalName = (data.goal_name as string)?.toLowerCase();
          const goalId = data.goal_id as string
            ?? goalByName.get(goalName ?? '')
            ?? newGoalsByName.get(goalName ?? '');

          if (!goalId) {
            errors.push({ proposal_id: proposal.id, error: `Goal "${data.goal_name}" not found` });
            continue;
          }

          const { data: entity, error: insertError } = await supabase
            .from('actions')
            .insert({
              name: data.name as string,
              goal_id: goalId,
              scheduled_date: (data.scheduled_date as string) ?? null,
              scheduled_time: (data.scheduled_time as string) ?? null,
              estimated_minutes: (data.estimated_minutes as number) ?? null,
              priority: (data.priority as number) ?? 2,
              is_ai_generated: true,
            })
            .select('id')
            .single();

          if (insertError) throw insertError;
          created.push({ proposal_id: proposal.id, type: 'action', entity_id: entity.id });
        } else if (proposal.type === 'habit') {
          const pillarName = (data.pillar_name as string)?.toLowerCase();
          const pillarId = data.pillar_id as string ?? pillarByName.get(pillarName ?? '');

          if (!pillarId) {
            errors.push({ proposal_id: proposal.id, error: `Pillar "${data.pillar_name}" not found` });
            continue;
          }

          const goalName = (data.goal_name as string)?.toLowerCase();
          const goalId = data.goal_id as string
            ?? goalByName.get(goalName ?? '')
            ?? newGoalsByName.get(goalName ?? '')
            ?? null;

          const { data: entity, error: insertError } = await supabase
            .from('habits')
            .insert({
              name: data.name as string,
              pillar_id: pillarId,
              goal_id: goalId,
              icon: (data.icon as string) ?? null,
              frequency: (data.frequency as string) ?? 'daily',
              custom_days: (data.custom_days as number[]) ?? null,
            })
            .select('id')
            .single();

          if (insertError) throw insertError;
          created.push({ proposal_id: proposal.id, type: 'habit', entity_id: entity.id });
        }
      } catch (err) {
        errors.push({ proposal_id: proposal.id, error: err instanceof Error ? err.message : 'Failed to create entity' });
      }
    }

    return new Response(JSON.stringify({ created, errors }), {
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
