-- Phase 2: AI Tables Migration

-- ============================================
-- AI THREADS
-- ============================================
CREATE TABLE ai_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  context_type text CHECK (context_type IN ('general', 'goal', 'review', 'template')),
  context_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own ai_threads" ON ai_threads
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_threads_user ON ai_threads(user_id);

-- ============================================
-- AI MESSAGES
-- ============================================
CREATE TABLE ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES ai_threads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  proposals jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own ai_messages" ON ai_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM ai_threads WHERE ai_threads.id = ai_messages.thread_id AND ai_threads.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM ai_threads WHERE ai_threads.id = ai_messages.thread_id AND ai_threads.user_id = auth.uid())
  );

CREATE INDEX idx_ai_messages_thread ON ai_messages(thread_id);
CREATE INDEX idx_ai_messages_thread_created ON ai_messages(thread_id, created_at);
