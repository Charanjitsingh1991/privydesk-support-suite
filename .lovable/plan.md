
# Comprehensive Testing Plan for PRIVYDESK Services

This plan creates a complete test suite covering all critical services: account creation, onboarding, OTP handling, domain verification, and authentication flows.

---

## Overview

The testing strategy uses three layers:
1. **Unit Tests** (Vitest) - Test individual functions, hooks, and components
2. **Integration Tests** (Vitest) - Test component interactions and API mocking
3. **E2E Tests** (Playwright) - Test complete user flows in the browser

---

## Test Categories

### 1. Authentication Service Tests

**Unit Tests** (`src/components/auth/__tests__/`)
- `SignupForm.test.tsx` - Form validation, password strength, submission
- `LoginForm.test.tsx` - Already exists, will extend with more cases
- `AuthContext.test.tsx` - Session management, state updates

**E2E Tests** (`tests/e2e/auth.spec.ts`)
- Complete signup flow with email confirmation
- Login with valid/invalid credentials
- Password visibility toggle
- Account lockout after failed attempts
- Session persistence across page reloads

### 2. OTP Service Tests

**Edge Function Tests** (`supabase/functions/send-otp/index.test.ts`)
- Successful OTP generation and email sending
- Rate limiting enforcement (3 per hour)
- Invalid email handling
- Type mapping (onboarding to verify_email)

**Edge Function Tests** (`supabase/functions/verify-otp/index.test.ts`)
- Successful OTP verification
- Expired OTP handling
- Invalid code rejection
- Rate limiting for verification attempts
- User creation on successful signup verification

**Component Tests** (`src/components/onboarding/__tests__/`)
- `EmailVerificationStep.test.tsx` - OTP input, resend countdown, auto-verify

### 3. Onboarding Flow Tests

**Unit Tests** (`src/hooks/__tests__/useOnboardingState.test.ts`)
- State persistence to localStorage
- Step navigation (next, prev, goToStep)
- Data updates and partial updates
- Clear state functionality

**Component Tests** (`src/components/onboarding/__tests__/`)
- `CompanyInfoStep.test.tsx` - Form validation, slug generation
- `EmailVerificationStep.test.tsx` - OTP flow integration
- `DomainVerificationStep.test.tsx` - DNS/file verification options
- `BrandingStep.test.tsx` - Color picker, logo upload
- `PlanSelectionStep.test.tsx` - Plan selection, billing cycle toggle
- `EmailConfigStep.test.tsx` - Provider selection, SMTP config

**E2E Tests** (`tests/e2e/onboarding.spec.ts`)
- Complete 6-step onboarding wizard
- Step persistence on page refresh
- Skip domain option
- Organization creation on completion

### 4. Domain Verification Tests

**Edge Function Tests** (`supabase/functions/verify-domain/index.test.ts`)
- DNS TXT record verification (mocked Google DNS API)
- File-based verification (mocked HTTP requests)
- Invalid domain handling
- Missing token handling
- Verification failure scenarios

**Component Tests**
- Token generation
- Copy to clipboard functionality
- Verification file download
- Status badge updates (checking, verified, failed)

### 5. Security & Rate Limiting Tests

**Unit Tests** (`src/lib/security/__tests__/`)
- `input-sanitizer.test.ts` - Already exists, extend coverage
- `rate-limiter.test.ts` - Client-side rate limiting logic

**Database Function Tests**
- `check_rate_limit` RPC function behavior
- `generate_otp` RPC function
- `verify_otp` RPC function

---

## New Test Files to Create

```text
src/
├── components/
│   ├── auth/__tests__/
│   │   ├── SignupForm.test.tsx          # NEW
│   │   └── AuthContext.test.tsx         # NEW
│   └── onboarding/__tests__/
│       ├── CompanyInfoStep.test.tsx     # NEW
│       ├── EmailVerificationStep.test.tsx # NEW
│       ├── DomainVerificationStep.test.tsx # NEW
│       ├── BrandingStep.test.tsx        # NEW
│       ├── PlanSelectionStep.test.tsx   # NEW
│       └── EmailConfigStep.test.tsx     # NEW
├── hooks/__tests__/
│   └── useOnboardingState.test.ts       # NEW
supabase/functions/
├── send-otp/
│   └── index.test.ts                    # NEW
├── verify-otp/
│   └── index.test.ts                    # NEW
└── verify-domain/
    └── index.test.ts                    # NEW
tests/e2e/
└── onboarding.spec.ts                   # NEW
```

---

## Technical Details

### Unit Test Structure Example

```typescript
// src/components/auth/__tests__/SignupForm.test.tsx
describe('SignupForm', () => {
  describe('rendering', () => {
    it('renders all required fields')
    it('shows password strength meter')
  })
  
  describe('validation', () => {
    it('validates email format')
    it('enforces password requirements')
    it('prevents weak passwords')
  })
  
  describe('submission', () => {
    it('calls signUp with correct data')
    it('navigates to dashboard on success')
    it('shows error toast on failure')
  })
})
```

### Edge Function Test Structure

```typescript
// supabase/functions/send-otp/index.test.ts
import "https://deno.land/std@0.224.0/dotenv/load.ts";

Deno.test("send-otp - sends OTP successfully", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', type: 'login' })
  });
  await response.text(); // Consume body
  assertEquals(response.status, 200);
});

Deno.test("send-otp - maps onboarding to verify_email", async () => {
  // Test type mapping
});

Deno.test("send-otp - enforces rate limiting", async () => {
  // Send 4 requests, verify 4th is blocked
});
```

### E2E Onboarding Test Structure

```typescript
// tests/e2e/onboarding.spec.ts
test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage, setup authenticated user without org
  });

  test('completes step 1 - company info', async ({ page }) => {
    await page.goto('/onboarding');
    await page.fill('[name="organizationName"]', 'Test Company');
    await expect(page.locator('[name="slug"]')).toHaveValue('test-company');
    await page.click('button:has-text("Next")');
    await expect(page).toHaveURL(/step=2/);
  });

  test('persists state on refresh', async ({ page }) => {
    // Fill step 1, refresh, verify data persists
  });

  test('sends OTP on step 2', async ({ page }) => {
    // Mock edge function, verify OTP sent
  });
});
```

---

## Mocking Strategy

### Supabase Client Mocking

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
      insert: vi.fn(),
      update: vi.fn(),
    })),
  },
}));
```

### Edge Function Mocking in E2E

```typescript
// Mock edge functions in Playwright
await page.route('**/functions/v1/send-otp', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true }),
  });
});
```

---

## Coverage Goals

| Service | Unit | Integration | E2E |
|---------|------|-------------|-----|
| Signup | 90% | 80% | 100% |
| Login | 90% | 80% | 100% |
| Send OTP | 95% | 90% | 100% |
| Verify OTP | 95% | 90% | 100% |
| Onboarding Steps | 85% | 75% | 100% |
| Domain Verification | 90% | 85% | 80% |

---

## Implementation Order

1. **Phase 1**: Hook and utility tests (useOnboardingState, rate limiters)
2. **Phase 2**: Component unit tests (SignupForm, onboarding steps)
3. **Phase 3**: Edge function tests (send-otp, verify-otp, verify-domain)
4. **Phase 4**: E2E onboarding flow tests
5. **Phase 5**: Integration and coverage gap filling

---

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Edge function tests (Deno)
deno test --allow-net --allow-env supabase/functions/
```
