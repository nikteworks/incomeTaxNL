import PrimaryLayout from '../layouts/PrimaryLayout.jsx'
import ClientCalculator from '../components/ClientCalculator.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import PropTypes from 'prop-types'
import '../features/tax-calculator/components/GuidedRailCalculator.css'

function App({ initialFaq = null }) {
  return <ErrorBoundary><PrimaryLayout guided><ClientCalculator initialFaq={initialFaq} /></PrimaryLayout></ErrorBoundary>
}

App.propTypes = {
  initialFaq: PropTypes.array,
}

export default App
