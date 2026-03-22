import { supabase } from './supabase';
import type { Pillar, Goal, Action, Habit, HabitCompletion, JournalEntry, UserSettings, Review, ReviewSnapshot } from './types';

// Generic typed fetch helpers wrapping the Supabase client.
// All data access goes through these functions — never use supabase directly in components.

export async function fetchPillars(): Promise<Pillar[]> {
  const { data, error } = await supabase
    .from('pillars')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchGoals(status?: string): Promise<Goal[]> {
  let query = supabase.from('goals').select('*').order('sort_order');
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchActions(goalId?: string): Promise<Action[]> {
  let query = supabase.from('actions').select('*').order('sort_order');
  if (goalId) query = query.eq('goal_id', goalId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchHabitCompletions(habitId: string, from: string, to: string): Promise<HabitCompletion[]> {
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .gte('completed_date', from)
    .lte('completed_date', to);
  if (error) throw error;
  return data;
}

export async function fetchJournalEntry(date: string): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('entry_date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchReviewSnapshots(reviewId: string): Promise<ReviewSnapshot[]> {
  const { data, error } = await supabase
    .from('review_snapshots')
    .select('*')
    .eq('review_id', reviewId);
  if (error) throw error;
  return data;
}

// --- Pillar mutations ---

export interface CreatePillarInput {
  name: string;
  color: string;
  icon: string;
  description?: string | null;
  sort_order: number;
}

export interface UpdatePillarInput {
  name?: string;
  color?: string;
  icon?: string;
  description?: string | null;
  sort_order?: number;
  is_archived?: boolean;
}

export async function createPillar(input: CreatePillarInput): Promise<Pillar> {
  const { data, error } = await supabase
    .from('pillars')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createPillars(inputs: CreatePillarInput[]): Promise<Pillar[]> {
  const { data, error } = await supabase
    .from('pillars')
    .insert(inputs)
    .select();
  if (error) throw error;
  return data;
}

export async function updatePillar(id: string, input: UpdatePillarInput): Promise<Pillar> {
  const { data, error } = await supabase
    .from('pillars')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function reorderPillars(ids: string[]): Promise<void> {
  const updates = ids.map((id, index) => ({ id, sort_order: index }));
  for (const { id, sort_order } of updates) {
    const { error } = await supabase
      .from('pillars')
      .update({ sort_order })
      .eq('id', id);
    if (error) throw error;
  }
}

export async function archivePillar(id: string): Promise<void> {
  const { error } = await supabase
    .from('pillars')
    .update({ is_archived: true })
    .eq('id', id);
  if (error) throw error;
}

// --- Goal mutations ---

export interface CreateGoalInput {
  name: string;
  pillar_id: string;
  description?: string | null;
  color?: string | null;
  mode?: 'checked' | 'counted';
  target?: number | null;
  unit?: string | null;
  goal_type?: 'outcome' | 'process' | 'milestone';
  deadline?: string | null;
}

export interface UpdateGoalInput {
  name?: string;
  pillar_id?: string;
  description?: string | null;
  color?: string | null;
  mode?: 'checked' | 'counted';
  target?: number | null;
  current_value?: number;
  unit?: string | null;
  goal_type?: 'outcome' | 'process' | 'milestone';
  status?: 'active' | 'paused' | 'archived' | 'complete';
  deadline?: string | null;
  sort_order?: number;
}

export async function fetchGoal(id: string): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  // Unlink habits (they keep pillar, lose goal_id)
  await supabase
    .from('habits')
    .update({ goal_id: null })
    .eq('goal_id', id);

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function reorderGoals(ids: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('goals')
      .update({ sort_order: i })
      .eq('id', ids[i]);
    if (error) throw error;
  }
}

// --- Action mutations ---

export interface CreateActionInput {
  name: string;
  goal_id: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  estimated_minutes?: number | null;
  priority?: number;
  target?: number | null;
  unit?: string | null;
  period_type?: 'weekly' | 'monthly' | 'none';
}

export interface UpdateActionInput {
  name?: string;
  goal_id?: string;
  status?: 'active' | 'complete' | 'archived';
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  estimated_minutes?: number | null;
  priority?: number;
  target?: number | null;
  current_value?: number;
  unit?: string | null;
  sort_order?: number;
}

export async function fetchTodayActions(date: string): Promise<Action[]> {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('scheduled_date', date)
    .order('scheduled_time', { ascending: true, nullsFirst: false })
    .order('priority', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAction(id: string): Promise<Action> {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createAction(input: CreateActionInput): Promise<Action> {
  const { data, error } = await supabase
    .from('actions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAction(id: string, input: UpdateActionInput): Promise<Action> {
  const { data, error } = await supabase
    .from('actions')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeAction(id: string): Promise<Action> {
  const { data, error } = await supabase
    .from('actions')
    .update({ status: 'complete' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAction(id: string): Promise<void> {
  const { error } = await supabase
    .from('actions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// --- Habit mutations ---

export interface CreateHabitInput {
  name: string;
  pillar_id: string;
  goal_id?: string | null;
  icon?: string | null;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  custom_days?: number[] | null;
}

export interface UpdateHabitInput {
  name?: string;
  pillar_id?: string;
  goal_id?: string | null;
  icon?: string | null;
  frequency?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  custom_days?: number[] | null;
  sort_order?: number;
  is_active?: boolean;
}

export async function fetchTodayCompletions(date: string): Promise<HabitCompletion[]> {
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('completed_date', date);
  if (error) throw error;
  return data;
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHabit(id: string, input: UpdateHabitInput): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleHabitCompletion(
  habitId: string,
  date: string,
): Promise<{ completed: boolean; streak: number }> {
  // Check if completion exists
  const { data: existing } = await supabase
    .from('habit_completions')
    .select('id')
    .eq('habit_id', habitId)
    .eq('completed_date', date)
    .maybeSingle();

  if (existing) {
    // Delete completion
    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;

    // Recalculate streak
    const streak = await recalculateStreak(habitId);
    return { completed: false, streak };
  } else {
    // Insert completion
    const { error } = await supabase
      .from('habit_completions')
      .insert({ habit_id: habitId, completed_date: date });
    if (error) throw error;

    // Recalculate streak
    const streak = await recalculateStreak(habitId);
    return { completed: true, streak };
  }
}

async function recalculateStreak(habitId: string): Promise<number> {
  // Get habit details for frequency
  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .single();
  if (habitError) throw habitError;

  // Get completions ordered by date DESC
  const { data: completions, error: compError } = await supabase
    .from('habit_completions')
    .select('completed_date')
    .eq('habit_id', habitId)
    .order('completed_date', { ascending: false });
  if (compError) throw compError;

  const completionDates = new Set(completions.map((c: HabitCompletion) => c.completed_date));

  // Walk backwards from today counting consecutive scheduled days with completions
  // Grace period: if current hour < 4 AM, consider "today" as yesterday
  const now = new Date();
  let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() < 4) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let streak = 0;
  // Allow today to not be completed yet — start from today and check
  // If today is not completed, check if today is a scheduled day; if so, streak starts from yesterday
  const todayStr = checkDate.toISOString().split('T')[0];
  const todayScheduled = isDayScheduled(checkDate, habit as Habit);

  if (todayScheduled && !completionDates.has(todayStr)) {
    // Today is scheduled but not completed — streak is from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const scheduled = isDayScheduled(checkDate, habit as Habit);

    if (scheduled) {
      if (completionDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    // Skip non-scheduled days
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Update habit streaks
  const longestStreak = Math.max(streak, (habit as Habit).longest_streak);
  await supabase
    .from('habits')
    .update({ current_streak: streak, longest_streak: longestStreak })
    .eq('id', habitId);

  return streak;
}

function isDayScheduled(date: Date, habit: Habit): boolean {
  const day = date.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const isoDay = day === 0 ? 7 : day; // Convert to ISO: 1=Mon ... 7=Sun

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return isoDay >= 1 && isoDay <= 5;
    case 'weekends':
      return isoDay === 6 || isoDay === 7;
    case 'custom':
      return habit.custom_days?.includes(isoDay) ?? false;
    default:
      return true;
  }
}

export async function retireHabit(id: string): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// --- Journal mutations ---

export interface UpsertJournalInput {
  entry_date: string;
  content?: string | null;
  mood?: 1 | 2 | 3 | 4 | 5 | null;
  pillar_ids?: string[];
}

export async function fetchJournalHistory(limit: number): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function upsertJournal(input: UpsertJournalInput): Promise<JournalEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if entry exists for this date
  const { data: existing } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('entry_date', input.entry_date)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        content: input.content,
        mood: input.mood,
        pillar_ids: input.pillar_ids,
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        entry_date: input.entry_date,
        content: input.content,
        mood: input.mood,
        pillar_ids: input.pillar_ids ?? [],
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// --- Review mutations ---

export interface SubmitReviewInput {
  review_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  note?: string | null;
  pillar_breakdown?: Record<string, unknown> | null;
}

export async function fetchReviewsByType(type?: string): Promise<Review[]> {
  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (type) query = query.eq('review_type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function submitReview(input: SubmitReviewInput): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Action density for calendar ---

export async function fetchActionDensity(
  startDate: string,
  endDate: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('actions')
    .select('scheduled_date')
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .not('scheduled_date', 'is', null);
  if (error) throw error;

  const density: Record<string, number> = {};
  for (const row of data) {
    const d = row.scheduled_date as string;
    density[d] = (density[d] || 0) + 1;
  }
  return density;
}

// --- User settings mutation ---

export async function updateUserSettings(input: Partial<Omit<UserSettings, 'user_id' | 'created_at'>>): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('user_settings')
    .update(input)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
