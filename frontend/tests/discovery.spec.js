import { test, expect } from '@playwright/test'
import { metadata, PAGE_UPDATED_AT } from '../src/seo/metadata.js'

test('robots and sitemap expose only canonical language pages with matching modification dates', async ({ page, request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(robots.headers()['content-type']).toContain('text/plain')
  const policy = (await robots.text()).split('\n').filter(line => line && !line.startsWith('#'))
  expect(policy).toEqual(['User-agent: *', 'Allow: /', 'Sitemap: https://incometax.nl/sitemap.xml'])
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('xml')
  await page.goto('/')
  const entries = await page.evaluate(xml => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    if (doc.querySelector('parsererror')) throw new Error('Invalid sitemap XML')
    return [...doc.getElementsByTagName('url')].map(node => ({
      loc: node.getElementsByTagName('loc')[0].textContent,
      lastmod: node.getElementsByTagName('lastmod')[0].textContent,
      alternates: [...node.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link')].map(link => [link.getAttribute('hreflang'), link.getAttribute('href')]),
    }))
  }, await response.text())
  expect(entries.map(entry => entry.loc)).toEqual(['https://incometax.nl/', 'https://incometax.nl/?lang=nl'])
  for (const [index, language] of ['en', 'nl'].entries()) {
    const data = metadata(language)
    expect(entries[index].lastmod).toBe(PAGE_UPDATED_AT)
    expect(entries[index].alternates).toEqual(data.links.filter(link => link.rel === 'alternate').map(link => [link.hreflang, link.href]))
    const html = await (await request.get(language === 'nl' ? '/?lang=nl' : '/')).text()
    const app = JSON.parse(html.match(/id="page-structured-data"[^>]*>(.*?)<\/script>/s)[1])
    expect(app.mainEntityOfPage.dateModified).toBe(entries[index].lastmod)
    expect(app.mainEntityOfPage.url).toBe(entries[index].loc)
    expect(app.mainEntityOfPage.isPartOf['@type']).toBe('WebSite')
    expect(app.isAccessibleForFree).toBe(true)
    expect(html).not.toMatch(/"aggregateRating"|"reviewCount"/)
  }
})
