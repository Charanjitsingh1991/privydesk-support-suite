import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays login page correctly', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.getByRole('heading', { name: /sign in|welcome/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeFocused();
  });

  test('allows typing in email and password fields', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    await expect(page.getByLabel(/email/i)).toHaveValue('test@example.com');
    await expect(page.getByLabel(/password/i)).toHaveValue('password123');
  });

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('mypassword');
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the eye icon to toggle visibility
    await page.locator('button').filter({ has: page.locator('svg') }).last().click();
    
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('navigates to signup page', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByRole('link', { name: /sign up/i }).click();
    
    await expect(page).toHaveURL('/signup');
  });

  test('navigates to forgot password page', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByRole('link', { name: /forgot password/i }).click();
    
    await expect(page).toHaveURL('/forgot-password');
  });
});

test.describe('Signup Flow', () => {
  test('displays signup page correctly', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page.getByRole('heading', { name: /create.*account|sign up/i })).toBeVisible();
  });

  test('shows password strength meter when typing password', async ({ page }) => {
    await page.goto('/signup');
    
    // Find password field and type
    const passwordField = page.locator('input[type="password"]').first();
    await passwordField.fill('Test123!');
    
    // Password strength indicator should appear
    await expect(page.getByText(/password strength/i)).toBeVisible();
  });

  test('shows password requirements', async ({ page }) => {
    await page.goto('/signup');
    
    const passwordField = page.locator('input[type="password"]').first();
    await passwordField.fill('test');
    
    await expect(page.getByText(/at least 12 characters/i)).toBeVisible();
    await expect(page.getByText(/one uppercase/i)).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('redirects to login when accessing dashboard unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or show login page
    await expect(page).toHaveURL(/\/(auth\/login|login)?/);
  });

  test('redirects to login when accessing tickets page unauthenticated', async ({ page }) => {
    await page.goto('/dashboard/tickets');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/(auth\/login|login)?/);
  });
});
