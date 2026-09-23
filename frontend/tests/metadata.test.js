import test from 'node:test'
import assert from 'node:assert/strict'
import { metadata } from '../src/seo/metadata.js'
import { faqByLanguage } from '../src/seo/faq.js'
import middleware from '../../middleware.js'

for (const [search, language] of [['', 'en'], ['?lang=en', 'en'], ['?lang=nl', 'nl'], ['?lang=nl&lang=en', 'en'], ['?lang=nl&lang=nl', 'en'], ['?lang=xx', 'en'], ['?lang=', 'en']]) {
  test(`middleware selects the correct isolated static target: ${search}`, () => {
    const url = new URL(`https://incometax.nl/${search}`)
    url.searchParams.append('state', '<private & data>')
    const result = middleware(new Request(url, { headers: { cookie: 'lang=nl', 'accept-language': 'nl', 'user-agent': 'Googlebot' } }))
    assert.equal(result.headers.get('x-middleware-rewrite'), `https://incometax.nl/localized/${language}.html`)
  })
}

test('canonical and all discovery metadata are parameter-free except Dutch language', () => {
  for (const language of ['en', 'nl']) {
    const data = metadata(language)
    assert.equal(data.canonical, language === 'nl' ? 'https://incometax.nl/?lang=nl' : 'https://incometax.nl/')
    assert.deepEqual(data.links.filter((link) => link.rel === 'alternate').map((link) => [link.hreflang, link.href]), [
      ['en', 'https://incometax.nl/'], ['nl', 'https://incometax.nl/?lang=nl'], ['x-default', 'https://incometax.nl/'],
    ])
    assert.equal(data.structuredData.url, data.canonical)
    assert.equal(data.faqStructuredData.url, data.canonical)
    assert.equal(data.faqStructuredData.inLanguage, language)
    assert.deepEqual(data.faqStructuredData.mainEntity, faqByLanguage[language].mainEntity)
    assert.equal(data.faqStructuredData.mainEntity.length, 216)
    assert.equal('aggregateRating' in data.structuredData, false)
    assert.equal('image' in data.structuredData, false)
    assert.equal(data.metas.some((meta) => /image|rating/i.test(meta.name || meta.property)), false)
  }
})

test('direct artifact requests redirect before rendering, preserving state', () => {
  const result = middleware(new Request('https://incometax.nl/localized/nl.html?state=abc&lang=en'))
  assert.equal(result.status, 308)
  assert.equal(result.headers.get('location'), 'https://incometax.nl/?state=abc&lang=nl')
})
