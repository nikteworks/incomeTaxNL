import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const translations = Object.fromEntries(['en', 'nl'].map(language => [language,
  JSON.parse(readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), 'utf8')),
]))

for (const language of ['en', 'nl']) {
  for (const width of [390, 768, 1440]) {
    test(`shared dialogs fit and restore focus: ${language}, ${width}px`, async ({ page }) => {
      const copy = translations[language]
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize({ width, height: 800 })
      await page.goto(`/?lang=${language}&calcType=box1`)

      async function inspect(trigger, title, closeWithEscape = false) {
        await trigger.click()
        const dialog = page.getByRole('dialog', { name: title, exact: true })
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveCSS('background-color', 'rgb(249, 251, 253)')
        const bounds = await dialog.boundingBox()
        expect(bounds.x).toBeGreaterThanOrEqual(12)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 12)
        expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
        if (title === copy.config.title) {
          const spacing = await dialog.evaluate(el => {
            const headings = [...el.querySelectorAll('.config-menu__section-title')]
            return headings.map(heading => {
              const label = heading.parentElement.querySelector('.MuiInputLabel-root')
              const precedingText = heading.parentElement.querySelector('.config-menu__section-description') || heading
              return label.getBoundingClientRect().top - precedingText.getBoundingClientRect().bottom
            })
          })
          spacing.forEach(gap => expect(gap).toBeGreaterThanOrEqual(8))
        }
        const footer = dialog.locator('.standard-modal__actions')
        await expect(footer).toBeInViewport()
        // Wrapping backwards from the first button must stay inside the dialog.
        await dialog.locator('button').first().focus()
        await page.keyboard.press('Shift+Tab')
        expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
        if (closeWithEscape) await page.keyboard.press('Escape')
        else await dialog.locator('.standard-modal__close').click()
        await expect(dialog).toBeHidden()
        await expect(trigger).toBeFocused()
      }

      await inspect(page.getByRole('button', { name: copy.header.aboutAriaLabel }), copy.modals.aboutTitle, true)
      await inspect(page.getByRole('button', { name: copy.app.noticeLink }), copy.modals.privacyTitle)
      await inspect(page.getByRole('button', { name: copy.footer.credits, exact: true }), copy.modals.creditsTitle)
      await inspect(page.getByRole('button', { name: copy.footer.termsOfUse, exact: true }), copy.modals.termsTitle, true)
      await inspect(page.getByRole('button', { name: copy.box1Form.advancedOptions, exact: true }), copy.box1Form.advancedOptions)
      await inspect(page.getByRole('button', { name: copy.box1Form.reset, exact: true }), copy.box1Form.resetTitle)
      await page.getByRole('button', { name: 'Box 3', exact: true }).click()
      await inspect(page.getByRole('button', { name: copy.box3Form.reset, exact: true }), copy.box1Form.resetTitle)
      await inspect(page.getByRole('button', { name: copy.box1Form.advancedOptions }), copy.config.title, true)
      await inspect(page.getByRole('button', { name: 'Where can I find this information?' }), copy.modals.statementTitle)
      for (const label of [copy.box3Form.bankAccounts, copy.box3Form.investmentAccounts, copy.box3Form.debts]) {
        await page.locator('.tax-form__accordion-summary').filter({ hasText: label }).click()
        await inspect(page.locator('.tax-form__accordion').filter({ has: page.locator('.tax-form__accordion-summary').filter({ hasText: label }) }).getByRole('button', { name: copy.box3Form.manageEntries }), label)
      }
      expect(errors).toEqual([])
    })
  }

  test(`Box 1 advanced modal preserves controls and main ruling: ${language}`, async ({ page }) => {
    const copy = translations[language]
    await page.goto(`/?lang=${language}&calcType=box1`)
    await page.locator('.box1-form__main-ruling input[type="checkbox"]').check()
    await page.getByRole('radio', { name: copy.box1Form.researchWorker }).check()
    await page.getByRole('combobox', { name: copy.box1Form.period, exact: false }).selectOption('hourly')
    const trigger = page.getByRole('button', { name: copy.box1Form.advancedOptions })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: copy.box1Form.advancedOptions })
    await expect(dialog.getByRole('combobox', { name: copy.box1Form.period })).toHaveCount(0)
    await expect(dialog.locator('.box1-form__ruling-section')).toHaveCount(0)
    await dialog.getByLabel(copy.box1Form.hoursPerWeek).fill('32')
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
    await expect(page.getByRole('radio', { name: copy.box1Form.researchWorker })).toBeChecked()
    await trigger.click()
    await expect(dialog.getByLabel(copy.box1Form.hoursPerWeek)).toHaveValue('32')
  })

  test(`entry dismissal guard survives shared close controls: ${language}`, async ({ page }) => {
    const copy = translations[language]
    await page.goto(`/?lang=${language}&calcType=box3`)
    await page.locator('.tax-form__accordion-summary').first().click()
    const trigger = page.getByRole('button', { name: copy.box3Form.manageEntries }).filter({ visible: true })
    await trigger.click()
    const entry = page.getByRole('dialog', { name: copy.box3Form.bankAccounts, exact: true })
    await entry.getByLabel(copy.box3Form.accountName).fill('Review savings')
    await entry.locator('.standard-modal__close').click()
    const warning = page.getByRole('dialog', { name: copy.modals.discardTitle })
    await expect(warning).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(warning).toBeHidden()
    await expect(entry.getByLabel(copy.box3Form.accountName)).toHaveValue('Review savings')
    await expect(entry.locator('.standard-modal__close')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(warning).toBeVisible()
    await warning.getByRole('button', { name: copy.modals.discard, exact: true }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
}

for (const language of ['en', 'nl']) {
  test(`annual statement starts collapsed on every open: ${language}`, async ({ page }) => {
    await page.goto(`/?lang=${language}&calcType=box3`)
    const trigger = page.getByRole('button', { name: 'Where can I find this information?' })
    for (let attempt = 0; attempt < 2; attempt++) {
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: translations[language].modals.statementTitle })
      const sections = dialog.locator('.jaaropgave-guide__accordion .MuiAccordionSummary-root')
      await expect(sections).toHaveCount(3)
      for (const section of await sections.all()) await expect(section).toHaveAttribute('aria-expanded', 'false')
      await sections.first().click()
      await expect(sections.first()).toHaveAttribute('aria-expanded', 'true')
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
    }
  })
}
