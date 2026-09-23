import { languageCanonical } from '../utils/urlState.js'

export const pageCopy = {
  en: {
    title: 'Netherlands Salary & Tax Calculator | incomeTaxNL',
    description: 'Estimate Dutch gross-to-net salary with holiday allowance and 30% ruling inputs, or Box 3 tax on savings and investments. Choose your tax year.',
    heading: 'Netherlands salary & tax calculator',
    introduction: 'Estimate gross-to-net salary in Box 1 (2019–2026), or savings and investment tax in Box 3 (2023–2026). Enter salary per year, month, week, day or hour.',
    loading: 'Loading calculator…',
    noScript: 'Enable JavaScript to use the interactive calculator.',
  },
  nl: {
    title: 'Bruto-netto salaris en belasting berekenen | incomeTaxNL',
    description: 'Bereken uw nettoloon met vakantiegeld en de 30%-regeling, of schat uw Box 3-belasting over sparen en beleggen. Kies het gewenste belastingjaar.',
    heading: 'Bruto-netto salaris en belasting berekenen',
    introduction: 'Schat uw nettoloon in Box 1 (2019–2026), of uw belasting over sparen en beleggen in Box 3 (2023–2026). Vul uw salaris per jaar, maand, week, dag of uur in.',
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
