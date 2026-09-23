import PrimaryLayout from '../layouts/PrimaryLayout.jsx'
import ClientCalculator from '../components/ClientCalculator.jsx'
import CalculationExplanation from '../features/tax-calculator/components/CalculationExplanation.jsx'
import FaqSection from '../components/FaqSection.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'

// This review surface is excluded from production builds.
const GuidedRailPreview = import.meta.env.DEV
  ? lazy(() => import('../features/tax-calculator/components/GuidedRailPreview.jsx'))
  : null

function App() {
  const { search } = useLocation()
  if (GuidedRailPreview && new URLSearchParams(search).get('preview') === 'guided-rail') {
    return <ErrorBoundary><Suspense fallback={null}><GuidedRailPreview /></Suspense></ErrorBoundary>
  }
  return (
    <ErrorBoundary>
      <PrimaryLayout>
        <ClientCalculator />
        <CalculationExplanation />
        <FaqSection />
      </PrimaryLayout>
    </ErrorBoundary>
  )
}

export default App
