-- Momentum Phase 1 — Complete Supabase Migration
-- Run this in Supabase SQL Editor or as a migration file

-- ============================================
-- PILLARS
-- ============================================
CREATE TABLE pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#7C3AED',
  icon text NOT NULL DEFAULT 'star',
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own pillars" ON pillars
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pillars_user ON pillars(user_id);

-- ============================================
-- GOALS
-- ============================================
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id uuid NOT NULL REFERENCES pillars(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  color text, -- legacy, kept for backward compat; pillar color is primary
  mode text NOT NULL DEFAULT 'checked' CHECK (mode IN ('checked', 'counted')),
  target numeric,
  current_value numeric DEFAULT 0,
  unit text,
  goal_type text NOT NULL DEFAULT 'outcome' CHECK (goal_type IN ('outcome', 'process', 'milestone')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived', 'complete')),
  deadline date,
  linked_goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  template_source_id text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own goals" ON goals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_pillar ON goals(pillar_id);
CREATE INDEX idx_goals_status ON goals(user_id, status);

-- ============================================
-- ACTIONS
-- ============================================
CREATE TABLE actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  name text NOT NULL,
  target numeric,
  current_value numeric DEFAULT 0,
  unit text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'complete', 'archived')),
  period_type text DEFAULT 'weekly' CHECK (period_type IN ('weekly', 'monthly', 'none')),
  recurrence_mode text DEFAULT 'none' CHECK (recurrence_mode IN ('none', 'auto_reset')),
  pinned boolean NOT NULL DEFAULT false,
  scheduled_date date,
  scheduled_time time,
  estimated_minutes integer,
  priority integer NOT NULL DEFAULT 0,
  is_ai_generated boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own actions" ON actions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_actions_user ON actions(user_id);
CREATE INDEX idx_actions_goal ON actions(goal_id);
CREATE INDEX idx_actions_scheduled ON actions(user_id, scheduled_date);

-- ============================================
-- HABITS
-- ============================================
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id uuid NOT NULL REFERENCES pillars(id) ON DELETE RESTRICT,
  goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  name text NOT NULL,
  icon text,
  frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
  custom_days integer[], -- ISO day numbers: 1=Mon..7=Sun
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habits" ON habits
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habits_pillar ON habits(pillar_id);
CREATE INDEX idx_habits_active ON habits(user_id, is_active);

-- ============================================
-- HABIT COMPLETIONS
-- ============================================
CREATE TABLE habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_date date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habit completions" ON habit_completions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid())
  );

CREATE INDEX idx_completions_habit ON habit_completions(habit_id);
CREATE INDEX idx_completions_date ON habit_completions(habit_id, completed_date);

-- ============================================
-- JOURNAL ENTRIES
-- ============================================
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  content text,
  mood integer CHECK (mood >= 1 AND mood <= 5),
  pillar_ids uuid[],
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own journal" ON journal_entries
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, entry_date);

-- ============================================
-- USER SETTINGS
-- ============================================
CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_ai_access boolean NOT NULL DEFAULT true,
  journal_prompt_time time NOT NULL DEFAULT '21:00',
  has_completed_onboarding boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_type text NOT NULL CHECK (review_type IN ('weekly', 'monthly')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  note text,
  ai_summary text,
  pillar_breakdown jsonb, -- { pillar_id: { action_completion_pct, habit_streak_avg, ... } }
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own reviews" ON reviews
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_type ON reviews(user_id, review_type);

-- ============================================
-- REVIEW SNAPSHOTS (action values at review time)
-- ============================================
CREATE TABLE review_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  sealed_value numeric NOT NULL DEFAULT 0
);

ALTER TABLE review_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own snapshots" ON review_snapshots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_snapshots.review_id AND reviews.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_snapshots.review_id AND reviews.user_id = auth.uid())
  );

-- ============================================
-- AUTO-CREATE USER SETTINGS ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
