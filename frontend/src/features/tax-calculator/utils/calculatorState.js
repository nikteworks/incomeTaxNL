import { PERIOD_MULTIPLIERS } from '../constants/box1Defaults.js'

export const isAmount = value => value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) >= 0
export const periodMultiplier = (period, hours) => period === 'hourly' ? Number(hours) * 52 : PERIOD_MULTIPLIERS[period]
const displayIncome = value => {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100
  return value > 0 && rounded === 0 ? Number(value.toPrecision(10)) : rounded
}

export function annualIncome(form) {
  const multiplier = periodMultiplier(form.period, form.hoursPerWeek)
  if (!isAmount(form.grossIncome) || !Number.isFinite(multiplier) || multiplier <= 0) return null
  // Keep the unrounded annual value across period switches, including after reload.
  if (isAmount(form.annualIncome) && displayIncome(form.annualIncome / multiplier) === Number(form.grossIncome)) return Number(form.annualIncome)
  return Number(form.grossIncome) * multiplier
}

export function changeSalaryField(form, name, value) {
  if (name === 'period') {
    const annual = annualIncome(form)
    const multiplier = periodMultiplier(value, form.hoursPerWeek)
    if (annual !== null && Number.isFinite(annual) && multiplier > 0) {
      return { ...form, period: value, grossIncome: displayIncome(annual / multiplier), annualIncome: annual }
    }
  }
  const next = { ...form, [name]: value }
  if (['grossIncome', 'period', 'hoursPerWeek'].includes(name)) delete next.annualIncome
  return next
}

export function validBox3Config(config) {
  const thresholds = config?.thresholds
  const rates = config?.assumedReturnRates
  return [thresholds?.taxFreeAssetsPerIndividual, thresholds?.debtsThresholdPerIndividual].every(isAmount)
    && [config?.taxRate, rates?.bankBalance, rates?.investmentAssets, rates?.debts].every(value => isAmount(value) && Number(value) <= 1)
}

export function assetInputs(form) {
  const sum = entries => entries.every(entry => isAmount(entry?.amount ?? entry))
    ? entries.reduce((total, entry) => total + Number(entry?.amount ?? entry), 0) : NaN
  return {
    bankBalance: sum(form.bankAccounts), investmentAssets: sum(form.investmentAccounts),
    debts: sum(form.debts), hasTaxPartner: form.hasTaxPartner,
  }
}
