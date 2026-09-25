const faqModules = {
  en: () => import('../content/faq-2026.en.json', { with: { type: 'json' } }),
  nl: () => import('../content/faq-2026.nl.json', { with: { type: 'json' } }),
}

export function loadFaq(language) {
  return faqModules[language]().then((module) => module.default)
}

export function readPrerenderedFaq(language, document) {
  const script = document?.getElementById('faq-structured-data')
  if (!script) return null
  try {
    const data = JSON.parse(script.textContent)
    return data.inLanguage === language ? data.mainEntity : null
  } catch {
    return null
  }
}
