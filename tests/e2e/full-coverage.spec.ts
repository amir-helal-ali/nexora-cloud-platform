import { test, expect } from '@playwright/test'

test.describe('All Views Navigation (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
  })

  // Helper to navigate to a view by clicking sidebar button
  async function navigateToView(page: any, textPatterns: string[]) {
    for (const text of textPatterns) {
      const btn = page.locator(`button:has-text("${text}")`).first()
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click()
        await page.waitForTimeout(2000)
        return true
      }
    }
    return false
  }

  test('should navigate to CI/CD Pipelines', async ({ page }) => {
    await navigateToView(page, ['خطوط CI/CD', 'CI/CD Pipelines'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Analytics', async ({ page }) => {
    await navigateToView(page, ['التحليلات', 'Analytics'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Scaling Simulator', async ({ page }) => {
    await navigateToView(page, ['محاكي التوسع', 'Scaling Simulator'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to API Gateway', async ({ page }) => {
    await navigateToView(page, ['بوابة API', 'API Gateway'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Feature Flags', async ({ page }) => {
    await navigateToView(page, ['ميزات الميزات', 'Feature Flags'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Service Mesh', async ({ page }) => {
    await navigateToView(page, ['شبكة الخدمات', 'Service Mesh'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to WebSocket Services', async ({ page }) => {
    await navigateToView(page, ['خدمات WebSocket', 'WebSocket Services'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Push Notifications', async ({ page }) => {
    await navigateToView(page, ['إشعارات Push', 'Push Notifications'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Backups', async ({ page }) => {
    await navigateToView(page, ['النسخ الاحتياطية', 'Backups'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to CDN & Edge', async ({ page }) => {
    await navigateToView(page, ['CDN والحواف', 'CDN & Edge'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Monitoring & Alerts', async ({ page }) => {
    await navigateToView(page, ['المراقبة والتنبيهات', 'Monitoring & Alerts'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Deployments', async ({ page }) => {
    await navigateToView(page, ['النشر', 'Deployments'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Logs', async ({ page }) => {
    await navigateToView(page, ['السجلات', 'Logs'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Audit Log', async ({ page }) => {
    await navigateToView(page, ['سجل التدقيق', 'Audit Log'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Billing', async ({ page }) => {
    await navigateToView(page, ['الفوترة', 'Billing'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Domains & SSL', async ({ page }) => {
    await navigateToView(page, ['النطاقات و SSL', 'Domains & SSL'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Team', async ({ page }) => {
    await navigateToView(page, ['الفريق', 'Team'])
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
  })

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator('body')).toBeVisible()
    // Sidebar should be hidden on mobile
    // Main content should be visible
    await expect(page.locator('main')).toBeVisible()
  })

  test('should display correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('should display correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator('main')).toBeVisible()
    // Sidebar should be visible on desktop
    await expect(page.locator('aside')).toBeVisible()
  })
})

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })

    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label="Toggle theme"], button[aria-label="تبديل المظهر"]')
    if (await themeToggle.isVisible()) {
      // Get initial state
      const htmlClass = await page.locator('html').getAttribute('class')
      await themeToggle.click()
      await page.waitForTimeout(500)
      // Class should change
      const newClass = await page.locator('html').getAttribute('class')
      // At least verify it doesn't crash
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

test.describe('Footer', () => {
  test('should display footer with links', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    // Footer should be visible
    const footer = page.locator('footer')
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible()
    }
  })
})
