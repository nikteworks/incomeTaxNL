import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { LanguageProvider } from './context/LanguageContext.jsx'
import './styles/global.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LanguageProvider><App /></LanguageProvider>} />
        <Route path="*" element={<main><h1>404 — Page not found</h1><a href="/">Return to calculator</a></main>} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </StrictMode>,
)
