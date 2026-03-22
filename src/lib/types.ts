export interface Pillar {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  description: string | null;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  pillar_id: string;
  name: string;
  description: string | null;
  color: string | null;
  mode: 'checked' | 'counted';
  target: number | null;
  current_value: number;
  unit: string | null;
  goal_type: 'outcome' | 'process' | 'milestone';
  status: 'active' | 'paused' | 'archived' | 'complete';
  deadline: string | null;
  linked_goal_id: string | null;
  template_source_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Action {
  id: string;
  user_id: string;
  goal_id: string;
  name: string;
  target: number | null;
  current_value: number;
  unit: string | null;
  status: 'active' | 'complete' | 'archived';
  period_type: 'weekly' | 'monthly' | 'none';
  recurrence_mode: 'none' | 'auto_reset';
  pinned: boolean;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_minutes: number | null;
  priority: number;
  is_ai_generated: boolean;
  sort_order: number;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  pillar_id: string;
  goal_id: string | null;
  name: string;
  icon: string | null;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  custom_days: number[] | null;
  current_streak: number;
  longest_streak: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_date: string;
  completed_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  content: string | null;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  pillar_ids: string[];
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  journal_ai_access: boolean;
  journal_prompt_time: string;
  has_completed_onboarding: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  review_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  note: string | null;
  ai_summary: string | null;
  pillar_breakdown: Record<string, unknown> | null;
  created_at: string;
}

export interface ReviewSnapshot {
  id: string;
  review_id: string;
  action_id: string;
  sealed_value: number;
}
