import { test, expect } from '@playwright/test'

for (const [query, language] of [
  ['', 'en'], ['?lang=en', 'en'], ['?lang=nl', 'nl'],
  ['?lang=', 'en'], ['?lang=xx', 'en'], ['?lang=nl&lang=en', 'en'], ['?lang=nl&lang=nl', 'en'],
]) {
  test(`direct entry and refresh ${query || '/'}`, async ({ page }) => {
    await page.goto(`/${query}`)
    await expect(page.locator('html')).toHaveAttribute('lang', language)
    await expect(page.getByRole('link', { name: language === 'en' ? 'Switch to Dutch' : 'Schakel over naar Engels' })).toBeVisible()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', language)
    if (query && query !== '?lang=en' && query !== '?lang=nl') {
      await expect(page).toHaveURL(/\?lang=en$/)
    }
  })
}

test('switch and history preserve opaque calculation data, query values, hash and form state', async ({ page }) => {
  const state = JSON.stringify({ box1: { grossIncome: 65000, older: false }, box3: { bankAccounts: [{ name: 'é & + #', amount: 0 }] } })
  const params = new URLSearchParams({ lang: 'en', calcType: 'box3', v: '1', state })
  params.append('tag', 'a'); params.append('tag', 'b')
  await page.goto(`/?${params}#results`)
  const input = page.locator('input[type="number"]').first()
  await input.fill('72000')
  const link = page.getByRole('link', { name: 'Switch to Dutch' })
  const target = new URL(await link.getAttribute('href'), page.url())
  expect(target.searchParams.get('state')).toBe(state)
  expect(target.searchParams.getAll('tag')).toEqual(['a', 'b'])
  await link.click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl')
  await expect(input).toHaveValue('72000')
  for (const [key, value] of params) {
    if (key !== 'lang') expect(new URL(page.url()).searchParams.getAll(key)).toContain(value)
  }
  expect(new URL(page.url()).hash).toBe('#results')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://incometax.nl/?lang=nl')
  await page.goBack()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(input).toHaveValue('72000')
  await page.goForward()
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl')
  await page.getByRole('link', { name: 'Schakel over naar Engels' }).click()
  expect(new URL(page.url()).searchParams.has('lang')).toBe(false)
  expect(new URL(page.url()).searchParams.get('state')).toBe(state)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://incometax.nl/')
})

test('unknown paths do not render the calculator or redirect home', async ({ page }) => {
  const response = await page.goto('/nl/unknown?lang=nl')
  expect(response.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '404 — Page not found' })).toBeVisible()
  await expect(page).toHaveURL(/\/nl\/unknown\?lang=nl$/)
})
