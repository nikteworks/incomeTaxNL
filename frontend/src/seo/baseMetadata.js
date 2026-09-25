import { languageCanonical } from '../utils/urlState.js'
import { pageCopy, PAGE_UPDATED_AT } from './pageCopy.js'

export function baseMetadata(language) {
  const copy = pageCopy[language]
  const canonical = languageCanonical(language)
  return {
    title: copy.title,
    canonical,
    links: [
      { rel: 'canonical', href: canonical },
      { rel: 'alternate', hreflang: 'en', href: languageCanonical('en') },
      { rel: 'alternate', hreflang: 'nl', href: languageCanonical('nl') },
      { rel: 'alternate', hreflang: 'x-default', href: languageCanonical('en') },
    ],
    metas: [
      { name: 'description', content: copy.description },
      { property: 'og:title', content: copy.title },
      { property: 'og:description', content: copy.description },
      { property: 'og:url', content: canonical },
      { property: 'og:locale', content: `${language}_NL` },
      { property: 'og:locale:alternate', content: language === 'nl' ? 'en_NL' : 'nl_NL' },
      { property: 'og:site_name', content: 'incomeTaxNL' },
      { property: 'og:type', content: 'website' },
    ],
    structuredData: {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication',
      '@id': `${canonical}#calculator`,
      name: 'incomeTaxNL', url: canonical, description: copy.description,
      isAccessibleForFree: true,
      mainEntityOfPage: {
        '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical,
        name: copy.title, description: copy.description, inLanguage: language,
        dateModified: PAGE_UPDATED_AT,
        isPartOf: {
          '@type': 'WebSite', '@id': 'https://incometax.nl/#website',
          name: 'incomeTaxNL', url: 'https://incometax.nl/', inLanguage: ['en', 'nl'],
        },
      },
      applicationCategory: 'FinanceApplication', operatingSystem: 'Web',
      inLanguage: language,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
  }
}
