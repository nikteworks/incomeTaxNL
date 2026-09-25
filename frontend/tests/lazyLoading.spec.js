import { test, expect } from '@playwright/test'

test('FAQ data and Box 3 controls load when needed, without Twitter links', async ({ page }) => {
  const scripts = []
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url())
  })
  await page.goto('/')
  await expect(page.locator('.calculator-shell')).toBeVisible()
  expect(scripts.some((url) => /faq-2026\.(en|nl)-/.test(url))).toBe(false)
  expect(scripts.some((url) => /Box3InputForm-/.test(url))).toBe(false)
  await expect(page.locator('a[href*="twitter.com"], a[href*="x.com"]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Box 3', exact: true }).click()
  await expect(page.locator('.guided-inputs .tax-form')).toBeVisible()
  expect(scripts.some((url) => /Box3InputForm-/.test(url))).toBe(true)
  expect(scripts.some((url) => /Box3CalculationBreakdown-/.test(url))).toBe(false)
  await page.locator('.guided-tax-row > button').click()
  await expect(page.locator('#guided-tax-detail')).toBeVisible()
  await expect.poll(() => scripts.some((url) => /Box3CalculationBreakdown-/.test(url))).toBe(true)

  await page.locator('.language-switcher').click()
  await expect.poll(async () => JSON.parse(await page.locator('#faq-structured-data').textContent()).inLanguage).toBe('nl')
  expect(scripts.some((url) => /faq-2026\.nl-/.test(url))).toBe(true)
  await page.locator('#guided-faq-title button').click()
  await expect(page.locator('.faq-section__item')).toHaveCount(219)
})
