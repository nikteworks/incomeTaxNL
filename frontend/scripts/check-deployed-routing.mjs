import assert from 'node:assert/strict'

// Run against the deployment AFTER #21 and #22 ship together. No production writes.
const base = new URL(process.env.ROUTING_BASE_URL || 'https://incometax.nl')
const www = process.env.ROUTING_WWW_URL || (base.hostname === 'incometax.nl' ? 'https://www.incometax.nl' : null)
const payload = JSON.stringify({ name: 'é & + #', amount: 0, enabled: false })
const query = new URLSearchParams({ lang: 'xx', calcType: 'box3', v: '1', state: payload })
query.append('lang', 'en')
query.append('tag', 'a'); query.append('tag', 'b')

async function request(url) {
  return fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
}

for (const origin of [base.origin, www].filter(Boolean)) {
  for (const language of ['en', 'nl']) {
    for (const slash of ['', '/']) {
      const response = await request(`${origin}/${language}${slash}?${query}`)
      assert.equal(response.status, 308, `${origin}/${language}${slash} must permanently redirect`)
      let target = new URL(response.headers.get('location'), origin)
      // Vercel's domain-level www redirect runs before repository redirects.
      // That makes old www language URLs two hops, while other URLs stay one.
      if (origin === www && target.pathname === `/${language}${slash}`) {
        assert.equal(target.origin, base.origin, 'www first normalizes to apex')
        assert.deepEqual([...target.searchParams], [...query], 'www hop preserves query values')
        const legacy = await request(target)
        assert.equal(legacy.status, 308, 'apex legacy URL then permanently redirects')
        target = new URL(legacy.headers.get('location'), base.origin)
      }
      assert.equal(target.origin, base.origin, 'final redirect targets apex')
      assert.equal(target.pathname, '/')
      assert.deepEqual(target.searchParams.getAll('lang'), [language], 'path language wins, duplicates removed')
      for (const key of ['calcType', 'v', 'state', 'tag']) {
        assert.deepEqual(target.searchParams.getAll(key), query.getAll(key), `${key} preserved`)
      }
      assert.equal((await request(target)).status, 200, 'no additional redirect')
      console.log(`PASS ${origin}/${language}${slash}`)
    }
  }
}
for (const path of ['/', '/?lang=en', '/?lang=nl', `/?${query}`]) {
  assert.equal((await request(new URL(path, base))).status, 200, path)
}
for (const path of ['/missing-page', '/nl/missing-page', '/en/missing-page', '/fr']) {
  assert.equal((await request(new URL(path, base))).status, 404, path)
}
if (www) {
  const response = await request(`${www}/?${query}`)
  assert.equal(response.status, 308)
  assert.equal(response.headers.get('location'), `${base.origin}/?${query}`)
  const unknown = await request(`${www}/missing-page?${query}`)
  assert.equal(unknown.status, 308)
  assert.equal((await request(new URL(unknown.headers.get('location'), www))).status, 404)
}
console.log('PASS deployed language routes, preserved queries, www normalization and genuine 404s')

// Repeated, alternating requests exercise the deployment's cache selection.
for (const [path, language] of [
  ['/', 'en'], ['/?lang=nl', 'nl'], ['/?lang=en', 'en'], ['/?lang=nl', 'nl'],
  ['/?lang=nl&lang=en', 'en'], ['/?lang=nl&calcType=box3&v=1&state=PRIVATE_TEST_VALUE&utm_source=release-check', 'nl'],
]) {
  const response = await request(new URL(path, base))
  assert.equal(response.status, 200)
  const html = await response.text()
  const canonical = language === 'nl' ? 'https://incometax.nl/?lang=nl' : 'https://incometax.nl/'
  assert.ok(html.includes(`<html lang="${language}">`), `${path}: initial HTML language`)
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`), `${path}: initial canonical`)
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1)
  assert.equal((html.match(/rel="alternate"/g) || []).length, 3)
  assert.ok(html.includes(language === 'nl' ? 'Nederlandse Belastingcalculator' : 'Dutch Tax Calculator'))
  assert.ok(html.includes('<h1>'), 'visible initial heading')
  assert.ok(!html.includes('PRIVATE_TEST_VALUE') && !html.includes('utm_source'), 'no request state in HTML')
  console.log(`PASS initial ${language} HTML; status=${response.status}; cache=${response.headers.get('x-vercel-cache') || 'not exposed'}`)
}
const sitemap = await (await request(new URL('/sitemap.xml', base))).text()
assert.ok(sitemap.includes('<loc>https://incometax.nl/</loc>'))
assert.ok(sitemap.includes('<loc>https://incometax.nl/?lang=nl</loc>'))
assert.ok(!sitemap.includes('<lastmod>'))
console.log('PASS localized initial HTML, cache-selection probes and sitemap')
