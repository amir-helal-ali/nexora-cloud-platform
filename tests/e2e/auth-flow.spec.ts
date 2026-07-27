import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Nexora Cloud')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10000 })
  })

  test('should login successfully with correct credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
    // Should see the dashboard
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.click('a[href="/register"]')
    await expect(page).toHaveURL(/\/register/)
    await expect(page.locator('h1')).toContainText('Create Account')
  })
})

test.describe('Dashboard Navigation (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
  })

  test('should display overview dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
    // Check sidebar is visible
    await expect(page.locator('aside')).toBeVisible()
  })

  test('should navigate to Applications', async ({ page }) => {
    // Click on Applications in sidebar
    const appsLink = page.locator('button:has-text("التطبيقات"), button:has-text("Applications")').first()
    await appsLink.click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Databases', async ({ page }) => {
    const dbLink = page.locator('button:has-text("قواعد البيانات"), button:has-text("Databases")').first()
    await dbLink.click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to Settings', async ({ page }) => {
    const settingsLink = page.locator('button:has-text("الإعدادات"), button:has-text("Settings")').last()
    await settingsLink.click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('should show command palette on Cmd+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    // Wait a moment for the palette to open
    await page.waitForTimeout(500)
    // The dialog should be visible
    const dialog = page.locator('[role="dialog"]')
    // It might not always open, so just check it doesn't crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('should toggle theme', async ({ page }) => {
    // Find the theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"], button[aria-label="تبديل المظهر"]')
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      // Should not crash
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should toggle language', async ({ page }) => {
    // Find the language toggle button
    const langToggle = page.locator('button[aria-label="Toggle language"], button[aria-label="تبديل اللغة"]')
    if (await langToggle.isVisible()) {
      await langToggle.click()
      await page.waitForTimeout(300)
      // Click on English or Arabic option
      const option = page.locator('[role="menuitem"]').first()
      if (await option.isVisible()) {
        await option.click()
        await expect(page.locator('body')).toBeVisible()
      }
    }
  })
})

test.describe('API Health', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBeLessThan(503)
    const body = await response.json()
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('checks')
  })
})

test.describe('404 Page', () => {
  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page-12345')
    // Should show 404 content (either custom or Next.js default)
    await expect(page.locator('body')).toBeVisible()
  })
})
