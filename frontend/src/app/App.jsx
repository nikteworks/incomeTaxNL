import PrimaryLayout from '../layouts/PrimaryLayout.jsx'
import ClientCalculator from '../components/ClientCalculator.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

function App() {
  return (
    <ErrorBoundary>
      <PrimaryLayout>
        <ClientCalculator />
      </PrimaryLayout>
    </ErrorBoundary>
  )
}

export default App
