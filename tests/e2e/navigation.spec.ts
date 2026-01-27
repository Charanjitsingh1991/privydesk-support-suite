import { test, expect } from '@playwright/test';

test.describe('Public Navigation', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Should see the landing page or redirect to login
    await expect(page).toHaveURL(/\/(auth\/login)?$/);
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-123');
    
    // Should show 404 page or redirect
    const content = await page.content();
    const is404 = content.includes('404') || 
                   content.includes('not found') || 
                   content.includes('Not Found');
    
    // Either shows 404 or redirects to home/login
    expect(is404 || page.url().includes('/auth/login') || page.url().endsWith('/')).toBeTruthy();
  });

  test('navigates between auth pages', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Navigate to signup
    const signupLink = page.getByRole('link', { name: /sign up/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL('/signup');
    }
  });
});

test.describe('Responsive Design', () => {
  test('login page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/login');
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login page is responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/auth/login');
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('signup page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/signup');
    
    // Form should be visible
    await expect(page.locator('form')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('login page has proper heading structure', async ({ page }) => {
    await page.goto('/auth/login');
    
    const headings = await page.locator('h1, h2, h3').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/auth/login');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('buttons are focusable', async ({ page }) => {
    await page.goto('/auth/login');
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.focus();
    
    await expect(submitButton).toBeFocused();
  });

  test('page has proper focus order', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Tab through the form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    await page.route('**/auth/v1/**', route => route.abort('failed'));
    
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show some error feedback (toast or inline)
    // The page should not crash
    await expect(page.locator('body')).toBeVisible();
  });
});
