import { rewrite, next } from '@vercel/functions'
import { readLanguage } from './frontend/src/utils/urlState.js'

export default function middleware(request) {
  const url = new URL(request.url)
  const internal = /^\/localized\/(en|nl)\.html$/.exec(url.pathname)
  if (internal || url.pathname === '/index.html') {
    url.pathname = '/'
    if (internal) url.searchParams.set('lang', internal[1])
    return Response.redirect(url, 308)
  }
  if (url.pathname !== '/') return next()
  // Only the language selects an immutable build artifact. No state, cookie,
  // browser locale or user agent can affect the response body or cache target.
  const language = readLanguage(url.search)
  url.pathname = `/localized/${language}.html`
  url.search = ''
  return rewrite(url)
}
