import PrimaryLayout from '../layouts/PrimaryLayout.jsx'
import ClientCalculator from '../components/ClientCalculator.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import '../features/tax-calculator/components/GuidedRailCalculator.css'

function App() {
  return <ErrorBoundary><PrimaryLayout guided><ClientCalculator /></PrimaryLayout></ErrorBoundary>
}

export default App
