import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('Step 1 - Company Info', () => {
    test('renders company info form', async ({ page }) => {
      await page.goto('/onboarding');
      
      await expect(page.getByText('Tell us about your company')).toBeVisible();
      await expect(page.getByPlaceholder('Acme Corporation')).toBeVisible();
      await expect(page.getByPlaceholder('acme')).toBeVisible();
    });

    test('auto-generates slug from organization name', async ({ page }) => {
      await page.goto('/onboarding');
      
      await page.getByPlaceholder('Acme Corporation').fill('My Test Company');
      
      // Wait for debounced slug generation
      await page.waitForTimeout(600);
      
      const slugInput = page.getByPlaceholder('acme');
      await expect(slugInput).toHaveValue('my-test-company');
    });

    test('shows validation errors for invalid input', async ({ page }) => {
      await page.goto('/onboarding');
      
      await page.getByPlaceholder('Acme Corporation').fill('AB');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      await expect(page.getByText('at least 3 characters')).toBeVisible();
    });
  });

  test.describe('Step Persistence', () => {
    test('persists data on page refresh', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Fill in company info
      await page.getByPlaceholder('Acme Corporation').fill('Persistent Company');
      await page.waitForTimeout(600);
      
      // Refresh the page
      await page.reload();
      
      // Data should be preserved
      await expect(page.getByDisplayValue('Persistent Company')).toBeVisible();
    });

    test('persists step on page refresh', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Fill step 1 and advance
      await page.getByPlaceholder('Acme Corporation').fill('Test Company');
      await page.getByPlaceholder('acme').fill('test-company');
      
      // Select industry
      await page.getByRole('combobox', { name: /industry/i }).click();
      await page.getByRole('option', { name: 'Technology' }).click();
      
      // Select company size
      await page.getByRole('combobox', { name: /company size/i }).click();
      await page.getByRole('option', { name: /1-10/i }).click();
      
      // Select timezone
      await page.getByRole('combobox', { name: /timezone/i }).click();
      await page.getByRole('option', { name: 'UTC' }).click();
      
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Should be on step 2
      await expect(page.getByText('Verify your email')).toBeVisible();
      
      // Refresh
      await page.reload();
      
      // Should still be on step 2
      await expect(page.getByText('Verify your email')).toBeVisible();
    });
  });

  test.describe('Step 2 - Email Verification', () => {
    test('shows email input form', async ({ page }) => {
      // Set up initial state to be on step 2
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
          },
          currentStep: 2,
        }));
      });
      await page.reload();
      
      await expect(page.getByText('Verify your email')).toBeVisible();
      await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
    });

    test('shows OTP input after email submission', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
          },
          currentStep: 2,
        }));
      });
      await page.reload();
      
      // Mock the send-otp function
      await page.route('**/functions/v1/send-otp', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
      
      await page.getByPlaceholder('you@company.com').fill('test@example.com');
      await page.getByRole('button', { name: 'Send Code' }).click();
      
      // Should show OTP input
      await expect(page.getByText('Enter verification code')).toBeVisible();
    });
  });

  test.describe('Step 3 - Domain Verification', () => {
    test('shows domain input with skip option', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
          },
          currentStep: 3,
        }));
      });
      await page.reload();
      
      await expect(page.getByText('Set up your custom domain')).toBeVisible();
      await expect(page.getByRole('button', { name: /skip for now/i })).toBeVisible();
    });

    test('shows DNS and file verification tabs when domain is entered', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
          },
          currentStep: 3,
        }));
      });
      await page.reload();
      
      await page.getByPlaceholder('support.yourcompany.com').fill('support.test.com');
      
      await expect(page.getByRole('tab', { name: /dns record/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /file upload/i })).toBeVisible();
    });
  });

  test.describe('Step 4 - Branding', () => {
    test('shows branding customization options', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
            skipDomain: true,
          },
          currentStep: 4,
        }));
      });
      await page.reload();
      
      await expect(page.getByText('Customize your brand')).toBeVisible();
      await expect(page.getByText('Company Logo')).toBeVisible();
      await expect(page.getByText('Primary Color')).toBeVisible();
    });

    test('shows color presets', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
            skipDomain: true,
          },
          currentStep: 4,
        }));
      });
      await page.reload();
      
      // Color preset buttons should be visible
      const colorButtons = page.locator('button[style*="background-color"]');
      await expect(colorButtons.first()).toBeVisible();
    });
  });

  test.describe('Step 5 - Plan Selection', () => {
    test('shows all plans', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
            skipDomain: true,
            primaryColor: '#6366f1',
          },
          currentStep: 5,
        }));
      });
      await page.reload();
      
      await expect(page.getByText('Choose your plan')).toBeVisible();
      await expect(page.getByText('Free')).toBeVisible();
      await expect(page.getByText('Starter')).toBeVisible();
      await expect(page.getByText('Pro')).toBeVisible();
      await expect(page.getByText('Enterprise')).toBeVisible();
    });

    test('shows billing toggle', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
            skipDomain: true,
            primaryColor: '#6366f1',
          },
          currentStep: 5,
        }));
      });
      await page.reload();
      
      await expect(page.getByText('Monthly')).toBeVisible();
      await expect(page.getByText('Annual')).toBeVisible();
    });
  });

  test.describe('Step 6 - Email Configuration', () => {
    test('shows email config for paid plans', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
            skipDomain: true,
            primaryColor: '#6366f1',
            selectedPlan: 'pro',
            billingCycle: 'monthly',
          },
          currentStep: 6,
        }));
      });
      await page.reload();
      
      await expect(page.getByText('Email Configuration')).toBeVisible();
      await expect(page.getByText('Use PRIVYDESK Email Service')).toBeVisible();
      await expect(page.getByText('Use Resend API')).toBeVisible();
      await expect(page.getByText('Custom SMTP Server')).toBeVisible();
    });

    test('shows complete setup button', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
            skipDomain: true,
            primaryColor: '#6366f1',
            selectedPlan: 'free',
            billingCycle: 'monthly',
          },
          currentStep: 6,
        }));
      });
      await page.reload();
      
      await expect(page.getByRole('button', { name: /complete setup/i })).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('can navigate back through steps', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
            email: 'test@example.com',
            emailVerified: true,
            skipDomain: true,
            primaryColor: '#6366f1',
            selectedPlan: 'free',
            billingCycle: 'monthly',
          },
          currentStep: 5,
        }));
      });
      await page.reload();
      
      // On step 5
      await expect(page.getByText('Choose your plan')).toBeVisible();
      
      // Go back
      await page.getByRole('button', { name: /back/i }).click();
      
      // Should be on step 4
      await expect(page.getByText('Customize your brand')).toBeVisible();
    });

    test('step indicator shows current step', async ({ page }) => {
      await page.goto('/onboarding');
      await page.evaluate(() => {
        localStorage.setItem('privydesk_onboarding_data', JSON.stringify({
          data: {
            organizationName: 'Test',
            slug: 'test',
            industry: 'Technology',
            companySize: '1-10',
            timezone: 'UTC',
          },
          currentStep: 3,
        }));
      });
      await page.reload();
      
      // Step indicator should be visible and show step 3 as active
      await expect(page.getByText('Domain')).toBeVisible();
    });
  });
});
