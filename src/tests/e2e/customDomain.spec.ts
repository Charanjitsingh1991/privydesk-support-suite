import { test, expect } from '@playwright/test';

test.describe('Custom Domain Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'admin@acme.com');
    await page.click('button[type="submit"]');
    
    // Wait for magic link and login
    // (In real tests, you'd mock the email service)
    await page.waitForURL('/dashboard');
  });

  test('should complete full custom domain setup', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings/domain');
    
    // Add custom domain
    await page.fill('[name="domain"]', 'support.acme.com');
    await page.click('button:has-text("Add Domain")');
    
    // Should show DNS instructions
    await expect(page.locator('text=DNS Configuration Required')).toBeVisible();
    
    // Should display TXT record
    await expect(page.locator('text=_privydesk.support.acme.com')).toBeVisible();
    
    // Should display CNAME record
    await expect(page.locator('text=custom.privydesk.com')).toBeVisible();
    
    // Copy DNS record
    await page.click('button[aria-label="Copy TXT record"]');
    await expect(page.locator('text=Copied to clipboard')).toBeVisible();
    
    // Verify domain (in real test, DNS would be configured)
    await page.click('button:has-text("Verify Domain")');
    
    // Should show verification in progress
    await expect(page.locator('text=Verifying')).toBeVisible();
    
    // Should show success after verification
    await expect(page.locator('text=Domain Verified')).toBeVisible({ timeout: 10000 });
    
    // Should show SSL status
    await expect(page.locator('text=SSL Active')).toBeVisible();
    
    // Should show "Set as Active" button
    await page.click('button:has-text("Set as Active")');
    
    // Should show active badge
    await expect(page.locator('text=Active Domain')).toBeVisible();
  });

  test('should prevent adding invalid domains', async ({ page }) => {
    await page.goto('/settings/domain');
    
    const invalidDomains = [
      'invalid',
      'http://domain.com',
      'domain.com/',
      'domain..com',
    ];

    for (const domain of invalidDomains) {
      await page.fill('[name="domain"]', domain);
      await page.click('button:has-text("Add Domain")');
      
      await expect(page.locator('text=Invalid domain format')).toBeVisible();
    }
  });

  test('should handle DNS verification failure', async ({ page }) => {
    await page.goto('/settings/domain');
    
    await page.fill('[name="domain"]', 'support.acme.com');
    await page.click('button:has-text("Add Domain")');
    
    // Try to verify without configuring DNS
    await page.click('button:has-text("Verify Domain")');
    
    // Should show error
    await expect(page.locator('text=DNS records not found')).toBeVisible();
    await expect(page.locator('text=Please check your DNS configuration')).toBeVisible();
  });

  test('should allow multiple domains for Enterprise plan', async ({ page }) => {
    // Assume user is on Enterprise plan
    await page.goto('/settings/domain');
    
    // Add first domain
    await page.fill('[name="domain"]', 'support.acme.com');
    await page.click('button:has-text("Add Domain")');
    await expect(page.locator('text=support.acme.com')).toBeVisible();
    
    // Add second domain
    await page.fill('[name="domain"]', 'help.acme.com');
    await page.click('button:has-text("Add Domain")');
    await expect(page.locator('text=help.acme.com')).toBeVisible();
    
    // Should show both domains in list
    const domainList = page.locator('[data-testid="domain-list"]');
    await expect(domainList.locator('text=support.acme.com')).toBeVisible();
    await expect(domainList.locator('text=help.acme.com')).toBeVisible();
  });

  test('should block custom domains for Free plan', async ({ page }) => {
    // Assume user is on Free plan
    await page.goto('/settings/domain');
    
    // Should show upgrade prompt
    await expect(page.locator('text=Custom domains require Professional or Enterprise plan')).toBeVisible();
    
    // Domain input should be disabled
    await expect(page.locator('[name="domain"]')).toBeDisabled();
    
    // Should show upgrade button
    await expect(page.locator('button:has-text("Upgrade Plan")')).toBeVisible();
  });

  test('should delete custom domain', async ({ page }) => {
    await page.goto('/settings/domain');
    
    // Assume domain already exists
    await expect(page.locator('text=support.acme.com')).toBeVisible();
    
    // Click delete button
    await page.click('button[aria-label="Delete domain support.acme.com"]');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');
    
    // Should show success message
    await expect(page.locator('text=Domain deleted')).toBeVisible();
    
    // Domain should be removed from list
    await expect(page.locator('text=support.acme.com')).not.toBeVisible();
  });

  test('should access helpdesk via custom domain', async ({ page }) => {
    // Visit custom domain
    await page.goto('https://support.acme.com');
    
    // Should load organization's helpdesk
    await expect(page.locator('text=Acme Corp Support')).toBeVisible();
    
    // Should show custom branding
    await expect(page.locator('[data-testid="org-logo"]')).toBeVisible();
    
    // Should be able to create ticket
    await page.click('button:has-text("New Ticket")');
    await expect(page.locator('text=Create New Ticket')).toBeVisible();
  });

  test('should redirect www to non-www', async ({ page }) => {
    // Visit www subdomain
    await page.goto('https://www.support.acme.com');
    
    // Should redirect to non-www
    await expect(page).toHaveURL('https://support.acme.com');
  });

  test('should show SSL certificate status', async ({ page }) => {
    await page.goto('/settings/domain');
    
    // Should show SSL active badge
    await expect(page.locator('text=SSL Active')).toBeVisible();
    
    // Should show expiry date
    await expect(page.locator('text=Expires:')).toBeVisible();
    
    // Should show renewal status
    await expect(page.locator('text=Auto-renewal enabled')).toBeVisible();
  });
});
