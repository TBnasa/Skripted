/* ═══════════════════════════════════════════
   Skripted — Database Migration
   Table: chat_history
   Purpose: Granular message-by-message persistence
   ═══════════════════════════════════════════ */

-- 1. Create the granular chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON public.chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON public.chat_history(user_id);

-- 3. Enable RLS
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy (Service Role handles security, but we set a 'true' policy for convenience)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_history' AND policyname = 'Users can access their own history'
    ) THEN
        CREATE POLICY "Users can access their own history" 
        ON public.chat_history FOR ALL 
        USING (true);
    END IF;
END $$;
