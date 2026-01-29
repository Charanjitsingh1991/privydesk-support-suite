-- OTP verification codes table
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('login', 'signup', 'verify_email', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limiting table
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email or IP
  action TEXT NOT NULL, -- 'login_attempt', 'otp_request', 'magic_link_request'
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT now(),
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  UNIQUE(identifier, action)
);

-- Indexes for performance
CREATE INDEX idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX idx_otp_codes_code ON public.otp_codes(code);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);
CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier, action);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies - Only service role can access these tables (edge functions)
-- No public access for security

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
  DELETE FROM public.rate_limits WHERE blocked_until < now() AND blocked_until IS NOT NULL;
END;
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER,
  p_window_minutes INTEGER
)
RETURNS TABLE(allowed BOOLEAN, attempts_remaining INTEGER, blocked_until TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get or create rate limit record
  SELECT * INTO v_record FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF v_record IS NULL THEN
    -- First attempt
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (p_identifier, p_action, 1);
    RETURN QUERY SELECT true, p_max_attempts - 1, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > now() THEN
    RETURN QUERY SELECT false, 0, v_record.blocked_until;
    RETURN;
  END IF;
  
  -- Check if window has expired (reset counter)
  IF v_record.first_attempt_at < v_window_start THEN
    UPDATE public.rate_limits
    SET attempts = 1, first_attempt_at = now(), last_attempt_at = now(), blocked_until = NULL
    WHERE id = v_record.id;
    RETURN QUERY SELECT true, p_max_attempts - 1, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Increment attempts
  IF v_record.attempts >= p_max_attempts THEN
    -- Block the identifier
    UPDATE public.rate_limits
    SET blocked_until = now() + (p_window_minutes || ' minutes')::INTERVAL, last_attempt_at = now()
    WHERE id = v_record.id;
    RETURN QUERY SELECT false, 0, (now() + (p_window_minutes || ' minutes')::INTERVAL);
    RETURN;
  END IF;
  
  -- Increment counter
  UPDATE public.rate_limits
  SET attempts = attempts + 1, last_attempt_at = now()
  WHERE id = v_record.id;
  
  RETURN QUERY SELECT true, p_max_attempts - v_record.attempts - 1, NULL::TIMESTAMPTZ;
END;
$$;

-- Function to generate and store OTP
CREATE OR REPLACE FUNCTION public.generate_otp(
  p_email TEXT,
  p_type TEXT,
  p_expires_minutes INTEGER DEFAULT 10
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Generate 6-digit code
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Invalidate any existing unused OTPs for this email and type
  UPDATE public.otp_codes
  SET used_at = now()
  WHERE email = p_email AND type = p_type AND used_at IS NULL;
  
  -- Insert new OTP
  INSERT INTO public.otp_codes (email, code, type, expires_at)
  VALUES (p_email, v_code, p_type, now() + (p_expires_minutes || ' minutes')::INTERVAL);
  
  RETURN v_code;
END;
$$;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(
  p_email TEXT,
  p_code TEXT,
  p_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp otp_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_otp FROM public.otp_codes
  WHERE email = p_email AND code = p_code AND type = p_type
  AND used_at IS NULL AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_otp IS NULL THEN
    RETURN false;
  END IF;
  
  -- Mark OTP as used
  UPDATE public.otp_codes SET used_at = now() WHERE id = v_otp.id;
  
  RETURN true;
END;
$$;