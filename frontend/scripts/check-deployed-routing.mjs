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
      const target = new URL(response.headers.get('location'), origin)
      assert.equal(target.origin, base.origin, 'redirect directly to apex')
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
