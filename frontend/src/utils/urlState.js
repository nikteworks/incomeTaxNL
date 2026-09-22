export const SUPPORTED_LANGUAGES = ['en', 'nl']
export const DEFAULT_LANGUAGE = 'en'

// A language is valid only when present once and exactly supported.
// Missing means English; empty, unsupported, and duplicate values normalize to en.
export function readLanguage(search) {
  const values = new URLSearchParams(search).getAll('lang')
  return values.length === 1 && SUPPORTED_LANGUAGES.includes(values[0])
    ? values[0]
    : DEFAULT_LANGUAGE
}

// All URL-state writers should patch only the keys they own. Preserve unknown
// keys, repeated values, calculation payloads and the fragment.
export function patchQuery(location, updates) {
  const params = new URLSearchParams(location.search)
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) params.delete(key)
    else params.set(key, value)
  }
  const search = params.toString()
  return { pathname: location.pathname, search: search ? `?${search}` : '', hash: location.hash }
}

export function normalizedLanguageLocation(location) {
  const values = new URLSearchParams(location.search).getAll('lang')
  if (!values.length || (values.length === 1 && SUPPORTED_LANGUAGES.includes(values[0]))) return null
  return patchQuery(location, { lang: DEFAULT_LANGUAGE })
}

export function languageLocation(location, language) {
  // English discovery links use its canonical URL; an explicit en alias remains valid.
  return patchQuery(location, { lang: language === 'en' ? null : language })
}

export function languageCanonical(language) {
  return `https://incometax.nl/${language === 'nl' ? '?lang=nl' : ''}`
}
