import { test, expect } from '@playwright/test'
import { faqByLanguage } from '../src/seo/faq.js'

for (const language of ['en', 'nl']) {
  test(`FAQ answers are visible and match JSON-LD in ${language}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`/?lang=${language}`)
    const items = page.locator('.faq-section__item')
    const supplied = faqByLanguage[language].mainEntity
    await expect(items).toHaveCount(supplied.length)
    expect(await items.locator('summary').allTextContents()).toEqual(supplied.map((item) => item.name))
    expect(await items.locator('p').allTextContents()).toEqual(supplied.map((item) => item.acceptedAnswer.text))

    const schema = JSON.parse(await page.locator('#faq-structured-data').textContent())
    expect(schema['@type']).toBe('FAQPage')
    expect(schema.inLanguage).toBe(language)
    expect(schema.mainEntity).toEqual(supplied)
    expect(schema.url).toBe(language === 'nl' ? 'https://incometax.nl/?lang=nl' : 'https://incometax.nl/')
    await items.first().locator('summary').click()
    await expect(items.first().locator('p')).toBeVisible()
    await expect(page.locator('meta[property="og:image"], meta[name="twitter:image"]')).toHaveCount(0)
    await context.close()
  })
}

test('FAQ language and JSON-LD change together after navigation', async ({ page }) => {
  await page.goto('/')
  await page.locator('.language-switcher').click()
  await expect(page.locator('.faq-section__item summary').first()).toHaveText(faqByLanguage.nl.mainEntity[0].name)
  await expect.poll(async () => JSON.parse(await page.locator('#faq-structured-data').textContent()).inLanguage).toBe('nl')
  await expect(page.locator('#faq-structured-data')).toHaveCount(1)
})
