-- Platform Support Chat System for Super Admin
-- Allows organization admins to chat with super admins for platform support

-- Platform Support Chats Table
CREATE TABLE IF NOT EXISTS public.platform_support_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Platform Support Messages Table
CREATE TABLE IF NOT EXISTS public.platform_support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.platform_support_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_chats_user ON public.platform_support_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_chats_org ON public.platform_support_chats(organization_id);
CREATE INDEX IF NOT EXISTS idx_platform_chats_admin ON public.platform_support_chats(admin_id);
CREATE INDEX IF NOT EXISTS idx_platform_chats_status ON public.platform_support_chats(status);
CREATE INDEX IF NOT EXISTS idx_platform_chats_created ON public.platform_support_chats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_messages_chat ON public.platform_support_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_platform_messages_created ON public.platform_support_messages(created_at);

-- RLS Policies
ALTER TABLE public.platform_support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own chats
CREATE POLICY "Users can view own platform support chats"
  ON public.platform_support_chats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own chats
CREATE POLICY "Users can create platform support chats"
  ON public.platform_support_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Super admins can view all chats
CREATE POLICY "Super admins can view all platform support chats"
  ON public.platform_support_chats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Super admins can update chats (assign, change status, etc.)
CREATE POLICY "Super admins can update platform support chats"
  ON public.platform_support_chats
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Users can view messages in their chats
CREATE POLICY "Users can view messages in own chats"
  ON public.platform_support_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_support_chats
      WHERE platform_support_chats.id = chat_id
      AND platform_support_chats.user_id = auth.uid()
    )
  );

-- Super admins can view all messages
CREATE POLICY "Super admins can view all platform support messages"
  ON public.platform_support_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Users can send messages in their chats
CREATE POLICY "Users can send messages in own chats"
  ON public.platform_support_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.platform_support_chats
      WHERE platform_support_chats.id = chat_id
      AND platform_support_chats.user_id = auth.uid()
    )
  );

-- Super admins can send messages in any chat
CREATE POLICY "Super admins can send messages in any chat"
  ON public.platform_support_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_chat_updated_at
  BEFORE UPDATE ON public.platform_support_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_chat_updated_at();

-- Function to update chat updated_at when new message is added
CREATE OR REPLACE FUNCTION update_chat_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.platform_support_chats
  SET updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_timestamp_on_message
  AFTER INSERT ON public.platform_support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_on_new_message();
