import { lazy, Suspense } from 'react'
import PropTypes from 'prop-types'
import { useHydrated } from '../hooks/useHydrated.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import FaqSection from './FaqSection.jsx'
import { pageCopy } from '../seo/pageCopy.js'

const TaxCalculator = lazy(() => import('../features/tax-calculator/index.jsx'))

export default function ClientCalculator({ initialFaq }) {
  const hydrated = useHydrated()
  const { language } = useLanguage()
  const fallback = <><p role="status">{pageCopy[language].loading}</p><FaqSection initialFaq={initialFaq} /></>
  return hydrated ? <Suspense fallback={fallback}><TaxCalculator /></Suspense> : fallback
}

ClientCalculator.propTypes = {
  initialFaq: PropTypes.array,
}
