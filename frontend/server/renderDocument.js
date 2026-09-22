import { metadata, pageCopy } from '../src/seo/metadata.js'

const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const attributes = (values) => Object.entries(values).map(([key, value]) => `${key}="${escape(value)}"`).join(' ')

export function renderDocument(template, language, appHtml) {
  const data = metadata(language)
  const head = [
    `<title>${escape(data.title)}</title>`,
    ...data.links.map((link) => `<link ${attributes(link)} />`),
    ...data.metas.map((meta) => `<meta ${attributes(meta)} />`),
    `<script id="page-structured-data" type="application/ld+json">${JSON.stringify(data.structuredData).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
  return template.replace('<html lang="en">', `<html lang="${language}">`)
    .replace('<!-- page-head -->', head)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${appHtml}</div><noscript>${escape(pageCopy[language].noScript)}</noscript>`)
}
