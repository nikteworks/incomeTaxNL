import { test } from 'node:test'
import assert from 'node:assert/strict'
import { annualIncome, changeSalaryField, assetInputs, validBox3Config } from '../src/features/tax-calculator/utils/calculatorState.js'
import { BOX1_EMPTY_FORM } from '../src/features/tax-calculator/constants/box1Defaults.js'
import { getDefaultsForYear, DEFAULT_YEAR } from 'dutch-tax-box3-calculator'

test('period round trips preserve cents and annual calculations across reloads', () => {
  for (const amount of [0.01, 12345.67, 83000.99, 1e7]) {
    let form = { ...BOX1_EMPTY_FORM, grossIncome: amount, hoursPerWeek: 32 }
    for (let i = 0; i < 5; i++) {
      for (const period of ['monthly', 'weekly', 'daily', 'hourly', 'yearly']) {
        form = JSON.parse(JSON.stringify(changeSalaryField(form, 'period', period)))
        assert.equal(annualIncome(form), amount)
      }
    }
    assert.equal(form.grossIncome, amount)
  }
})

test('editing converted income or hours establishes a new annual amount', () => {
  let form = changeSalaryField({ ...BOX1_EMPTY_FORM, grossIncome: 60000 }, 'period', 'hourly')
  form = changeSalaryField(form, 'grossIncome', 30)
  assert.equal(annualIncome(form), 62400)
  form = changeSalaryField(form, 'hoursPerWeek', 32)
  assert.equal(annualIncome(form), 49920)
  form = changeSalaryField(form, 'grossIncome', '')
  assert.equal(annualIncome(form), null)
  assert.equal(changeSalaryField(form, 'period', 'yearly').grossIncome, '')
})

test('invalid persisted assets and configuration never become plausible zeros', () => {
  assert.ok(Number.isNaN(assetInputs({ bankAccounts: [{ amount: -1 }], investmentAccounts: [], debts: [] }).bankBalance))
  const defaults = getDefaultsForYear(DEFAULT_YEAR)
  assert.equal(validBox3Config(defaults), true)
  for (const taxRate of ['', -1, 1.01, Infinity, NaN]) assert.equal(validBox3Config({ ...defaults, taxRate }), false)
})
