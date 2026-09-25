import { useState, useMemo, useCallback, useEffect } from 'react'
import GuidedRailCalculator from './GuidedRailCalculator.jsx'
import { annualIncome, assetInputs, changeSalaryField, validBox3Config } from '../utils/calculatorState.js'
import { INCOME_PERIODS, RULING_30_CATEGORIES } from '../constants/box1Defaults.js'
import { useBox3Calculator } from '../hooks/useBox3Calculator.js'
import { BOX1_EMPTY_FORM } from '../constants/box1Defaults.js'
import {
  useBox1Calculator,
  BOX1_AVAILABLE_YEARS,
  BOX1_DEFAULT_YEAR,
} from '../hooks/useBox1Calculator.js'
import { AVAILABLE_YEARS, DEFAULT_YEAR, getDefaultsForYear } from 'dutch-tax-box3-calculator'
import { useQueryState } from '../../../hooks/useQueryState.js'
import { readCalculatorType } from '../../../utils/urlState.js'
import { storage, STORAGE_KEYS } from '../../../utils/storage.js'
const BOX3_EMPTY_FORM = {
  bankAccounts: [],
  investmentAccounts: [],
  debts: [],
  hasTaxPartner: false,
}

/**
 * Load initial box type from localStorage, falling back to 'box1'.
 */
const getInitialBoxType = () => {
  const saved = storage.get(STORAGE_KEYS.SELECTED_BOX_TYPE)
  return saved === 'box1' || saved === 'box3' ? saved : 'box1'
}

/**
 * Load initial Box 3 form values from localStorage, falling back to empty form.
 */
const getInitialBox3FormValues = () => {
  const saved = storage.get(STORAGE_KEYS.FORM_VALUES)
  if (saved && typeof saved === 'object') {
    return {
      bankAccounts: Array.isArray(saved.bankAccounts) ? saved.bankAccounts : [],
      investmentAccounts: Array.isArray(saved.investmentAccounts) ? saved.investmentAccounts : [],
      debts: Array.isArray(saved.debts) ? saved.debts : [],
      hasTaxPartner: Boolean(saved.hasTaxPartner),
    }
  }
  return BOX3_EMPTY_FORM
}

/**
 * Load initial Box 1 form values from localStorage, falling back to empty form.
 */
const getInitialBox1FormValues = () => {
  const saved = storage.get(STORAGE_KEYS.BOX1_FORM_VALUES)
  if (saved && typeof saved === 'object') {
    return {
      grossIncome: typeof saved.grossIncome === 'number' ? saved.grossIncome : '',
      annualIncome: saved.annualIncome,
      period: INCOME_PERIODS.some(item => item.value === saved.period) ? saved.period : 'yearly',
      hoursPerWeek: typeof saved.hoursPerWeek === 'number' ? saved.hoursPerWeek : 40,
      holidayAllowanceIncluded: saved.holidayAllowanceIncluded !== false, // default to true
      older: Boolean(saved.older),
      ruling30Enabled: Boolean(saved.ruling30Enabled),
      ruling30Category: RULING_30_CATEGORIES.some(item => item.value === saved.ruling30Category) ? saved.ruling30Category : 'other',
      socialSecurity: saved.socialSecurity !== false, // default to true
    }
  }
  return BOX1_EMPTY_FORM
}

/**
 * Load initial year from localStorage, falling back to default.
 */
const getInitialBox3Year = () => {
  const saved = storage.get(STORAGE_KEYS.BOX3_SELECTED_YEAR)
  return AVAILABLE_YEARS.includes(saved) ? saved : DEFAULT_YEAR
}

const getInitialBox1Year = () => {
  const saved = storage.get(STORAGE_KEYS.BOX1_SELECTED_YEAR)
  if (typeof saved === 'number' && BOX1_AVAILABLE_YEARS.includes(saved)) {
    return saved
  }
  return BOX1_DEFAULT_YEAR
}

/**
 * Load initial box3 config from localStorage, falling back to defaults.
 */
const getInitialBox3Config = () => {
  const saved = storage.get(STORAGE_KEYS.BOX3_CONFIG)
  if (AVAILABLE_YEARS.includes(saved?.year) && validBox3Config(saved)) return saved
  const savedYear = getInitialBox3Year()
  const yearDefaults = getDefaultsForYear(savedYear)
  return { year: savedYear, ...yearDefaults }
}

const usePersistedValue = (key, value) => {
  useEffect(() => { storage.set(key, value) }, [key, value])
}

function TaxCalculatorShell() {
  // Box type state (box1 or box3)
  const { location, updateQuery } = useQueryState()
  const [savedBoxType] = useState(getInitialBoxType)
  const boxType = readCalculatorType(location.search) ?? savedBoxType

  useEffect(() => {
    if (new URLSearchParams(location.search).has('calcType') && !readCalculatorType(location.search)) {
      updateQuery({ calcType: null }, { replace: true })
    }
  }, [location.search, updateQuery])
  
  // Box 3 state
  const [box3FormValues, setBox3FormValues] = useState(getInitialBox3FormValues)
  const [box3Config, setBox3Config] = useState(getInitialBox3Config)
  const box3SelectedYear = box3Config.year
  
  // Box 1 state
  const [box1FormValues, setBox1FormValues] = useState(getInitialBox1FormValues)
  const [box1SelectedYear, setBox1SelectedYear] = useState(getInitialBox1Year)

  usePersistedValue(STORAGE_KEYS.BOX3_CONFIG, box3Config)
  usePersistedValue(STORAGE_KEYS.SELECTED_BOX_TYPE, boxType)
  usePersistedValue(STORAGE_KEYS.FORM_VALUES, box3FormValues)
  usePersistedValue(STORAGE_KEYS.BOX1_FORM_VALUES, box1FormValues)
  usePersistedValue(STORAGE_KEYS.BOX3_SELECTED_YEAR, box3SelectedYear)
  usePersistedValue(STORAGE_KEYS.BOX1_SELECTED_YEAR, box1SelectedYear)

  // Box type change handler
  const handleBoxTypeChange = useCallback((_event, newBoxType) => {
    if (newBoxType !== null) {
      updateQuery({ calcType: newBoxType })
    }
  }, [updateQuery])

  // Box 3 handlers
  const handleBox3FieldChange = useCallback((name, value) => {
    setBox3FormValues((current) => ({ ...current, [name]: value }))
  }, [])

  const handleBox3YearChange = useCallback((newYear) => {
    // Update config with the new year's defaults
    const yearDefaults = getDefaultsForYear(newYear)
    setBox3Config({ year: newYear, ...yearDefaults })
  }, [])

  const handleBox3Reset = useCallback(() => {
    setBox3FormValues(BOX3_EMPTY_FORM)
    const yearDefaults = getDefaultsForYear(DEFAULT_YEAR)
    setBox3Config({ year: DEFAULT_YEAR, ...yearDefaults })
  }, [])

  // Box 1 handlers
  const handleBox1FieldChange = useCallback((name, value) => {
    setBox1FormValues((current) => changeSalaryField(current, name, value))
  }, [])

  const handleBox1YearChange = useCallback((newYear) => {
    setBox1SelectedYear(newYear)
  }, [])

  const handleBox1Reset = useCallback(() => {
    setBox1FormValues(BOX1_EMPTY_FORM)
    setBox1SelectedYear(BOX1_DEFAULT_YEAR)
  }, [])

  const box3CalculatorInputs = useMemo(() => assetInputs(box3FormValues), [box3FormValues])

  const box3Summary = useBox3Calculator(box3CalculatorInputs, box3Config)

  const box1Summary = useBox1Calculator(box1FormValues, box1SelectedYear)
  const hasAssets = ['bankAccounts', 'investmentAccounts', 'debts'].some(key => box3FormValues[key].length > 0)
  const salaryEmpty = box1FormValues.grossIncome === ''
  const salaryInvalid = !salaryEmpty && (!box1Summary.details || annualIncome(box1FormValues) <= 0)

  return <GuidedRailCalculator
    mode={boxType} onModeChange={mode => handleBoxTypeChange(null, mode)}
    salary={box1FormValues} salaryYear={box1SelectedYear} salarySummary={box1Summary}
    salaryStatus={salaryEmpty ? 'emptySalary' : salaryInvalid ? 'invalidSalary' : null}
    onSalaryChange={handleBox1FieldChange} onSalaryYearChange={handleBox1YearChange} onSalaryReset={handleBox1Reset}
    assets={box3FormValues} assetInputs={box3CalculatorInputs} assetSummary={hasAssets ? box3Summary : null}
    assetStatus={!box3Summary ? 'invalidAssets' : !hasAssets ? 'emptyAssets' : null}
    config={box3Config} onConfigChange={setBox3Config}
    onAssetChange={handleBox3FieldChange} onAssetYearChange={handleBox3YearChange} onAssetReset={handleBox3Reset}
  />
}

export default TaxCalculatorShell
