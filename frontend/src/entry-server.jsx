import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext.jsx'
import App from './app/App.jsx'
import { faqByLanguage } from './seo/faq.js'

export function render(language) {
  return renderToString(
    <StaticRouter location={language === 'nl' ? '/?lang=nl' : '/'}>
      <LanguageProvider><App initialFaq={faqByLanguage[language].mainEntity} /></LanguageProvider>
    </StaticRouter>,
  )
}
