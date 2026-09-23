import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext.jsx'
import App from './app/App.jsx'

export function render(language) {
  return renderToString(
    <StaticRouter location={language === 'nl' ? '/?lang=nl' : '/'}>
      <LanguageProvider><App /></LanguageProvider>
    </StaticRouter>,
  )
}
