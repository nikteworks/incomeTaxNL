import { lazy, Suspense } from 'react'
import { useHydrated } from '../hooks/useHydrated.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import FaqSection from './FaqSection.jsx'
import { pageCopy } from '../seo/metadata.js'

const TaxCalculator = lazy(() => import('../features/tax-calculator/index.jsx'))

export default function ClientCalculator() {
  const hydrated = useHydrated()
  const { language } = useLanguage()
  const fallback = <><p role="status">{pageCopy[language].loading}</p><FaqSection /></>
  return hydrated ? <Suspense fallback={fallback}><TaxCalculator /></Suspense> : fallback
}
