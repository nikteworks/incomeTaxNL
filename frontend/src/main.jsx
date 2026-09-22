import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { LanguageProvider } from './context/LanguageContext.jsx'
import './styles/global.css'
import App from './app/App.jsx'

const app = (
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LanguageProvider><App /></LanguageProvider>} />
        <Route path="*" element={<main><h1>404 — Page not found</h1><a href="/">Return to calculator</a></main>} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </StrictMode>
)

const root = document.getElementById('root')
if (root.dataset.prerendered) hydrateRoot(root, app)
else createRoot(root).render(app)
