-- Phase 4: Customer Satisfaction Surveys
-- Create survey tables for CSAT, NPS, CES

CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Survey details
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'csat', 'nps', 'ces', 'custom'
  description TEXT,
  
  -- Questions
  questions JSONB NOT NULL, -- Array of question objects
  
  -- Trigger settings
  trigger_type TEXT DEFAULT 'ticket_closed', -- 'ticket_closed', 'manual', 'scheduled'
  trigger_delay_hours INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Response data
  responses JSONB NOT NULL, -- Array of answers
  score INTEGER, -- Overall score (for CSAT/NPS/CES)
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_surveys_organization_id ON surveys(organization_id);
CREATE INDEX idx_surveys_type ON surveys(type);
CREATE INDEX idx_surveys_is_active ON surveys(is_active);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_ticket_id ON survey_responses(ticket_id);
CREATE INDEX idx_survey_responses_score ON survey_responses(score);
CREATE INDEX idx_survey_responses_submitted_at ON survey_responses(submitted_at DESC);

-- RLS Policies
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Survey policies
CREATE POLICY "Users can view surveys"
  ON surveys
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage surveys"
  ON surveys
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Survey response policies
CREATE POLICY "Users can view survey responses"
  ON survey_responses
  FOR SELECT
  USING (
    survey_id IN (
      SELECT id FROM surveys WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can submit survey responses"
  ON survey_responses
  FOR INSERT
  WITH CHECK (true);

-- Function to calculate NPS score
CREATE OR REPLACE FUNCTION calculate_nps_score(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promoters INTEGER;
  v_detractors INTEGER;
  v_total INTEGER;
  v_nps INTEGER;
BEGIN
  -- Count promoters (score 9-10)
  SELECT COUNT(*) INTO v_promoters
  FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id
  WHERE s.organization_id = p_organization_id
    AND s.type = 'nps'
    AND sr.score >= 9
    AND sr.submitted_at::DATE BETWEEN p_start_date AND p_end_date;
  
  -- Count detractors (score 0-6)
  SELECT COUNT(*) INTO v_detractors
  FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id
  WHERE s.organization_id = p_organization_id
    AND s.type = 'nps'
    AND sr.score <= 6
    AND sr.submitted_at::DATE BETWEEN p_start_date AND p_end_date;
  
  -- Count total
  SELECT COUNT(*) INTO v_total
  FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id
  WHERE s.organization_id = p_organization_id
    AND s.type = 'nps'
    AND sr.submitted_at::DATE BETWEEN p_start_date AND p_end_date;
  
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate NPS: (promoters - detractors) / total * 100
  v_nps := ROUND(((v_promoters::DECIMAL - v_detractors::DECIMAL) / v_total::DECIMAL) * 100);
  
  RETURN v_nps;
END;
$$;

-- Function to calculate average CSAT score
CREATE OR REPLACE FUNCTION calculate_csat_score(p_organization_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_score DECIMAL;
BEGIN
  SELECT AVG(sr.score) INTO v_avg_score
  FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id
  WHERE s.organization_id = p_organization_id
    AND s.type = 'csat'
    AND sr.submitted_at::DATE BETWEEN p_start_date AND p_end_date;
  
  RETURN COALESCE(v_avg_score, 0);
END;
$$;

-- Comment
COMMENT ON TABLE surveys IS 'Customer satisfaction surveys (CSAT, NPS, CES)';
COMMENT ON TABLE survey_responses IS 'Survey responses from customers';
COMMENT ON FUNCTION calculate_nps_score IS 'Calculates NPS score for a date range';
COMMENT ON FUNCTION calculate_csat_score IS 'Calculates average CSAT score for a date range';
