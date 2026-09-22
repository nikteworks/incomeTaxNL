import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { render } from '../dist-server/entry-server.js'
import { renderDocument } from '../server/renderDocument.js'

const template = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
await mkdir(new URL('../dist/localized/', import.meta.url), { recursive: true })
for (const language of ['en', 'nl']) {
  await writeFile(new URL(`../dist/localized/${language}.html`, import.meta.url), renderDocument(template, language, render(language)))
}
// Root fallback has meaningful English content too; middleware selects Dutch.
await writeFile(new URL('../dist/index.html', import.meta.url), renderDocument(template, 'en', render('en')))
