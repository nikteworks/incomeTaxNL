import { createContext, useContext, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryState } from '../hooks/useQueryState.js'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, readLanguage, normalizedLanguageLocation, languageLocation } from '../utils/urlState.js'
import { updateMetadata } from '../seo/clientMetadata.js'
import PropTypes from 'prop-types'
import en from '../locales/en.json'
import nl from '../locales/nl.json'

const translations = { en, nl }

const LanguageContext = createContext(null)

/**
 * Get nested value from object using dot notation
 * e.g., get(obj, 'box1Form.grossIncome')
 */
function get(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function LanguageProvider({ children }) {
  const { location, updateQuery } = useQueryState()
  const navigate = useNavigate()
  const language = readLanguage(location.search)

  useEffect(() => {
    const normalized = normalizedLanguageLocation(location)
    if (normalized) navigate(normalized, { replace: true })
  }, [location, navigate])

  useEffect(() => {
    updateMetadata(language, document)
  }, [language])

  // Translation function
  const t = useCallback((key, fallback) => {
    const value = get(translations[language], key)
    if (value !== undefined) return value
    // Fallback to English if key not found in current language
    const fallbackValue = get(translations[DEFAULT_LANGUAGE], key)
    return fallbackValue ?? fallback ?? key
  }, [language])

  // Switch language and navigate to new URL
  const switchLanguage = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return
    updateQuery({ lang: newLang === 'en' ? null : newLang })
  }, [updateQuery])

  const languageHref = useCallback((newLang) => languageLocation(location, newLang), [location])

  // Toggle between languages
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'nl' : 'en'
    switchLanguage(newLang)
  }, [language, switchLanguage])

  // Locale for number formatting (en-NL for English, nl-NL for Dutch)
  const locale = language === 'nl' ? 'nl-NL' : 'en-NL'

  const value = useMemo(() => ({
    language,
    locale,
    t,
    switchLanguage,
    toggleLanguage,
    languageHref,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [language, locale, t, switchLanguage, toggleLanguage, languageHref])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

// The existing public context API intentionally exports its consumer hook.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
