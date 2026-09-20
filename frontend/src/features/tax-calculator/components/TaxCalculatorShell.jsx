import { useState, useMemo, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import Box3InputForm from './Box3InputForm.jsx'
import Box1InputForm from './Box1InputForm.jsx'
import CalculatorToggleSwitch from './CalculatorToggleSwitch.jsx'
import CalculationExplanation from './CalculationExplanation.jsx'
import { useBox3Calculator } from '../hooks/useBox3Calculator.js'
import { BOX1_EMPTY_FORM } from '../constants/box1Defaults.js'
import {
  useBox1Calculator,
  BOX1_AVAILABLE_YEARS,
  BOX1_DEFAULT_YEAR,
} from '../hooks/useBox1Calculator.js'
import { BOX3_DEFAULTS, DEFAULT_YEAR, getDefaultsForYear } from 'dutch-tax-box3-calculator'
import { storage, STORAGE_KEYS } from '../../../utils/storage.js'
import './TaxCalculatorShell.css'
import './CalculatorToggleSwitch.css'
import './CalculationExplanation.css'

// Lazy load components for better initial bundle size
const ConfigurationMenu = lazy(() => import('./ConfigurationMenu.jsx'))
const Box3ResultPanel = lazy(() => import('./Box3ResultPanel.jsx'))
const Box1ResultPanel = lazy(() => import('./Box1ResultPanel.jsx'))

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
      period: saved.period || 'yearly',
      hoursPerWeek: typeof saved.hoursPerWeek === 'number' ? saved.hoursPerWeek : 40,
      holidayAllowanceIncluded: saved.holidayAllowanceIncluded !== false, // default to true
      older: Boolean(saved.older),
      ruling30Enabled: Boolean(saved.ruling30Enabled),
      ruling30Category: saved.ruling30Category || 'other',
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
  return typeof saved === 'number' ? saved : DEFAULT_YEAR
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
  const savedYear = getInitialBox3Year()
  const yearDefaults = getDefaultsForYear(savedYear)
  return { year: savedYear, ...yearDefaults }
}

const useDebouncedStorage = (key, value, delay = 250) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      storage.set(key, value)
    }, delay)
    return () => clearTimeout(handler)
  }, [key, value, delay])
}

function TaxCalculatorShell() {
  // Refs for scroll navigation
  const inputPanelRef = useRef(null)
  const resultsPanelRef = useRef(null)
  
  // Track if user has scrolled to results (for showing 'Go to Top' button)
  const [showGoToTop, setShowGoToTop] = useState(false)
  
  // Scroll event handler to determine which button to show
  useEffect(() => {
    const handleScroll = () => {
      if (resultsPanelRef.current) {
        const resultsRect = resultsPanelRef.current.getBoundingClientRect()
        // Show 'Go to Top' when results panel is mostly in view (top half of viewport)
        setShowGoToTop(resultsRect.top < window.innerHeight / 2)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Scroll to results panel
  const scrollToResults = useCallback(() => {
    resultsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  
  // Scroll to top (input panel)
  const scrollToTop = useCallback(() => {
    inputPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  
  // Box type state (box1 or box3)
  const [boxType, setBoxType] = useState(getInitialBoxType)
  
  // Box 3 state
  const [box3FormValues, setBox3FormValues] = useState(getInitialBox3FormValues)
  const [box3SelectedYear, setBox3SelectedYear] = useState(getInitialBox3Year)
  const [box3Config, setBox3Config] = useState(getInitialBox3Config)
  
  // Box 1 state
  const [box1FormValues, setBox1FormValues] = useState(getInitialBox1FormValues)
  const [box1SelectedYear, setBox1SelectedYear] = useState(getInitialBox1Year)

  useDebouncedStorage(STORAGE_KEYS.SELECTED_BOX_TYPE, boxType)
  useDebouncedStorage(STORAGE_KEYS.FORM_VALUES, box3FormValues)
  useDebouncedStorage(STORAGE_KEYS.BOX1_FORM_VALUES, box1FormValues)
  useDebouncedStorage(STORAGE_KEYS.BOX3_SELECTED_YEAR, box3SelectedYear)
  useDebouncedStorage(STORAGE_KEYS.BOX1_SELECTED_YEAR, box1SelectedYear)

  // Box type change handler
  const handleBoxTypeChange = useCallback((_event, newBoxType) => {
    if (newBoxType !== null) {
      setBoxType(newBoxType)
    }
  }, [])

  // Box 3 handlers
  const handleBox3FieldChange = useCallback((name, value) => {
    setBox3FormValues((current) => ({ ...current, [name]: value }))
  }, [])

  const handleBox3YearChange = useCallback((newYear) => {
    setBox3SelectedYear(newYear)
    // Update config with the new year's defaults
    const yearDefaults = getDefaultsForYear(newYear)
    setBox3Config({ year: newYear, ...yearDefaults })
  }, [])

  const handleBox3Reset = useCallback(() => {
    setBox3FormValues(BOX3_EMPTY_FORM)
    setBox3SelectedYear(DEFAULT_YEAR)
    const yearDefaults = getDefaultsForYear(DEFAULT_YEAR)
    setBox3Config({ year: DEFAULT_YEAR, ...yearDefaults })
  }, [])

  // Box 1 handlers
  const handleBox1FieldChange = useCallback((name, value) => {
    setBox1FormValues((current) => ({ ...current, [name]: value }))
  }, [])

  const handleBox1YearChange = useCallback((newYear) => {
    setBox1SelectedYear(newYear)
  }, [])

  const handleBox1Reset = useCallback(() => {
    setBox1FormValues(BOX1_EMPTY_FORM)
    setBox1SelectedYear(BOX1_DEFAULT_YEAR)
  }, [])

  // Box 3: Memoize calculated values to prevent unnecessary recalculations
  const bankBalance = useMemo(
    () =>
      (box3FormValues.bankAccounts ?? []).reduce(
        (sum, entry) => sum + (Number(entry?.amount ?? entry) || 0),
        0,
      ),
    [box3FormValues.bankAccounts],
  )

  const investmentAssets = useMemo(
    () =>
      (box3FormValues.investmentAccounts ?? []).reduce(
        (sum, entry) => sum + (Number(entry?.amount ?? entry) || 0),
        0,
      ),
    [box3FormValues.investmentAccounts],
  )

  const debts = useMemo(
    () =>
      (box3FormValues.debts ?? []).reduce(
        (sum, entry) => sum + (Number(entry?.amount ?? entry) || 0),
        0,
      ),
    [box3FormValues.debts],
  )

  // Box 3: Memoize calculator inputs to ensure stable reference for useBox3Calculator
  const box3CalculatorInputs = useMemo(
    () => ({
      bankBalance,
      investmentAssets,
      debts,
      hasTaxPartner: box3FormValues.hasTaxPartner,
    }),
    [bankBalance, investmentAssets, debts, box3FormValues.hasTaxPartner],
  )

  const box3Summary = useBox3Calculator(box3CalculatorInputs, box3Config)

  // Box 1: Memoize calculator inputs
  const box1CalculatorInputs = useMemo(
    () => ({
      grossIncome: Number(box1FormValues.grossIncome) || 0,
      period: box1FormValues.period,
      hoursPerWeek: box1FormValues.hoursPerWeek,
      holidayAllowanceIncluded: box1FormValues.holidayAllowanceIncluded,
      older: box1FormValues.older,
      ruling30Enabled: box1FormValues.ruling30Enabled,
      ruling30Category: box1FormValues.ruling30Category,
      socialSecurity: box1FormValues.socialSecurity,
    }),
    [box1FormValues],
  )

  const box1Summary = useBox1Calculator(box1CalculatorInputs, box1SelectedYear)


  return (
    <section className="calculator-shell">
      <header className="calculator-shell__header">
        <div className="calculator-shell__title-row">
          {/* Title removed as requested */}
        </div>
        <div className="calculator-shell__tool-desc">
          {/* Description removed as requested */}
        </div>
      </header>
      <div className="calculator-shell__content">
        <div className="calculator-panel" ref={inputPanelRef}>
          {/* Toggle switch above the input panel */}
          <CalculatorToggleSwitch value={boxType} onChange={handleBoxTypeChange} />
          {boxType === 'box1' ? (
            <Box1InputForm
              values={box1FormValues}
              onChange={handleBox1FieldChange}
              year={box1SelectedYear}
              onYearChange={handleBox1YearChange}
              onReset={handleBox1Reset}
            />
          ) : (
            <Box3InputForm
              values={box3FormValues}
              onChange={handleBox3FieldChange}
              year={box3SelectedYear}
              onYearChange={handleBox3YearChange}
              onReset={handleBox3Reset}
              configMenu={
                <Suspense fallback={<div className="config-menu-placeholder" />}>
                  <ConfigurationMenu config={box3Config} onConfigChange={setBox3Config} />
                </Suspense>
              }
            />
          )}
        </div>
        <div className="calculator-panel calculator-panel--results" ref={resultsPanelRef}>
          <Suspense fallback={<div className="results-panel-placeholder">Loading results...</div>}>
            {boxType === 'box1' ? (
              <Box1ResultPanel
                inputs={box1CalculatorInputs}
                summary={box1Summary}
                year={box1SelectedYear}
              />
            ) : (
              <Box3ResultPanel
                inputs={box3CalculatorInputs}
                summary={box3Summary}
                config={box3Config}
              />
            )}
          </Suspense>
        </div>
      </div>
      
      <CalculationExplanation
        boxType={boxType}
        box1Inputs={box1CalculatorInputs}
        box1Summary={box1Summary}
        box3Inputs={box3CalculatorInputs}
        box3Summary={box3Summary}
        box3Config={box3Config}
      />
      {/* Remove old footer switch buttons, toggle is now above input panel */}
      
      {/* Floating navigation button for mobile */}
      <button
        className={`floating-nav-btn ${showGoToTop ? 'floating-nav-btn--top' : 'floating-nav-btn--results'}`}
        onClick={showGoToTop ? scrollToTop : scrollToResults}
        aria-label={showGoToTop ? 'Go to top' : 'Go to results'}
      >
        <span className="floating-nav-btn__icon">{showGoToTop ? '↑' : '↓'}</span>
        <span className="floating-nav-btn__text">{showGoToTop ? 'Go to Top' : 'See Results'}</span>
      </button>
    </section>
  )
}

export default TaxCalculatorShell
