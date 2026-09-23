import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const copy = Object.fromEntries(['en', 'nl'].map((language) => [language,
  JSON.parse(readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), 'utf8')).guide,
]))

for (const language of ['en', 'nl']) {
  test(`calculator links are crawlable without JavaScript in ${language}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`http://127.0.0.1:4173/?lang=${language}&calcType=box3&state=PRIVATE`)
    await expect(page.locator('.calculation-guide')).toHaveCount(0)
    await expect(page.locator('meta[name="keywords"]')).toHaveCount(0)
    for (const boxType of ['box1', 'box3']) {
      const link = page.locator('.calculator-links').getByRole('link', { name: copy[language][`${boxType}Link`] })
      await expect(link).toHaveAttribute('href', `/?${language === 'nl' ? 'lang=nl&' : ''}calcType=${boxType}`)
    }
    await context.close()
  })

  for (const width of [390, 768, 1440]) {
    test(`guided calculator remains prominent and fits: ${language}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/?lang=${language}`)
      const input = page.locator('input[type="number"]').first()
      await expect(input).toBeVisible()
      expect((await input.boundingBox()).y).toBeLessThan(720)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await expect(page.locator('.calculation-guide')).toHaveCount(0)
      await page.locator('.guided-rail').screenshot({ path: `test-results/issue28-${language}-${width}.png` })
    })
  }
}

test('calculator links override saved preference and preserve language, payload and history', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dutch_tax:form.boxType.v1', JSON.stringify('box1')))
  await page.goto('/?lang=nl&calcType=box3&state=PRIVATE&tag=a&tag=b#results')
  await expect(page.getByRole('button', { name: 'Box 3', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Box 3', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Box 1', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Box 1', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.locator('input[type="number"]').first().fill('65000')
  await page.locator('.language-switcher').click()
  await expect(page.locator('input[type="number"]').first()).toHaveValue('65000')
  const url = new URL(page.url())
  expect(url.searchParams.get('calcType')).toBe('box1')
  expect(url.searchParams.get('state')).toBe('PRIVATE')
  expect(url.searchParams.getAll('tag')).toEqual(['a', 'b'])
  expect(url.hash).toBe('#results')
  expect(url.searchParams.has('grossIncome')).toBe(false)
  await page.goBack()
  await page.goBack()
  await expect(page.getByRole('button', { name: 'Box 3', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.goForward()
  await expect(page.locator('input[type="number"]').first()).toHaveValue('65000')
})

for (const query of ['', '?calcType=', '?calcType=nope', '?calcType=box1&calcType=box3', '?lang=xx&calcType=nope']) {
  test(`saved calculator fallback and invalid normalization: ${query}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('dutch_tax:form.boxType.v1', JSON.stringify('box3')))
    await page.goto(`/${query}`)
    await expect(page.getByRole('button', { name: 'Box 3', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => new URL(page.url()).searchParams.has('calcType')).toBe(false)
  })
}
