import PrimaryLayout from '../layouts/PrimaryLayout.jsx'
import ClientCalculator from '../components/ClientCalculator.jsx'
import CalculationExplanation from '../features/tax-calculator/components/CalculationExplanation.jsx'
import FaqSection from '../components/FaqSection.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

function App() {
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
