import { expect, test, type Page } from '@playwright/test';

function seedTenant(page: Page) {
  return page.addInitScript(() => {
    localStorage.setItem('primerent_lang', 'en');
    localStorage.setItem('prime_mock_user', JSON.stringify({ uid: 'tenant-journey-test', email: 'tenant@example.test', role: 'tenant', displayName: 'Tenant Test' }));
    localStorage.setItem('primerent_user_role', 'tenant');
  });
}

test.describe('tenant journey detail completion', () => {
  test('provides a usable panel for every tenant dashboard task', async ({ page }) => {
    await seedTenant(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/tenant/dashboard', { waitUntil: 'domcontentloaded' });

    const navigation = page.getByTestId('dashboard-desktop-navigation');
    for (const tab of ['Viewings', 'Payments', 'Saved properties', 'Applications', 'My contracts', 'Preferences']) {
      await navigation.getByRole('button', { name: tab }).click();
      await expect(page.getByText('This section is not ready yet')).toHaveCount(0);
    }

    await navigation.getByRole('button', { name: 'Payments' }).click();
    await page.getByRole('button', { name: 'Confirm payment' }).click();
    await expect(page).toHaveURL(/\/tenant\/billing$/);

    await page.goto('/tenant/dashboard', { waitUntil: 'domcontentloaded' });
    await navigation.getByRole('button', { name: 'My contracts' }).click();
    await page.getByRole('button', { name: 'Review and sign lease' }).click();
    await expect(page).toHaveURL(/\/tenant\/contract\?contractId=demo-001/);
  });

  test('supports selected-bill payment and tenant local activity state', async ({ page }) => {
    await seedTenant(page);
    await page.goto('/tenant/billing', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('tenant-bill-rent').click();
    await expect(page.getByText('฿3,500')).toBeVisible();
    await page.getByRole('button', { name: 'Pay selected bills' }).click();
    await expect(page).toHaveURL(/\/tenant\/payment\?amount=3500/);
    await page.getByTestId('confirm-payment').click();
    await expect(page.getByRole('heading', { name: 'Payment successful' })).toBeVisible();

    await page.goto('/tenant/contact', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Subject').fill('Water pressure');
    await page.getByLabel('Details').fill('The kitchen tap has low pressure.');
    await page.getByRole('button', { name: 'Submit ticket' }).click();
    await expect(page.getByRole('status')).toContainText('Ticket submitted');
    await expect(page.getByText('Water pressure')).toBeVisible();

    await page.goto('/tenant/news', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Mark as read' }).first().click();
    await expect(page.getByRole('button', { name: 'Mark as read' })).toHaveCount(1);

    await page.goto('/tenant/history', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('INV-2026-05')).toBeVisible();
    await expect(page.getByText('Receipt available').first()).toBeVisible();
  });

  test('keeps Tenant detail screens touch-sized and within the mobile viewport', async ({ page }) => {
    await seedTenant(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tenant/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard-mobile-navigation')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'More' })).toBeVisible();

    await page.goto('/tenant/billing', { waitUntil: 'domcontentloaded' });
    const controls = page.locator('header button, main button');
    for (const control of await controls.all()) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(Math.min(box!.width, box!.height)).toBeGreaterThanOrEqual(44);
    }
    await page.getByTestId('tenant-bill-rent').focus();
    await expect(page.getByTestId('tenant-bill-rent')).toBeFocused();
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
  });
});
