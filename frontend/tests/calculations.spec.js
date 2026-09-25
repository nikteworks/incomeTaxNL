import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { SalaryPaycheck } from 'dutch-tax-income-calculator'
import { calculateBox3Tax, getDefaultsForYear, DEFAULT_YEAR } from 'dutch-tax-box3-calculator'
import { formatEuro } from '../src/utils/formatters.js'

const translations = Object.fromEntries(['en', 'nl'].map(language => [language,
  JSON.parse(readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), 'utf8')),
]))
const headline = page => page.locator('[data-metric="headline"]')
const money = (value, language = 'en') => formatEuro(value, `${language}-NL`)
const paycheck = (income, { allowance = true, older = false, socialSecurity = true, ruling = false, choice = 'normal', year = 2026 } = {}) =>
  new SalaryPaycheck({ income, allowance, older, socialSecurity, hours: 40 }, 'Year', year, { checked: ruling, choice })

for (const language of ['en', 'nl']) {
  test(`Box 1 figures, periods, filters and compact view agree: ${language}`, async ({ page }) => {
    const copy = translations[language]
    await page.goto(`/?lang=${language}&calcType=box1`)
    await expect(headline(page)).toHaveText('—')
    await expect(page.getByRole('meter')).toHaveCount(0)
    await page.locator('#guided-salary').fill('83000.99')
    const live = page.locator('.guided-headline [aria-live="polite"]')
    await expect(live).toHaveAttribute('aria-atomic', 'true')
    await expect(live).toContainText(copy.guidedRail.takeHome)
    const expected = paycheck(83000.99)
    await expect(headline(page)).toHaveText(money(expected.netYear / 12, language))
    await expect(page.getByRole('meter')).toHaveAttribute('value', String(expected.netYear / expected.grossYear))
    await page.locator('.guided-tax-row > button').click()
    for (const [label, divisor] of [['yearly', 1], ['weekly', 52], ['monthly', 12]]) {
      await page.locator('.guided-period').getByRole('button', { name: copy.periods[label], exact: true }).click()
      await expect(headline(page)).toHaveText(money(expected.netYear / divisor, language))
      await expect(live).toContainText(money(expected.netYear / divisor, language))
      for (const field of ['grossYear', 'taxableYear', 'incomeTax', 'netYear', 'grossAllowance', 'payrollTax', 'socialTax', 'generalCredit', 'labourCredit']) {
        await expect(page.locator(`[data-metric="${field}"] strong`)).toHaveText(money(expected[field] / divisor, language))
      }
      await expect(page.locator('[data-metric="tax"]')).toHaveText(money(Math.abs(expected.incomeTax) / divisor, language))
    }
    await page.getByRole('checkbox', { name: copy.box1Result.taxes, exact: true }).uncheck()
    await expect(page.locator('[data-metric="payrollTax"]')).toHaveCount(0)
    await expect(page.locator('[data-metric="netYear"]')).toBeVisible()
    const faq = page.locator('.guided-disclosure')
    await faq.focus(); await page.keyboard.press('Enter')
    await expect(faq).toBeFocused()
    await expect(page.locator('#guided-results-full')).toBeHidden()
    await expect(page.locator('[data-metric="compact-secondary"]')).toHaveText(money(Math.abs(expected.incomeTax) / 12, language))
    await expect(page.getByRole('meter')).toHaveCount(0)
    await page.getByRole('button', { name: copy.guidedRail.expand }).click()
    await expect(page.locator('#guided-faq-content')).toBeHidden()
    await expect(page.locator('#guided-results-full')).toBeVisible()
    for (const period of ['hourly', 'daily', 'weekly', 'monthly', 'yearly']) {
      await page.locator('#guided-income-period').selectOption(period)
      await expect(headline(page)).toHaveText(money(expected.netYear / 12, language))
    }
    await expect(page.locator('#guided-salary')).toHaveValue('83000.99')
    await page.getByRole('button', { name: 'Box 3', exact: true }).click()
    await expect(headline(page)).toHaveText('—')
    await page.getByRole('button', { name: 'Box 1', exact: true }).click()
    await expect(headline(page)).toHaveText(money(expected.netYear / 12, language))
    await page.reload()
    await expect(page.locator('#guided-salary')).toHaveValue('83000.99')
    await expect(headline(page)).toHaveText(money(expected.netYear / 12, language))
    await page.locator('#guided-salary').fill('-20')
    await expect(headline(page)).toHaveText('—')
    await expect(page.locator('#guided-salary')).toHaveAttribute('aria-invalid', 'true')
    await page.locator('#guided-salary').fill('')
    await expect(headline(page)).toHaveText('—')
  })
}

test('Box 1 switches, ruling categories, year and hours reach the library', async ({ page }) => {
  const copy = translations.en
  await page.goto('/?calcType=box1')
  await page.locator('#guided-salary').fill('90000')
  await page.getByLabel(copy.box1Form.holidayAllowanceIncluded, { exact: true }).uncheck()
  await expect(headline(page)).toHaveText(money(paycheck(90000, { allowance: false }).netYear / 12))
  await page.locator('.box1-form__main-ruling input[type="checkbox"]').check()
  for (const [label, choice] of [['researchWorker', 'research'], ['youngProfessional', 'young'], ['other', 'normal']]) {
    await page.getByRole('radio', { name: copy.box1Form[label], exact: true }).check()
    const expected = paycheck(90000, { allowance: false, ruling: true, choice })
    await expect(headline(page)).toHaveText(money(expected.netYear / 12))
    if (await page.locator('.guided-tax-row > button').getAttribute('aria-expanded') === 'false') await page.locator('.guided-tax-row > button').click()
    await expect(page.locator('[data-metric="taxFree"] strong')).toHaveText(money(expected.taxFreeYear / 12))
  }
  await page.getByRole('button', { name: copy.box1Form.advancedOptions }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox').click()
  await page.getByRole('option', { name: '2025', exact: true }).click()
  await dialog.locator('input[type="checkbox"]').first().check()
  await dialog.locator('input[type="checkbox"]').last().uncheck()
  await page.keyboard.press('Escape')
  await expect(headline(page)).toHaveText(money(paycheck(90000, { allowance: false, ruling: true, year: 2025, older: true, socialSecurity: false }).netYear / 12))
  await expect(page.locator('.guided-result-toolbar')).toContainText('2025')
  await page.locator('#guided-income-period').selectOption('hourly')
  await page.locator('#guided-salary').fill('50')
  await page.getByRole('button', { name: copy.box1Form.advancedOptions }).click()
  await dialog.getByLabel(copy.box1Form.hoursPerWeek).fill('32')
  await page.keyboard.press('Escape')
  await expect(headline(page)).toHaveText(money(paycheck(50 * 32 * 52, { allowance: false, ruling: true, year: 2025, older: true, socialSecurity: false }).netYear / 12))
  await page.getByRole('button', { name: copy.box1Form.advancedOptions }).click()
  await dialog.getByLabel(copy.box1Form.hoursPerWeek).fill('0')
  await page.keyboard.press('Escape')
  await expect(headline(page)).toHaveText('—')
  await page.getByRole('button', { name: copy.box1Form.reset, exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: copy.box1Form.reset, exact: true }).click()
  await expect(page.locator('#guided-salary')).toHaveValue('')
})

async function openEntries(page, label) {
  const accordion = page.locator('.tax-form__accordion').filter({ has: page.locator('.tax-form__accordion-summary').filter({ hasText: label }) })
  if (await accordion.locator('.tax-form__accordion-summary').getAttribute('aria-expanded') !== 'true') await accordion.locator('.tax-form__accordion-summary').click()
  await accordion.getByRole('button', { name: 'Manage entries' }).click()
  return page.getByRole('dialog', { name: label, exact: true })
}

test('Box 3 account CRUD, partner, year, custom rates, reload and reset calculate correctly', async ({ page }) => {
  const copy = translations.en
  await page.goto('/?calcType=box3')
  await expect(headline(page)).toHaveText('—')
  for (const [label, amount] of [['Bank accounts', 150000], ['Investment accounts', 90000], ['Debts', 10000]]) {
    const dialog = await openEntries(page, label)
    await dialog.getByLabel(label === 'Debts' ? 'Debt name' : 'Account name').fill(label)
    await dialog.getByRole('spinbutton').fill(String(amount))
    await dialog.locator('.standard-modal__actions').getByRole('button', { name: 'Save', exact: true }).click()
    await expect(dialog).toBeHidden()
  }
  let inputs = { bankBalance: 150000, investmentAssets: 90000, debts: 10000, hasTaxPartner: false }
  let config = { ...getDefaultsForYear(DEFAULT_YEAR), year: DEFAULT_YEAR }
  const check = async () => {
    const result = calculateBox3Tax(inputs, config)
    await expect(headline(page)).toHaveText(money(result.estimatedTax))
    await expect(page.locator('[data-metric="tax"]')).toHaveText(money(result.taxableBase))
  }
  await check()
  await page.locator('.guided-tax-row > button').click()
  await expect(page.locator('[data-metric="taxableReturns"] strong')).toHaveText(money(calculateBox3Tax(inputs, config).taxableReturns))
  let dialog = await openEntries(page, 'Bank accounts')
  await dialog.getByRole('button', { name: 'Edit Bank accounts' }).click()
  await dialog.getByRole('spinbutton').fill('160000')
  await dialog.locator('.standard-modal__actions').getByRole('button', { name: 'Save', exact: true }).click()
  inputs.bankBalance = 160000
  await check()
  dialog = await openEntries(page, 'Bank accounts')
  await expect(dialog.locator('.tax-form__modal-list-item--editing')).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Edit Bank accounts' })).toHaveCount(1)
  await dialog.getByRole('spinbutton').fill('-1')
  await expect(dialog.locator('.standard-modal__actions').getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
  await dialog.getByRole('spinbutton').fill('')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Yes', exact: true }).click()
  inputs.hasTaxPartner = true
  await check()
  await page.getByRole('button', { name: copy.box1Form.advancedOptions }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click()
  await check() // Saving untouched percentages must not divide them a second time.
  await page.getByRole('button', { name: copy.box1Form.advancedOptions }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox').click()
  await page.getByRole('option', { name: '2025', exact: true }).click()
  await dialog.getByLabel(copy.config.taxRate, { exact: true }).fill('101')
  await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
  await dialog.getByLabel(copy.config.taxRate, { exact: true }).fill('40')
  await dialog.getByLabel(copy.config.taxFreeAssets, { exact: true }).fill('60000')
  await dialog.getByLabel(copy.config.debtsThreshold, { exact: true }).fill('4000')
  await dialog.getByLabel(copy.config.bankBalanceRate, { exact: true }).fill('2')
  await dialog.getByLabel(copy.config.investmentAssetsRate, { exact: true }).fill('7')
  await dialog.getByLabel(copy.config.debtsRate, { exact: true }).fill('3')
  await dialog.locator('.standard-modal__actions').getByRole('button', { name: 'Save', exact: true }).click()
  config = { year: 2025, taxRate: 0.4, thresholds: { taxFreeAssetsPerIndividual: 60000, debtsThresholdPerIndividual: 4000 }, assumedReturnRates: { bankBalance: 0.02, investmentAssets: 0.07, debts: 0.03 } }
  await check()
  await expect(page.locator('.guided-result-toolbar')).toContainText('2025')
  await expect(page.locator('.tax-form__year-row')).toContainText('2025')
  await page.reload()
  await check()
  await page.getByRole('button', { name: copy.box1Form.advancedOptions }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: copy.config.resetToDefaults }).click()
  await dialog.getByRole('button', { name: copy.config.cancel, exact: true }).click()
  await check()
  await page.getByRole('button', { name: copy.box1Form.advancedOptions }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: copy.config.resetToDefaults }).click()
  await dialog.getByRole('button', { name: copy.config.save, exact: true }).click()
  config = { ...getDefaultsForYear(2025), year: 2025 }
  await check()
  await page.locator('.tax-form__year-row').getByRole('combobox').click()
  await page.getByRole('option', { name: '2024', exact: true }).click()
  config = { ...getDefaultsForYear(2024), year: 2024 }
  await check()
  dialog = await openEntries(page, 'Debts')
  await dialog.getByRole('button', { name: 'Delete Debts' }).click()
  await dialog.locator('.standard-modal__actions').getByRole('button', { name: 'Save', exact: true }).click()
  inputs.debts = 0
  await check()
  await page.locator('.guided-disclosure').click()
  await expect(page.locator('[data-metric="compact-secondary"]')).toHaveText(money(calculateBox3Tax(inputs, config).taxableBase))
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(headline(page)).toHaveText('—')
})

for (const width of [390, 768, 1440]) {
  test(`populated results remain readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => localStorage.setItem('dutch_tax:form.values.v1', JSON.stringify({ bankAccounts: [{ amount: 150000 }], investmentAccounts: [{ amount: 100000 }], debts: [], hasTaxPartner: false })))
    await page.goto('/?lang=nl&calcType=box1')
    await page.locator('#guided-salary').fill('123456.78')
    await page.locator('.guided-period button').nth(1).click()
    await page.locator('.guided-tax-row > button').click()
    const overflow = await page.locator('.guided-rail').evaluate(root => [...root.querySelectorAll('*')].filter(el => {
      const box = el.getBoundingClientRect()
      return getComputedStyle(el).opacity !== '0' && box.width > 0 && (box.right > window.innerWidth + 1 || box.left < -1)
    }).map(el => el.className))
    expect(overflow).toEqual([])
    await page.screenshot({ path: `test-results/guided-live-${width}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Box 3', exact: true }).click()
    await expect(headline(page)).not.toHaveText('—')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.locator('.guided-calculation-steps > li').last().scrollIntoViewIfNeeded()
    await expect(page.locator('.guided-calculation-steps > li').last()).toBeInViewport()
    await page.screenshot({ path: `test-results/guided-box3-${width}.png`, fullPage: true })
  })
}

test('invalid saved assets show no estimate; an explicit zero balance is valid', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dutch_tax:form.values.v1', JSON.stringify({ bankAccounts: [{ amount: -10 }], investmentAccounts: [], debts: [] })))
  await page.goto('/?calcType=box3')
  await expect(headline(page)).toHaveText('—')
  await expect(page.getByRole('status')).toContainText(translations.en.guidedRail.invalidAssets)
  const dialog = await openEntries(page, 'Bank accounts')
  await dialog.getByRole('spinbutton').fill('0')
  await dialog.locator('.standard-modal__actions').getByRole('button', { name: 'Save', exact: true }).click()
  await expect(headline(page)).toHaveText(money(0))
})

for (const language of ['en', 'nl']) {
  test(`Box 3 explains the six calculation steps with live amounts: ${language}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('dutch_tax:form.values.v1', JSON.stringify({ bankAccounts: [{ amount: 150000 }], investmentAccounts: [{ amount: 90000 }], debts: [{ amount: 10000 }], hasTaxPartner: false })))
    await page.goto(`/?lang=${language}&calcType=box3`)
    await page.locator('.guided-tax-row > button').click()
    const steps = page.locator('.guided-calculation-steps > li')
    await expect(steps).toHaveCount(6)
    for (const [index, key] of ['totalAssets', 'netAssets', 'taxableBase', 'taxableShare', 'taxableIncome', 'estimatedTax'].entries()) {
      await expect(steps.nth(index)).toContainText(translations[language].box3Breakdown[key].explanation)
      await expect(steps.nth(index).locator('.guided-calculation-formula')).toContainText(translations[language].box3Breakdown[key].formula)
    }
    const expected = calculateBox3Tax({ bankBalance: 150000, investmentAssets: 90000, debts: 10000 }, getDefaultsForYear(DEFAULT_YEAR))
    await expect(steps.last().locator('[data-metric="estimatedTax"]')).toHaveText(money(expected.estimatedTax, language))
    await expect(page.locator('[data-metric="deductibleDebts"]')).toHaveText(money(10000 - expected.totalDebtsThreshold, language))
    await page.getByRole('button', { name: language === 'nl' ? 'Ja' : 'Yes', exact: true }).click()
    const partner = calculateBox3Tax({ bankBalance: 150000, investmentAssets: 90000, debts: 10000, hasTaxPartner: true }, getDefaultsForYear(DEFAULT_YEAR))
    await expect(steps.last().locator('[data-metric="estimatedTax"]')).toHaveText(money(partner.estimatedTax, language))
    await page.screenshot({ path: `test-results/box3-explained-${language}.png`, fullPage: true })
  })
}

test('Box 3 explanations handle empty and debt-dominated balances without dividing by zero', async ({ page }) => {
  await page.goto('/?calcType=box3')
  await page.locator('.guided-tax-row > button').click()
  await expect(page.locator('[data-metric="estimatedTax"]')).toHaveText('—')
  const dialog = await openEntries(page, 'Debts')
  await dialog.getByRole('spinbutton').fill('100000')
  await dialog.locator('.standard-modal__actions').getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.locator('.guided-calculation-steps > li').nth(3)).toContainText(translations.en.box3Breakdown.noPositiveBase)
  await expect(page.locator('[data-metric="estimatedTax"]')).toHaveText(money(0))
  await expect(page.locator('.guided-box3-breakdown')).not.toContainText('NaN')
})
