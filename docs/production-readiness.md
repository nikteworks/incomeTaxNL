# Guided Rail production readiness — issue #28

## Release contents

The reviewed Guided Rail is the default calculator. Box 1 and Box 3 use the installed tax packages, persistent inputs/configuration, explicit empty/invalid states, and synchronized results. The Box 3 breakdown explains all six steps with live amounts. Shared modals preserve focus; the annual-statement guide resets to fully collapsed on every open. Result headlines use a persistent polite, atomic live region.

Vercel builds from the repository root using the single configuration in `vercel.json`. The install command includes frontend development dependencies because Vite and prerendering need them at build time. The deployment contains static, localized HTML plus client assets; it does not expose the development server. Dependencies have received compatible security updates; tax calculator package versions are unchanged.

## SEO, answer engines and generative search

- `robots.txt` permits public pages and rendering assets, including query URLs so crawlers can read their canonical tags. It advertises the canonical sitemap. The policy does not distinguish humans from search/AI-search crawlers.
- `sitemap.xml` contains only the English `/` and Dutch `/?lang=nl` canonical pages, with reciprocal language alternates and x-default. Calculator inputs, preview flags, internal HTML artifacts and tracking parameters are excluded.
- The substantive public-content update date is **2026-09-25** in both sitemap `lastmod` and WebPage `dateModified` (`PAGE_UPDATED_AT`). Keep these synchronized when public content changes; do not generate fresh dates merely because a build runs.
- English and Dutch initial HTML include localized metadata, an introduction, crawlable calculator links, and FAQ answers before JavaScript runs. The FAQ includes three app-specific answers covering supported calculations, the Box 3 method, and period conversion, followed by the 216 supplied questions.
- Visible FAQ answers and FAQPage JSON-LD share the same content source. SoftwareApplication, WebPage, WebSite and FAQ entities have consistent canonical IDs. No fabricated reviews, ratings, author credentials or results are added.
- User-entered financial amounts remain client-side and never enter prerendered metadata or structured data. Canonical URLs remain free of financial query parameters.
- Existing GitHub links now point to the actual project repository.

These changes support discovery and clear answers; they do not guarantee indexing, rich results or AI citations. We did not add `llms.txt` or special AI-only markup: [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features) recommends crawlable text and structured data that matches the page, and says no special AI files are required. Dates follow [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Automated verification

From the repository root:

```sh
npm ci
npm ci --prefix frontend --include=dev
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run test:e2e
npm audit
npm --prefix frontend audit
```

The browser suite builds production artifacts and checks calculations, modal reopening, keyboard focus/live-region markup, English/Dutch FAQ-to-schema parity, robots/sitemap responses, sitemap XML, canonical URLs, matching content dates, SSR hydration and 390/768/1440px layouts. GitHub Actions runs lint, unit tests, and the production browser suite for pull requests and main.

## After deployment

This PR does not merge or deploy itself. After the production deployment, run:

```sh
npm --prefix frontend run test:http
```

This separately verifies real Vercel redirects/cache selection, localized initial HTML, 404s and sitemap/robots endpoints. The local browser harness cannot prove CDN behavior. Search Console URL inspection and sitemap submission require the site owner's authenticated account; no submission, indexing result or ranking improvement is claimed.
