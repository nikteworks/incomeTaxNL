import { test, expect } from '@playwright/test'
import { pageCopy } from '../src/seo/metadata.js'

for (const [path, language] of [['/', 'en'], ['/?lang=en', 'en'], ['/?lang=nl', 'nl'], ['/?lang=nl&lang=en', 'en'], ['/?lang=nl&calcType=box3&v=1&state=PRIVATE_TEST_VALUE&utm_source=test', 'nl']]) {
  test(`initial HTML and hydration agree: ${path}`, async ({ page, request, browser }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain(`<html lang="${language}">`)
    expect(html).toContain(pageCopy[language].heading.replaceAll('&', '&amp;'))
    expect(html).toContain(pageCopy[language].introduction)
    expect(html).not.toContain('PRIVATE_TEST_VALUE')
    expect(html).not.toContain('utm_source')
    const noJs = await browser.newContext({ javaScriptEnabled: false })
    const staticPage = await noJs.newPage()
    await staticPage.goto(new URL(path, response.url()).href)
    await expect(staticPage.getByRole('heading', { level: 1 })).toHaveText(pageCopy[language].heading)
    await expect(staticPage.getByText(pageCopy[language].introduction)).toBeVisible()
    await expect(staticPage.locator('link[rel="canonical"]')).toHaveAttribute('href', language === 'nl' ? 'https://incometax.nl/?lang=nl' : 'https://incometax.nl/')
    await expect(staticPage).toHaveTitle(pageCopy[language].title)
    await expect(staticPage.locator('meta[name="description"]')).toHaveAttribute('content', pageCopy[language].description)
    await expect(staticPage.locator('meta[property="og:title"]')).toHaveAttribute('content', pageCopy[language].title)
    await expect(staticPage.locator('meta[name="twitter:description"]')).toHaveAttribute('content', pageCopy[language].description)
    await noJs.close()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    await page.addInitScript(() => localStorage.setItem('dutch_tax:form.box1.values.v1', JSON.stringify({ grossIncome: 83000 })))
    await page.goto(path)
    if (path.includes('calcType=box3')) {
      await expect(page.getByRole('button', { name: 'Box 3', exact: true })).toHaveAttribute('aria-pressed', 'true')
    } else {
      await expect(page.locator('input[type="number"]').first()).toHaveValue('83000')
    }
    await expect(page).toHaveTitle(pageCopy[language].title)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', pageCopy[language].description)
    const other = language === 'en' ? 'nl' : 'en'
    await page.locator('.language-switcher').click()
    await expect(page).toHaveTitle(pageCopy[other].title)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', pageCopy[other].title)
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', pageCopy[other].description)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pageCopy[other].heading)
    await page.goBack()
    await expect(page).toHaveTitle(pageCopy[language].title)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(3)
    await expect(page.locator('#page-structured-data')).toHaveCount(1)
    expect(errors.filter((message) => /hydration|Minified React error|didn't match|server rendered/i.test(message))).toEqual([])
  })
}

test('alternating requests never select the other language artifact', async ({ request }) => {
  for (const language of ['nl', 'en', 'nl', 'en']) {
    const result = await request.get(`/?lang=${language}`, { headers: { 'Accept-Language': language === 'en' ? 'nl' : 'en', Cookie: 'lang=other' } })
    expect(await result.text()).toContain(`<html lang="${language}">`)
  }
})

for (const width of [390, 1280]) {
  test(`intro stays above the calculator at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?lang=nl')
    await expect(page.locator('.calculator-shell')).toBeVisible()
    const intro = await page.locator('.app-introduction').boundingBox()
    const calculator = await page.locator('.calculator-shell').boundingBox()
    expect(intro.y + intro.height).toBeLessThanOrEqual(calculator.y)
    expect(calculator.x).toBeGreaterThanOrEqual(0)
    expect(calculator.x + calculator.width).toBeLessThanOrEqual(width)
  })
}
