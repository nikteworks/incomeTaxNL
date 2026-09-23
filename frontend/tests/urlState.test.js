import test from 'node:test'
import assert from 'node:assert/strict'
import { readCalculatorType, readLanguage, normalizedLanguageLocation, patchQuery, languageCanonical } from '../src/utils/urlState.js'

for (const [search, expected, normalize] of [
  ['', 'en', false], ['?lang=en', 'en', false], ['?lang=nl', 'nl', false],
  ['?lang=', 'en', true], ['?lang=fr', 'en', true], ['?lang=NL', 'en', true],
  ['?lang=nl&lang=en', 'en', true], ['?lang=nl&lang=nl', 'en', true],
]) {
  test(`language policy: ${search || '(missing)'}`, () => {
    assert.equal(readLanguage(search), expected)
    const result = normalizedLanguageLocation({ pathname: '/', search, hash: '#results' })
    assert.equal(Boolean(result), normalize)
    if (result) {
      assert.equal(result.hash, '#results')
      assert.equal(normalizedLanguageLocation(result), null)
      assert.deepEqual(new URLSearchParams(result.search).getAll('lang'), ['en'])
    }
  })
}

test('query patches compose and preserve complete opaque payloads and repeated keys', () => {
  const payload = JSON.stringify({ accounts: [{ name: '€ & + # café', amount: 0 }], enabled: false })
  const params = new URLSearchParams({ state: payload, v: '1', lang: 'nl', calcType: 'box3' })
  params.append('tag', 'a'); params.append('tag', 'b')
  const original = { pathname: '/', search: `?${params}`, hash: '#results' }
  const result = patchQuery(patchQuery(original, { lang: 'en' }), { calcType: 'box1' })
  const updated = new URLSearchParams(result.search)
  assert.equal(updated.get('state'), payload)
  assert.deepEqual(updated.getAll('tag'), ['a', 'b'])
  assert.equal(updated.get('lang'), 'en')
  assert.equal(updated.get('calcType'), 'box1')
  assert.equal(result.hash, '#results')
  assert.equal(new URLSearchParams(original.search).get('lang'), 'nl')
})

test('canonical URLs contain only language', () => {
  assert.equal(languageCanonical('en'), 'https://incometax.nl/')
  assert.equal(languageCanonical('nl'), 'https://incometax.nl/?lang=nl')
})

for (const [search, expected] of [
  ['', null], ['?calcType=box1', 'box1'], ['?calcType=box3', 'box3'],
  ['?calcType=', null], ['?calcType=BOX3', null], ['?calcType=unknown', null],
  ['?calcType=box3&calcType=box3', null], ['?calcType=box1&calcType=box3', null],
]) {
  test(`calculator URL policy: ${search || '(missing)'}`, () => {
    assert.equal(readCalculatorType(search), expected)
  })
}
