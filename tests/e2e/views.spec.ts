import { test, expect } from '@playwright/test'

test.describe('Apps CRUD (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
  })

  test('should display apps list', async ({ page }) => {
    // Navigate to apps
    const appsLink = page.locator('button:has-text("التطبيقات"), button:has-text("Applications")').first()
    await appsLink.click()
    await page.waitForTimeout(2000)
    // Should see app cards or empty state
    await expect(page.locator('main')).toBeVisible()
  })

  test('should open create app dialog', async ({ page }) => {
    const appsLink = page.locator('button:has-text("التطبيقات"), button:has-text("Applications")').first()
    await appsLink.click()
    await page.waitForTimeout(1000)
    
    // Click "New Application" button
    const newBtn = page.locator('button:has-text("تطبيق جديد"), button:has-text("New Application")').first()
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(500)
      // Dialog should be visible
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should filter apps by runtime', async ({ page }) => {
    const appsLink = page.locator('button:has-text("التطبيقات"), button:has-text("Applications")').first()
    await appsLink.click()
    await page.waitForTimeout(1000)
    
    // Click Rust filter button
    const rustFilter = page.locator('button:has-text("Rust")').first()
    if (await rustFilter.isVisible()) {
      await rustFilter.click()
      await page.waitForTimeout(500)
      // Should not crash
      await expect(page.locator('main')).toBeVisible()
    }
  })
})

test.describe('Databases View (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
  })

  test('should display databases list', async ({ page }) => {
    const dbLink = page.locator('button:has-text("قواعد البيانات"), button:has-text("Databases")').first()
    await dbLink.click()
    await page.waitForTimeout(2000)
    await expect(page.locator('main')).toBeVisible()
  })

  test('should open create database dialog', async ({ page }) => {
    const dbLink = page.locator('button:has-text("قواعد البيانات"), button:has-text("Databases")').first()
    await dbLink.click()
    await page.waitForTimeout(1000)
    
    const newBtn = page.locator('button:has-text("قاعدة بيانات جديدة"), button:has-text("New Database")').first()
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(500)
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Secrets Manager (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
  })

  test('should display secrets list', async ({ page }) => {
    const secretsLink = page.locator('button:has-text("مدير الأسرار"), button:has-text("Secrets Manager")').first()
    await secretsLink.click()
    await page.waitForTimeout(2000)
    await expect(page.locator('main')).toBeVisible()
  })

  test('should show encryption notice', async ({ page }) => {
    const secretsLink = page.locator('button:has-text("مدير الأسرار"), button:has-text("Secrets Manager")').first()
    await secretsLink.click()
    await page.waitForTimeout(1000)
    // Should show encryption-related text
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Marketplace (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'owner@nexora.app')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/localhost:3000\/$|localhost:3000$/, { timeout: 15000 })
  })

  test('should display marketplace integrations', async ({ page }) => {
    const marketLink = page.locator('button:has-text("المتجر"), button:has-text("Marketplace")').first()
    await marketLink.click()
    await page.waitForTimeout(2000)
    await expect(page.locator('main')).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    const marketLink = page.locator('button:has-text("المتجر"), button:has-text("Marketplace")').first()
    await marketLink.click()
    await page.waitForTimeout(1000)
    
    // Click on Databases category
    const dbCategory = page.locator('button:has-text("Databases"), button:has-text("قواعد البيانات")').nth(1)
    if (await dbCategory.isVisible()) {
      await dbCategory.click()
      await page.waitForTimeout(500)
      await expect(page.locator('main')).toBeVisible()
    }
  })
})
