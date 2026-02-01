# PRIVYDESK Authentication System

## Overview

PRIVYDESK uses **passwordless authentication** for maximum security and user convenience. Users can sign in or sign up using either:
- **Magic Links** - One-click email authentication
- **OTP Codes** - 6-digit verification codes

## Why Passwordless?

### Security Benefits
- ✅ **No Password Breaches** - Passwords can't be stolen if they don't exist
- ✅ **No Phishing** - Magic links and OTP codes expire quickly and are single-use
- ✅ **No Weak Passwords** - Eliminates "password123" and similar vulnerabilities
- ✅ **No Password Reuse** - Users can't reuse passwords across services
- ✅ **Reduced Attack Surface** - No password hashing, storage, or reset flows to exploit

### User Experience Benefits
- 🚀 **Faster Onboarding** - No password creation or validation
- 🎯 **Simpler Login** - Just enter email and click link or enter code
- 📱 **Mobile Friendly** - No typing complex passwords on mobile devices
- 🔄 **No Password Resets** - Users never forget their "password"

## Authentication Flow

### Sign Up Flow
```
1. User visits /signup or /auth/signup
2. User enters email address
3. User chooses authentication method:
   - Magic Link: Receives email with one-click link
   - OTP: Receives email with 6-digit code
4. User clicks link or enters code
5. Account created and user authenticated
6. Redirected to onboarding flow
```

### Sign In Flow
```
1. User visits /login or /auth/login
2. User enters email address
3. User chooses authentication method:
   - Magic Link: Receives email with one-click link
   - OTP: Receives email with 6-digit code
4. User clicks link or enters code
5. User authenticated
6. Redirected to dashboard
```

### Magic Link Flow
```
1. User requests magic link
2. Backend generates secure token (JWT)
3. Email sent with link: https://app.privydesk.com/auth/callback?token=xxx
4. User clicks link
5. Token validated on callback page
6. Session created
7. User redirected to appropriate page
```

### OTP Flow
```
1. User requests OTP code
2. Backend generates 6-digit code
3. Code stored in database with expiration (10 minutes)
4. Email sent with code
5. User enters code on verification page
6. Code validated against database
7. Session created
8. User redirected to appropriate page
```

## Routes

### Public Routes
- `/` - Homepage
- `/auth/login` - Login page (passwordless)
- `/login` - Redirects to `/auth/login`
- `/auth/signup` - Signup page (passwordless)
- `/signup` - Redirects to `/auth/signup`
- `/auth/verify-otp` - OTP verification page
- `/auth/magic-link-sent` - Confirmation page after magic link sent
- `/auth/callback` - Magic link callback handler

### Protected Routes
All routes under `/dashboard/*` require authentication.

## Implementation Details

### Frontend Components

#### Login Page (`src/pages/auth/Login.tsx`)
- Email input field
- Auth method toggle (Magic Link / OTP)
- Submit button
- Link to signup page
- Dark theme styling

#### Signup Page (`src/pages/auth/Signup.tsx`)
- Email input field
- Auth method toggle (Magic Link / OTP)
- Submit button
- Link to login page
- Dark theme styling
- Additional signup-specific messaging

#### OTP Verification (`src/pages/auth/VerifyOTP.tsx`)
- 6-digit code input
- Resend code button
- Countdown timer
- Error handling

#### Magic Link Sent (`src/pages/auth/MagicLinkSent.tsx`)
- Confirmation message
- Email address display
- Resend link option
- Instructions

### Backend Edge Functions

#### `send-magic-link` Function
```typescript
// Location: supabase/functions/send-magic-link/index.ts
// Purpose: Generate and send magic link email
// Input: { email: string, redirectTo: string }
// Output: { success: boolean }
```

#### `send-otp` Function
```typescript
// Location: supabase/functions/send-otp/index.ts
// Purpose: Generate and send OTP code email
// Input: { email: string, type: 'login' | 'signup' }
// Output: { success: boolean }
```

### Database Schema

#### `auth.users` Table (Supabase Auth)
- `id` - UUID (primary key)
- `email` - User email
- `created_at` - Account creation timestamp
- `last_sign_in_at` - Last login timestamp

#### `profiles` Table
- `id` - UUID (foreign key to auth.users)
- `email` - User email
- `full_name` - User's full name
- `role` - User role (super_admin, admin, agent, client)
- `organization_id` - Foreign key to organizations
- `created_at` - Profile creation timestamp

## Security Considerations

### Rate Limiting
- Maximum 5 authentication attempts per email per 15 minutes
- Maximum 3 OTP requests per email per hour
- Exponential backoff on failed attempts

### Token Security
- Magic link tokens expire after 1 hour
- OTP codes expire after 10 minutes
- Tokens are single-use only
- Secure random generation (cryptographically secure)

### Email Security
- SPF, DKIM, and DMARC configured
- Sender verification required
- Email templates sanitized
- No sensitive data in email content

### Session Management
- JWT tokens with 7-day expiration
- Refresh tokens for extended sessions
- Secure HTTP-only cookies
- CSRF protection enabled

## Configuration

### Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email Configuration (Supabase handles this)
# Configure in Supabase Dashboard > Authentication > Email Templates
```

### Email Templates

Customize email templates in Supabase Dashboard:
1. Go to Authentication > Email Templates
2. Edit "Magic Link" template
3. Edit "Confirm Signup" template (for OTP)
4. Use variables: `{{ .ConfirmationURL }}`, `{{ .Token }}`

## Testing

### Manual Testing
1. Visit `/signup`
2. Enter test email
3. Choose Magic Link or OTP
4. Check email inbox
5. Click link or enter code
6. Verify successful authentication

### Automated Testing
```bash
# Run E2E tests
npm run test:e2e

# Run specific auth tests
npm run test:e2e -- tests/e2e/auth.spec.ts
```

## Troubleshooting

### Magic Link Not Received
1. Check spam/junk folder
2. Verify email configuration in Supabase
3. Check rate limiting hasn't been triggered
4. Verify SMTP settings

### OTP Code Not Working
1. Ensure code entered within 10 minutes
2. Check for typos (codes are case-sensitive)
3. Request new code if expired
4. Verify database connectivity

### Session Not Persisting
1. Check browser cookies enabled
2. Verify HTTPS in production
3. Check session expiration settings
4. Clear browser cache and retry

## Migration from Password-Based Auth

If migrating from password-based authentication:

1. **User Communication**
   - Notify users of the change
   - Explain benefits of passwordless auth
   - Provide migration timeline

2. **Data Migration**
   - No password data to migrate
   - Keep user emails and profiles
   - Update authentication flows

3. **Gradual Rollout**
   - Enable passwordless alongside passwords
   - Encourage users to try passwordless
   - Eventually deprecate password auth

## Best Practices

### For Developers
- Always use HTTPS in production
- Implement proper error handling
- Log authentication attempts (without sensitive data)
- Monitor for suspicious activity
- Keep dependencies updated

### For Users
- Use a secure email provider
- Don't share magic links
- Report suspicious emails
- Use unique email per service
- Enable 2FA on email account

## Support

For authentication issues:
1. Check this documentation
2. Review Supabase logs
3. Contact support@privydesk.com
4. File issue on GitHub

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Magic Link Best Practices](https://supabase.com/docs/guides/auth/auth-magic-link)
- [OTP Authentication](https://supabase.com/docs/guides/auth/auth-email-otp)
- [Security Best Practices](https://supabase.com/docs/guides/auth/auth-security)

---

**Last Updated:** January 30, 2026  
**Version:** 2.0.0  
**Status:** Production Ready ✅
