import { languageCanonical } from '../utils/urlState.js'

export const pageCopy = {
  en: {
    title: 'Dutch Tax Calculator | Gross to Net Salary | incomeTaxNL',
    description: 'Estimate your Dutch net salary and tax on savings and investments. Use the Box 1 and Box 3 calculators in English or Dutch.',
    heading: 'Dutch Tax Calculator',
    introduction: 'Estimate your take-home pay with Box 1 and tax on savings and investments with Box 3. Choose a tax year and enter your figures to explore the calculation.',
    loading: 'Loading calculator…',
    noScript: 'Enable JavaScript to use the interactive calculator.',
  },
  nl: {
    title: 'Nederlandse Belastingcalculator | Bruto naar Netto | incomeTaxNL',
    description: 'Bereken een schatting van uw nettoloon en belasting over sparen en beleggen. Gebruik de Box 1- en Box 3-rekenhulpen in het Nederlands of Engels.',
    heading: 'Nederlandse Belastingcalculator',
    introduction: 'Bereken een schatting van uw nettoloon in Box 1 en de belasting over sparen en beleggen in Box 3. Kies een belastingjaar en vul uw gegevens in om de berekening te bekijken.',
    loading: 'Rekenhulp laden…',
    noScript: 'Schakel JavaScript in om de interactieve rekenhulp te gebruiken.',
  },
}

export function metadata(language) {
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
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: copy.title },
      { name: 'twitter:description', content: copy.description },
    ],
    structuredData: {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication',
      name: 'incomeTaxNL', url: canonical, description: copy.description,
      applicationCategory: 'FinanceApplication', operatingSystem: 'Web',
      inLanguage: language,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
  }
}

export function updateMetadata(language, document) {
  const data = metadata(language)
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
  const script = document.getElementById('page-structured-data') || document.createElement('script')
  script.id = 'page-structured-data'
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data.structuredData)
  if (!script.parentNode) document.head.append(script)
}
