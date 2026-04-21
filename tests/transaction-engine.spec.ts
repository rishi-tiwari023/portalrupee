import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Transaction Engine E2E Tests', () => {
  
  test('User can login and perform a P2P transfer', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'customer@portalrupee.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // 2. Navigate to Transfer
    await page.click('text=Transfer');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/transfer`);

    // 3. Step 1: Search for recipient (Mrs. Customer)
    await page.fill('input[placeholder="Name, email, mobile, or account number..."]', 'customer2@portalrupee.com');
    await page.waitForSelector('text=Mrs. Customer');
    await page.click('text=Mrs. Customer');
    await page.click('button:has-text("Continue")');

    // 4. Step 2: Enter amount
    await page.fill('input[type="number"]', '500');
    await page.fill('input[placeholder="What\'s this for?"]', 'Lunch money');
    await page.click('button:has-text("Review Transaction")');

    // 5. Step 3: Security Check (TPIN)
    const tpinInputs = page.locator('input[type="password"]');
    await tpinInputs.first().focus();
    await page.keyboard.type('111111');
    
    await page.waitForTimeout(500); 

    await page.click('button:has-text("Authorize Transfer")');

    // 6. Step 4: Success verification
    await expect(page.locator('text=Success!')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Your money has been successfully delivered.')).toBeVisible();
    await expect(page.locator('text=Transaction ID')).toBeVisible();
  });
});
