import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { LanguageProvider } from './context/LanguageContext.jsx'
import './styles/global.css'
import App from './app/App.jsx'
import { readPrerenderedFaq } from './seo/faqClient.js'
import { readLanguage } from './utils/urlState.js'

const root = document.getElementById('root')
const initialFaq = readPrerenderedFaq(readLanguage(window.location.search), document)
const appWithFaq = (
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LanguageProvider><App initialFaq={initialFaq} /></LanguageProvider>} />
        <Route path="*" element={<main><h1>404 — Page not found</h1><a href="/">Return to calculator</a></main>} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </StrictMode>
)
if (root.dataset.prerendered) hydrateRoot(root, appWithFaq)
else createRoot(root).render(appWithFaq)
