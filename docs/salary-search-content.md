# Salary search content — issue #23

Issue: https://github.com/nikteworks/incomeTaxNL/issues/23

Implementation/content review date: 2026-09-23.
Production release date: pending deployment (the implementation date is not a release date).
Search Console baseline and post-release comparison: pending authenticated property access and release.

## Content and rendering

English and Dutch titles, descriptions and H1s describe the gross-to-net salary
calculator and Dutch tax estimates. The shared metadata module supplies initial
HTML and client navigation metadata via #22's existing prerendering pipeline.
The template already has no keywords or unsupported rating markup; none is added.
There are only two language landing pages and their existing canonicals/sitemap.
Calculator parameters do not create separate indexed landing pages.

The short introduction states supported tax years and input periods. A visible
H2/H3 guide below the calculator replaces the old expandable explanation and its
fixed, year-independent sample numbers. Personal breakdowns remain in the result
panels. The guide is outside the client island, so it exists without JavaScript
and without filling in a form or opening a modal. English and Dutch describe
salary annualization, credits, holiday allowance behavior, ruling inputs, deemed
Box 3 returns, and limitations. It does not offer net-to-gross or actual-return
comparison (#7). The age switch, separate Box 1/Box 3 calculations and absence
of pension/deduction inputs are explicitly identified as limitations.

The supported years were checked against the installed packages: Box 1
2019–2026 (the app's 2019 lower bound), Box 3 2023–2026. Recheck the introduction
and guide when upgrading those packages. The review date records review of the
content and method, not certification of every numeric package rule.

## Official sources reviewed on 2026-09-23

- [Box 1 rates and AOW transition](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/)
- [Gross and net pay](https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/brutoloon-en-nettoloon)
- [Expat scheme, English](https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/content/coming-to-work-in-the-netherlands-30-percent-facility)
- [Expat scheme, Dutch](https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/ik-kom-in-nederland-werken-30-procent-regeling-aanvragen)
- [Provisional Box 3 calculation for 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026)
- [Actual returns and reporting](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/wat-is-mijn-werkelijk-rendement)

Descriptions of the calculator's 8% holiday assumption and its treatment with and
without the ruling were checked in `dutch-tax-income-calculator` 26.2.0's
`SalaryPaycheck`, alongside the app's hook mapping. They describe implementation,
not a promise that the result equals an employer's payroll calculation. The Box 3
method was checked against the hook and `dutch-tax-box3-calculator` 0.1.9. The guide
notes the provisional nature of 2026 bank/debt rates and the missing actual-return
comparison. No calculation engine changes are part of this issue.

## Calculator links / issue #2 dependency

#2 was still open and its navigation was absent on main. To make the links in
this issue functional, this branch implements its selection contract using the
existing shared query-state utility: one valid `calcType=box1` or `box3` wins over
saved preferences; absent values use the preference captured on calculator mount
(or Box 1). Empty, unsupported and repeated values use the same fallback and are
removed with replace navigation. Back/Forward to an absent parameter restores
that mount-time fallback, making history stable after a later tool switch.

Switches patch only `calcType`, preserving language, opaque calculation payloads,
repeated unknown parameters and fragments. They never serialize financial inputs.
Hydrated links preserve the current query; initial HTML links contain only the
language and calculator selection, so private request data is never prerendered.
This implements selection, not #3's financial-state restoration. Browser tests
cover explicit preference conflicts, reload/history, language switching, input
retention and invalid values. Coordinate with #2 before implementing it separately.

## Release and private measurement checklist

Deploy with the #21/#22 language/crawlability changes. Record the actual production
release date and commit here once deployed. Run the deployed HTTP checks described
in `localized-html.md`; inspect initial HTML and rendered output for both languages
and calculator links. Do not infer production readiness from local HTML alone.

Before release, obtain an authorized Search Console export for a complete 28-day
baseline (exclude incomplete recent days). Store exports, exact query lists,
property details and all account performance numbers only in ignored
`private-evidence/` or a private analysis location, never in tracked files or
public site content. No private export was available for this implementation;
copy choices follow the issue's intent, not claimed query-performance evidence.

Use stable cohorts for English salary/gross-to-net queries, Dutch
salaris/bruto-netto queries, and Dutch income-tax queries. Separate branded from
non-branded searches; retain Box 3 as a separate cohort. Freeze cohort definitions
from actual baseline queries and use identical filters after release. Analyze
language landing pages, including legacy URLs during the migration, consistently.

After 28 complete post-release days, compare with a comparable 28-day baseline
using clicks, impressions, CTR and average position together. Segment by device
and country when sample sizes permit; flag sparse cohorts instead of implying
precision. Record tax-season effects, query/device/country mix and overlapping
releases. Higher CTR alone is not evidence of higher rankings or causation.
Summarize conclusions without publishing private account figures.

The release record and future comparison remain outstanding; no deployment,
Search Console access, ranking gain or automatic follow-up is claimed.
