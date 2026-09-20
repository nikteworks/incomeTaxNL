import { useMemo } from 'react'
import { SalaryPaycheck, constants } from 'dutch-tax-income-calculator'
import { PERIOD_MULTIPLIERS } from '../constants/box1Defaults.js'

/**
 * Available years supported by dutch-tax-income-calculator
 * Keep the existing 2019 lower bound while deriving new years from the package.
 */
export const BOX1_AVAILABLE_YEARS = constants.years
  .filter((year) => year >= 2019)
  .sort((a, b) => b - a)

export const BOX1_DEFAULT_YEAR = BOX1_AVAILABLE_YEARS[0] ?? 2026

/**
 * Map period values to SalaryPaycheck startFrom parameter
 */
const PERIOD_TO_START_FROM = {
  yearly: 'Year',
  monthly: 'Month',
  weekly: 'Week',
  daily: 'Day',
  hourly: 'Hour',
}

/**
 * Convert the user's input income to yearly based on the period
 * @param {number} income - The income amount entered by user
 * @param {string} period - The period (yearly, monthly, weekly, daily, hourly)
 * @param {number} hoursPerWeek - Hours worked per week (needed for hourly)
 * @returns {number} The annualized income
 */
function convertToYearlyIncome(income, period, hoursPerWeek) {
  if (!income || income <= 0) return 0

  const multiplier = PERIOD_MULTIPLIERS[period]
  if (multiplier === null) {
    // Hourly: hours per week * 52 weeks
    return income * hoursPerWeek * 52
  }
  return income * multiplier
}

/**
 * Custom hook for calculating Box 1 income tax using dutch-tax-income-calculator
 * Memoized to prevent unnecessary recalculations
 *
 * @param {Object} inputs - The tax calculation inputs
 * @param {number} inputs.grossIncome - Gross income (in the specified period)
 * @param {string} inputs.period - Income period (yearly, monthly, weekly, daily, hourly)
 * @param {number} inputs.hoursPerWeek - Hours worked per week
 * @param {boolean} inputs.holidayAllowanceIncluded - Whether holiday allowance is already included in gross income
 * @param {boolean} inputs.older - Whether the person is 66+ years old
 * @param {boolean} inputs.ruling30Enabled - Whether 30% ruling is enabled
 * @param {string} inputs.ruling30Category - 30% ruling category (researchWorker, youngProfessional, other)
 * @param {boolean} inputs.socialSecurity - Whether to include social security contributions
 * @param {number} year - Tax year
 * @returns {Object} Tax summary with detailed breakdown
 */
export function useBox1Calculator(inputs, year = BOX1_DEFAULT_YEAR) {
  const {
    grossIncome = 0,
    period = 'yearly',
    hoursPerWeek = 40,
    holidayAllowanceIncluded = true,
    older = false,
    ruling30Enabled = false,
    ruling30Category = 'other',
    socialSecurity = true,
  } = inputs ?? {}

  return useMemo(() => {
    // Return empty summary if no income
    if (!grossIncome || grossIncome <= 0) {
      return {
        taxableBase: 0,
        estimatedTax: 0,
        netIncome: 0,
        breakdown: [],
        details: null,
      }
    }

    try {
      // Get the startFrom parameter based on the period
      const startFrom = PERIOD_TO_START_FROM[period] || 'Year'

      // Map ruling30Category to the package's expected choice values
      // Package expects: 'normal', 'young', 'research'
      const rulingChoiceMap = {
        researchWorker: 'research',
        youngProfessional: 'young',
        other: 'normal',
      }

      const paycheck = new SalaryPaycheck(
        {
          income: Number(grossIncome),
          // If holiday allowance IS included in the input, tell the library to extract it
          // If holiday allowance is NOT included, the library shouldn't extract anything
          allowance: holidayAllowanceIncluded,
          socialSecurity,
          older,
          hours: hoursPerWeek,
        },
        startFrom,
        year,
        {
          checked: ruling30Enabled,
          choice: rulingChoiceMap[ruling30Category] || 'normal',
        }
      )

      // Calculate the yearly income for display purposes
      const yearlyInputIncome = convertToYearlyIncome(Number(grossIncome), period, hoursPerWeek)

      // Extract all relevant fields from the paycheck
      const details = {
        inputIncome: Number(grossIncome),
        inputPeriod: period,
        yearlyInputIncome,
        grossYear: paycheck.grossYear ?? 0,
        grossMonth: paycheck.grossMonth ?? 0,
        grossWeek: paycheck.grossWeek ?? 0,
        grossDay: paycheck.grossDay ?? 0,
        grossHour: paycheck.grossHour ?? 0,
        grossAllowance: paycheck.grossAllowance ?? 0,
        taxableYear: paycheck.taxableYear ?? 0,
        taxFree: paycheck.taxFree ?? 0,
        payrollTax: paycheck.payrollTax ?? 0,
        socialTax: paycheck.socialTax ?? 0,
        generalCredit: paycheck.generalCredit ?? 0,
        labourCredit: paycheck.labourCredit ?? 0,
        incomeTax: paycheck.incomeTax ?? 0,
        incomeTaxMonth: paycheck.incomeTaxMonth ?? 0,
        netYear: paycheck.netYear ?? 0,
        netMonth: paycheck.netMonth ?? 0,
        netWeek: paycheck.netWeek ?? 0,
        netDay: paycheck.netDay ?? 0,
        netHour: paycheck.netHour ?? 0,
        netAllowance: paycheck.netAllowance ?? 0,
      }

      // Build breakdown for display
      const breakdown = [
        {
          description: 'Gross annual income',
          amount: details.grossYear,
        },
        ...(details.grossAllowance > 0
          ? [
              {
                description: 'Holiday allowance (8%)',
                amount: details.grossAllowance,
              },
            ]
          : []),
        ...(details.taxFree > 0
          ? [
              {
                description: '30% ruling tax-free amount',
                amount: details.taxFree,
              },
            ]
          : []),
        {
          description: 'Taxable income',
          amount: details.taxableYear,
        },
        {
          description: 'Payroll tax',
          amount: details.payrollTax,
        },
        ...(socialSecurity
          ? [
              {
                description: 'Social security contributions',
                amount: details.socialTax,
              },
            ]
          : []),
        {
          description: 'General tax credit',
          amount: details.generalCredit,
        },
        {
          description: 'Labour tax credit',
          amount: details.labourCredit,
        },
        {
          description: 'Total income tax',
          amount: details.incomeTax,
        },
        {
          description: 'Net annual income',
          amount: details.netYear,
        },
      ]

      return {
        taxableBase: details.taxableYear,
        estimatedTax: Math.abs(details.incomeTax),
        netIncome: details.netYear,
        breakdown,
        details,
      }
    } catch (error) {
      console.error('[useBox1Calculator] Calculation error:', error)
      return {
        taxableBase: 0,
        estimatedTax: 0,
        netIncome: 0,
        breakdown: [],
        details: null,
        error: error.message,
      }
    }
  }, [
    grossIncome,
    period,
    hoursPerWeek,
    holidayAllowanceIncluded,
    older,
    ruling30Enabled,
    ruling30Category,
    socialSecurity,
    year,
  ])
}
