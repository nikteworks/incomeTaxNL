import { baseMetadata } from './baseMetadata.js'
import { faqByLanguage } from './faq.js'

export { pageCopy, PAGE_UPDATED_AT } from './pageCopy.js'

// Server-only metadata keeps the full FAQ in the prerendered HTML and JSON-LD.
export function metadata(language) {
  const data = baseMetadata(language)
  return {
    ...data,
    faqStructuredData: {
      ...faqByLanguage[language],
      '@id': `${data.canonical}#faq`,
      url: data.canonical,
      isPartOf: { '@id': `${data.canonical}#webpage` },
    },
  }
}
