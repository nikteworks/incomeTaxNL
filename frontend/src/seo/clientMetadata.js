import { baseMetadata } from './baseMetadata.js'
import { loadFaq } from './faqClient.js'

export function updateMetadata(language, document) {
  const data = baseMetadata(language)
  document.documentElement.lang = language
  document.title = data.title
  for (const [tag, entries] of [['link', data.links], ['meta', data.metas]]) {
    for (const attributes of entries) {
      const selector = tag === 'link'
        ? `link[rel="${attributes.rel}"]${attributes.hreflang ? `[hreflang="${attributes.hreflang}"]` : ''}`
        : `meta[${attributes.name ? 'name' : 'property'}="${attributes.name || attributes.property}"]`
      const matches = [...document.head.querySelectorAll(selector)]
      const element = matches.shift() || document.createElement(tag)
      matches.forEach((duplicate) => duplicate.remove())
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
      if (!element.parentNode) document.head.append(element)
    }
  }
  const pageScript = document.getElementById('page-structured-data') || document.createElement('script')
  pageScript.id = 'page-structured-data'
  pageScript.type = 'application/ld+json'
  pageScript.textContent = JSON.stringify(data.structuredData)
  if (!pageScript.parentNode) document.head.append(pageScript)

  const faqScript = document.getElementById('faq-structured-data')
  if (faqScript) {
    try {
      if (JSON.parse(faqScript.textContent).inLanguage === language) return
    } catch { /* Replace malformed structured data below. */ }
  }
  loadFaq(language).then((faq) => {
    if (document.documentElement.lang !== language) return
    const script = document.getElementById('faq-structured-data') || document.createElement('script')
    script.id = 'faq-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      ...faq,
      '@id': `${data.canonical}#faq`,
      url: data.canonical,
      isPartOf: { '@id': `${data.canonical}#webpage` },
    })
    if (!script.parentNode) document.head.append(script)
  })
}
