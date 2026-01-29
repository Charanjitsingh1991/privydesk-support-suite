-- Create widget_config table for organization widget settings
CREATE TABLE public.widget_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  primary_color TEXT NOT NULL DEFAULT '#6366f1',
  position TEXT NOT NULL DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left')),
  welcome_message TEXT NOT NULL DEFAULT 'Hi there! How can we help you today?',
  trigger_text TEXT NOT NULL DEFAULT 'Chat with us',
  offline_message TEXT NOT NULL DEFAULT 'We''re currently offline. Leave a message and we''ll get back to you soon!',
  business_hours JSONB NOT NULL DEFAULT '{"enabled": false, "timezone": "UTC", "hours": {}}'::jsonb,
  pre_chat_form_enabled BOOLEAN NOT NULL DEFAULT true,
  file_upload_enabled BOOLEAN NOT NULL DEFAULT true,
  emoji_picker_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_sound TEXT DEFAULT 'default',
  topics TEXT[] DEFAULT ARRAY['Sales Inquiry', 'Technical Support', 'Billing Question', 'General Question'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Create widget_visitors table to track visitors
CREATE TABLE public.widget_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, session_id)
);

-- Create widget_conversations table
CREATE TABLE public.widget_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES public.widget_visitors(id) ON DELETE CASCADE,
  assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved', 'closed')),
  topic TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create widget_messages table
CREATE TABLE public.widget_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.widget_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'agent', 'system')),
  sender_id UUID,
  content TEXT NOT NULL,
  attachments JSONB[] DEFAULT '{}'::jsonb[],
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agent_availability table
CREATE TABLE public.agent_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'offline')),
  max_concurrent_chats INTEGER NOT NULL DEFAULT 5,
  current_chats INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, organization_id)
);

-- Enable RLS on all tables
ALTER TABLE public.widget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_availability ENABLE ROW LEVEL SECURITY;

-- Widget config policies
CREATE POLICY "Organization admins can manage widget config"
ON public.widget_config FOR ALL
USING (organization_id = get_user_organization_id() AND get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (organization_id = get_user_organization_id() AND get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Anyone can read widget config by org id"
ON public.widget_config FOR SELECT
USING (true);

-- Widget visitors policies (public insert for visitors, org members can view)
CREATE POLICY "Anyone can create visitors"
ON public.widget_visitors FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own visitor record"
ON public.widget_visitors FOR UPDATE
USING (true);

CREATE POLICY "Org members can view visitors"
ON public.widget_visitors FOR SELECT
USING (organization_id = get_user_organization_id() OR true);

-- Widget conversations policies
CREATE POLICY "Anyone can create conversations"
ON public.widget_conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their conversations"
ON public.widget_conversations FOR SELECT
USING (true);

CREATE POLICY "Agents can update conversations"
ON public.widget_conversations FOR UPDATE
USING (organization_id = get_user_organization_id() AND get_user_role() IN ('admin', 'agent', 'super_admin'));

-- Widget messages policies
CREATE POLICY "Anyone can insert messages"
ON public.widget_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
ON public.widget_messages FOR SELECT
USING (true);

CREATE POLICY "Agents can update messages"
ON public.widget_messages FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM widget_conversations c 
  WHERE c.id = widget_messages.conversation_id 
  AND c.organization_id = get_user_organization_id()
));

-- Agent availability policies
CREATE POLICY "Agents can manage their own availability"
ON public.agent_availability FOR ALL
USING (agent_id = auth.uid())
WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Anyone can view agent availability"
ON public.agent_availability FOR SELECT
USING (true);

-- Enable realtime for widget messages and conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.widget_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.widget_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_availability;

-- Triggers for updated_at
CREATE TRIGGER update_widget_config_updated_at
BEFORE UPDATE ON public.widget_config
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_widget_visitors_updated_at
BEFORE UPDATE ON public.widget_visitors
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_widget_conversations_updated_at
BEFORE UPDATE ON public.widget_conversations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agent_availability_updated_at
BEFORE UPDATE ON public.agent_availability
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();