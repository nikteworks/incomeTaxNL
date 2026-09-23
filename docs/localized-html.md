# Localized initial HTML — issue #22

Implements https://github.com/nikteworks/incomeTaxNL/issues/22 on top of #21.

## Rendering and URL policy

The Vite build first creates client assets, then an SSR entry, then pre-renders
English and Dutch HTML with React. Both pages include the same visible application
layout, localized heading/introduction, clean language discovery link, title,
description, HTML language, canonical/hreflang, social metadata and generic
SoftwareApplication structured data. `src/seo/metadata.js` supplies both the build
and client metadata, so navigation cannot leave a stale language title or canonical.

The calculator is a client island. It mounts after hydration and then reads saved
form preferences; financial inputs are never baked into HTML. The pre-rendered
layout is identical on the server and first client render, even with saved inputs
or a shared URL. The language link gains the current query/hash after hydration.
Without JavaScript the heading, introduction, footer and language link remain
visible, alongside a notice that calculations require JavaScript.

`/` is English canonical; `/?lang=en` is its alias; `/?lang=nl` is Dutch canonical.
Hreflang is reciprocal with `/` as English and x-default. #21's sitemap already
contains both canonical pages without fabricated lastmod dates. Metadata is built
only from the validated language, never request state or tracking parameters.

The old unsupported aggregate rating, FAQ markup without matching visible FAQ,
and broken `/frontend/src/assets/screenshot.png` image references were removed
while replacing the fixed metadata. Social cards use text-only `summary` until
#24 supplies an approved public preview asset; no image or rating is fabricated.

## Vercel deployment

Use the repository root as the Vercel project root. `vercel.json` explicitly installs
root middleware dependencies and frontend dependencies, builds both HTML variants,
and publishes `frontend/dist`. Framework auto-detection is disabled to prevent an
SPA catch-all from turning unknown paths into 200 responses.

Vercel routing middleware selects `/localized/en.html` or `/localized/nl.html`
using the same `readLanguage` parser as the client. Cookies, browser language and
user agent are irrelevant. The internal rewrite removes all query parameters;
the browser's original address, calculation payload and hash remain intact. Each
language has a distinct static cache target. Direct requests for internal HTML
artifacts redirect to the corresponding public language URL. Middleware does not
rerun for its internal rewrite.

Reference: https://vercel.com/docs/routing-middleware — middleware executes before
cache lookup. `proxy.entrypoint` and `proxy.matcher` are documented at
https://vercel.com/docs/project-configuration/vercel-json#proxy.

### Production domain correction (2026-09-23)

The pre-release HTTP probe during implementation found **apex → www (307)** at
`https://incometax.nl/` and query/legacy variants. `https://www.incometax.nl/?lang=nl`
returned 200 with English HTML, the English canonical, and no initial H1. This is
the deployment before the domain correction, not validation of this branch. Probe details
are in ignored `private-evidence/issue22-http-baseline.json`.

On 2026-09-23, the Vercel project domain settings were changed so
`incometax.nl` connects to Production and `www.incometax.nl` redirects permanently
to it (308). Subsequent public HTTP checks returned 200 for the apex and 308
from www to the apex, preserving `?lang=nl&check=1`. The old production build is
still live; these checks verify the domain correction, not the #21/#22 migration.

Before publishing the branch, confirm the repository-root build setting so this
`vercel.json` and middleware are used. Test www legacy paths after deployment:
the platform domain redirect may add a hop before the route migration, even though
the domain correction itself no longer creates a loop.

## Verification

From the repository root:

```sh
npm ci
npm ci --prefix frontend
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run test:e2e
```

The browser suite builds production artifacts and serves them through the actual
middleware locally. It checks initial HTML with JavaScript disabled, both
languages, the English alias, duplicate normalization, a synthetic share payload,
hydration with conflicting saved inputs, language/history metadata updates, no
duplicate tags, query preservation and HTTP 404s. Unit tests exercise deterministic
middleware/cache targets including cookie/browser-language conflicts. The local
harness does not emulate Vercel's CDN or static redirect implementation.

After combined deployment and domain correction:

```sh
npm --prefix frontend run test:http
```

This verifies real legacy/www redirects, conflict precedence, status codes, actual
initial HTML and repeated alternating language/cache probes, as well as the sitemap.
Also repeat the browser checks against the live deployment and inspect response
headers. A cache HIT alone is not proof: assert the returned language and metadata
on every request. Do not close #22 based only on local checks.

## Private Search Console and rollout evidence (pending access/release)

No authenticated Search Console property has been confirmed in this session.
No Search Console baseline, live URL inspection, indexing result or sitemap
submission is claimed. Keep account exports and performance figures outside Git;
`private-evidence/` is ignored for that purpose.

Before release, export a complete 28-day Search performance baseline (exclude
incomplete recent dates) with query, page and device dimensions, including clicks,
impressions, CTR and position. Save the date range, property, filters and export
privately. Record indexing coverage and Google's selected canonical for `/`,
`/?lang=en`, `/?lang=nl`, representative www/legacy URLs and a synthetic share URL.
Save live inspection screenshots/results and the current submitted sitemap status.

After deployment, inspect the same URLs live, verify initial/rendered HTML and
selected canonicals, then submit `https://incometax.nl/sitemap.xml`. Indexing and
Google-selected canonical changes may lag deployment; record dates and unresolved
states rather than assuming success. After a full comparable 28-day post-release
window, export the same dimensions and filters. Account for tax-season timing,
query mix, device mix and other releases; aggregate CTR differences do not prove
causation, and the migration does not promise a ranking improvement.

These external release steps and the later comparison remain outstanding. No
scheduled task is created without a user request.
