# Language query migration — issue #21

Branch implementation of https://github.com/nikteworks/incomeTaxNL/issues/21.
Do not release independently of #22: localized initial HTML and its metadata remain
required before the query URL migration goes live.

## URL contract

- `/` and `/?lang=en` render English; `/?lang=nl` renders Dutch.
- Language is independent of browser locale, cookies, and saved preferences.
- Values are case sensitive. Empty, unsupported, or multiple `lang` values (even
  repeated identical ones) become exactly `lang=en` using history replacement.
  Missing language remains absent. Normalization is idempotent.
- User language navigation adds a history entry. English links remove `lang` to
  use its canonical `/`; Dutch links set `lang=nl`.
- `patchQuery` / `useQueryState` are the shared integration for #2 and #3. Each
  writer owns only its keys. Existing `calcType`, `v`, `state`, unknown/repeated
  parameters and the hash survive language changes. Encoding may be reserialized
  by URLSearchParams; decoded values are preserved. No financial values are added.
- Payloads remain opaque here. Calculator selection (#2), validation/serialization
  and complete shared-state restoration (#3) are separate pending implementations.

## Server routing and audit

The tracked router and repository links at base `efd7a74` contain only two real
language pages: `/en` and `/nl`. The old wildcard accepted arbitrary paths without
implementing subpages. No additional legacy destinations were found in the tracked
source/README. Do not infer page mappings from the old wildcard. Traffic and Search
Console may identify further real URLs during #22's release audit.

The four exact legacy paths (`/en`, `/en/`, `/nl`, `/nl/`) have 308 redirects to the
apex root with their language query. The destination's explicit `lang` must take
precedence over incoming values. Place these before generic www normalization so
www legacy URLs reach the final target in one hop. Leave `trailingSlash` unset to
avoid an automatic slash redirect before these rules. Rewrite only `/` to the app;
unknown paths must return HTTP 404 on Vercel. The client has a matching not-found
view (Vite's development fallback itself still returns HTTP 200).

## Metadata handoff to #22

English canonical: `https://incometax.nl/`; Dutch canonical:
`https://incometax.nl/?lang=nl`. Reciprocal hreflang and sitemap use these two URLs,
with `/` as x-default. The sitemap has no invented lastmod dates. Rendered canonical,
OG URL/locale and HTML language track navigation and exclude calculation/tracking
parameters. The existing English HTML shell still needs #22's deployment-compatible
localized rendering, title/description/social content and visible initial content.
Client updates here are not a substitute for that work.

## Validation and release gates

From `frontend` (Node 20+):

```sh
npm ci
npx playwright install chromium
npm test
npm run test:e2e
npm run lint
npm run build
```

Browser tests cover direct entry/reload, invalid/duplicate normalization, both
switch directions, Back/Forward, preserved query payload/fragment, retained edited
form values, clean rendered canonicals and client not-found behavior. They verify
payload preservation, not the unimplemented #3 restore feature.

After a combined #21/#22 deployment, run:

```sh
npm run test:http
# Optional alternate deployment with the same apex redirect configuration:
ROUTING_BASE_URL=https://incometax.nl ROUTING_WWW_URL=https://www.incometax.nl npm run test:http
```

This read-only check verifies real 308 status/destinations for every legacy slash
and www variant, conflicting duplicate language precedence, Unicode payload and
repeated parameter preservation, no redirect chains, root responses, and genuine
404s. Preview deployments currently redirect legacy URLs to the production apex;
validate production-domain routing on the final deployment. Do not treat local
browser tests or JSON inspection as proof of Vercel behavior.

Outstanding before release: deployed HTTP checks (including deployment-specific
framework fallback and trailing-slash behavior); #22 initial HTML/cache checks and
private Search Console baseline/live inspection; submit the coordinated sitemap.
No deployment or Search Console changes are made by this branch.
