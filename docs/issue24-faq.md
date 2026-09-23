# Issue #24: localized FAQ and structured data

The English and Dutch FAQ files supplied for this issue contain 216 questions
each. Their questions and answers are stored in `frontend/src/content/` and used
by both the visible, server-rendered FAQ and the localized `FAQPage` JSON-LD.
The FAQ is present in the initial HTML, including when JavaScript is disabled.
The calculator itself estimates Box 1 salary and Box 3 tax; the FAQ introduction
distinguishes broader tax topics from calculator features.

The old unsupported aggregate rating is absent. Social cards are text-only,
and README screenshots live in `docs/screenshots/`, outside the frontend build.
The privacy notice now acknowledges Vercel Analytics and the disclosure risk of
URLs containing financial values. Issue #3 must separately decide how future
share links avoid sending calculation payloads to analytics.

## Validation and release checks

- Local build, unit tests, lint and Playwright tests check both languages, all
  supplied questions and answers, JSON-LD parity, language switching, and
  canonical metadata without financial values.
- No preview image is used, so there is no image URL to check on deployment.
- The Rich Results Test cannot validate this unpublished branch as a live URL.
  After deployment, test both canonical pages and record the resulting reports.
- Google discontinued FAQ rich results in May 2026. The `FAQPage` data is retained
  to describe visible content, with no expectation of a special Google display.
- The supplied tax answers are preserved as provided. A tax subject matter review
  of time-sensitive 2026 claims remains advisable before publishing.
