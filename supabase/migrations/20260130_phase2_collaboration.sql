-- Phase 2: Team Collaboration Features
-- Add collaboration features to tickets

-- Ticket followers (watchers)
CREATE TABLE IF NOT EXISTS ticket_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  notify_on_update BOOLEAN DEFAULT true,
  notify_on_comment BOOLEAN DEFAULT true,
  notify_on_status_change BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(ticket_id, user_id)
);

-- Ticket mentions
CREATE TABLE IF NOT EXISTS ticket_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket relationships (parent-child, linked)
CREATE TABLE IF NOT EXISTS ticket_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  child_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'parent_child', 'related', 'duplicate', 'blocks'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Unique constraint
  UNIQUE(parent_ticket_id, child_ticket_id, relationship_type)
);

-- Ticket edit locks (collision detection)
CREATE TABLE IF NOT EXISTS ticket_edit_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Lock details
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes',
  
  -- Unique constraint: one lock per ticket
  UNIQUE(ticket_id)
);

-- Indexes
CREATE INDEX idx_ticket_followers_ticket_id ON ticket_followers(ticket_id);
CREATE INDEX idx_ticket_followers_user_id ON ticket_followers(user_id);
CREATE INDEX idx_ticket_mentions_ticket_id ON ticket_mentions(ticket_id);
CREATE INDEX idx_ticket_mentions_mentioned_user_id ON ticket_mentions(mentioned_user_id);
CREATE INDEX idx_ticket_mentions_is_read ON ticket_mentions(is_read);
CREATE INDEX idx_ticket_relationships_parent_ticket_id ON ticket_relationships(parent_ticket_id);
CREATE INDEX idx_ticket_relationships_child_ticket_id ON ticket_relationships(child_ticket_id);
CREATE INDEX idx_ticket_edit_locks_ticket_id ON ticket_edit_locks(ticket_id);
CREATE INDEX idx_ticket_edit_locks_expires_at ON ticket_edit_locks(expires_at);

-- RLS Policies
ALTER TABLE ticket_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_edit_locks ENABLE ROW LEVEL SECURITY;

-- Ticket followers policies
CREATE POLICY "Users can view followers of tickets they can access"
  ON ticket_followers
  FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can follow tickets"
  ON ticket_followers
  FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can unfollow tickets"
  ON ticket_followers
  FOR DELETE
  USING (user_id = auth.uid());

-- Ticket mentions policies
CREATE POLICY "Users can view their mentions"
  ON ticket_mentions
  FOR SELECT
  USING (mentioned_user_id = auth.uid());

CREATE POLICY "Users can create mentions"
  ON ticket_mentions
  FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their mentions"
  ON ticket_mentions
  FOR UPDATE
  USING (mentioned_user_id = auth.uid());

-- Ticket relationships policies
CREATE POLICY "Users can view ticket relationships"
  ON ticket_relationships
  FOR SELECT
  USING (
    parent_ticket_id IN (
      SELECT id FROM tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Agents can create ticket relationships"
  ON ticket_relationships
  FOR INSERT
  WITH CHECK (
    parent_ticket_id IN (
      SELECT id FROM tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
      )
    )
  );

CREATE POLICY "Agents can delete ticket relationships"
  ON ticket_relationships
  FOR DELETE
  USING (
    parent_ticket_id IN (
      SELECT id FROM tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
      )
    )
  );

-- Ticket edit locks policies
CREATE POLICY "Users can view edit locks"
  ON ticket_edit_locks
  FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create edit locks"
  ON ticket_edit_locks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own locks"
  ON ticket_edit_locks
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to acquire edit lock
CREATE OR REPLACE FUNCTION acquire_ticket_edit_lock(p_ticket_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_lock RECORD;
BEGIN
  -- Check for existing lock
  SELECT * INTO v_existing_lock
  FROM ticket_edit_locks
  WHERE ticket_id = p_ticket_id
    AND expires_at > NOW();
  
  -- If lock exists and belongs to someone else, return false
  IF v_existing_lock.id IS NOT NULL AND v_existing_lock.user_id != p_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Delete expired locks
  DELETE FROM ticket_edit_locks
  WHERE ticket_id = p_ticket_id
    AND expires_at <= NOW();
  
  -- Create or update lock
  INSERT INTO ticket_edit_locks (ticket_id, user_id, locked_at, expires_at)
  VALUES (p_ticket_id, p_user_id, NOW(), NOW() + INTERVAL '5 minutes')
  ON CONFLICT (ticket_id)
  DO UPDATE SET
    user_id = p_user_id,
    locked_at = NOW(),
    expires_at = NOW() + INTERVAL '5 minutes';
  
  RETURN TRUE;
END;
$$;

-- Function to release edit lock
CREATE OR REPLACE FUNCTION release_ticket_edit_lock(p_ticket_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ticket_edit_locks
  WHERE ticket_id = p_ticket_id
    AND user_id = p_user_id;
END;
$$;

-- Comment
COMMENT ON TABLE ticket_followers IS 'Users following tickets for notifications';
COMMENT ON TABLE ticket_mentions IS 'User mentions in ticket comments';
COMMENT ON TABLE ticket_relationships IS 'Relationships between tickets (parent-child, related, etc.)';
COMMENT ON TABLE ticket_edit_locks IS 'Edit locks to prevent simultaneous editing (collision detection)';
COMMENT ON FUNCTION acquire_ticket_edit_lock IS 'Acquires an edit lock for a ticket';
COMMENT ON FUNCTION release_ticket_edit_lock IS 'Releases an edit lock for a ticket';
