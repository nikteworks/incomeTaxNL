# Guided Rail — tax calculator design

**Status:** implemented for issue #28 after human review. The Guided Rail is now the production calculator and uses the existing Box 1 and Box 3 calculation packages. The original structure below records the design intent; the accepted review changes in `guided-rail-review.md` supersede its illustrative controls and explanation section.

## Purpose and direction

Help someone estimate Dutch take-home pay or Box 3 tax without first learning tax terminology. The input rail should make the next useful choice obvious; the result area should make the estimate and its basis easy to inspect. The visual reference is a clear personal tax statement, with the restraint and legibility expected of a financial tool. It is not a marketing page or a decorative dashboard.

Box 1 starts with gross salary, income period, and holiday allowance. A Box 1 / Box 3 selector changes the rail and result together. The full existing Box 1 advanced options and Box 3 settings remain available. The page also includes the existing language, About, Help, GitHub, FAQ, and footer content.

## Design tokens and rationale

Define the following tokens before implementation, then test them against the existing product rather than adding new decorative treatments:

- **Colour:** navy `#172941` for primary text and the single result surface; blue `#2246ae` for selected controls, focus, and links; pale blue `#e3eaf4` for the input rail; off-white `#f9fbfd` for the reading area; blue-gray `#cbd4df` only where a divider clarifies a relationship. Keep contrast strong enough for small text and disabled states. Use solid colours. Do not introduce cream and clay, near-black and acid accents, or decorative gradients.
- **Type:** use the product's existing Roboto Flex stack (`--brand-font-family`) to keep the calculator and surrounding site related. Use sentence case for headings, field labels, result labels, and buttons. Size and weight show hierarchy: the calculated amount is largest, the result heading comes next, labels and help text remain comfortably readable. Do not use a display serif, decorative monogram, tracked uppercase eyebrow, or a highlighted single word in a heading.
- **Shape:** the primary result surface may use a 12 px radius because it groups the headline figure. Inputs and modal controls use the existing 6–8 px family for familiar affordances. Text links and ledger rows need no card treatment. A pill shape is reserved for a genuinely binary or selected choice if it reads better than ordinary buttons. Shape follows function; do not stamp one radius across the page.
- **Spacing:** keep labels and their help text close (about 8 px), separate independent form groups more clearly (about 24 px), and give the results/FAQ boundary greater space (about 40 px). Adjust by content rather than repeating one padding value. Use a divider only between related ledger lines or between major regions when spacing alone is insufficient. Do not draw hairlines around every block.
- **Depth and motion:** use no routine card shadow. A focus ring and selected state should carry interaction feedback. If the results/FAQ disclosure needs animation, use one short height change caused by the user's action and respect reduced-motion preferences. Do not add scroll entrances or uniform lift/glow hover effects.

The distinct feature is the narrow input rail beside an open, readable calculation. The wider result area reflects the greater information weight of the estimate. The dark result surface is one intentional emphasis; the FAQ and detailed breakdown remain part of the page rather than becoming a grid of matching cards.

## Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ incometax.nl                         Language   About   Help   GitHub        │
├──────────────────────────────┬───────────────────────────────────────────────┤
│ Box 1 salary   Box 3 savings │ Results                         Month   Year  │
│                              │                                               │
│ Salary before tax            │ Estimated take-home pay                       │
│ [€ entered amount]           │ [calculated amount] / month                   │
│                              │                                               │
│ Income period                │ Gross salary              [calculated amount] │
│ [Year] [Month]               │ Tax and contributions    [calculated amount]  │
│                              │   Show tax calculation                        │
│ Includes holiday allowance   │ Take-home pay             [calculated amount] │
│ [checkbox]                   │                                               │
│                              │ How this estimate is worked out               │
│ Advanced options             ├───────────────────────────────────────────────┤
│ Tax year                     │ Frequently asked questions [expand]           │
├──────────────────────────────┴───────────────────────────────────────────────┤
│ Disclaimer and Belastingdienst link                                          │
│ View on GitHub   Report an Issue   Credits   Terms of Use                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

This is a structure diagram, not a copy deck or tax example. All amounts come from the selected calculator. The labels shown are illustrative English copy; the finished UI uses the existing localization system.

- **Header:** keep the existing brand and language, About, Help, and GitHub controls. The GitHub icon links to the current project repository and has the existing localized accessible name. Show the applicable tax year where it helps interpret the result; do not add a decorative country/year strapline.
- **Rail:** about 375 px on wide desktop and about 300 px at 761–1050 px. Place the Box selector before mode-specific controls. Group each label, control, and help text by meaning. Box 1's three basic fields are not steps, so do not number them. Box 3 has a different number and type of groups; allow the rail to grow with its content.
- **Main area:** nearly white, with room for the headline result, an aligned calculation, and the FAQ below. Gross, tax, and net are accounting lines, not sequential steps; do not add `01/02/03` markers. Align amounts for scanning. The tax line opens the existing breakdown. Reserve the dark surface for the main result; do not wrap every line or FAQ answer in an identical rounded card.
- **Footer:** full width below both columns. Keep every existing disclaimer sentence, link, and dialog action listed below. Use spacing or a semantic list to separate actions rather than generic middle-dot chrome.
- **At 760 px and below:** stack rail, results, FAQ, and footer in that order. Keep the amount and its period together, allow long localized labels to wrap, align ledger values without horizontal scrolling, and keep the Box selector and advanced settings reachable.

## Content and interaction

### Box 1 inputs

- **Salary before tax:** prefix the field with `€`; accept positive amounts. Help text may point to a contract or payslip. On empty or invalid input, show a specific inline correction and replace result amounts with an unavailable mark. Do not show a plausible zero-tax estimate.
- **Income period:** Year and Month are prominent exclusive choices. Weekly, daily, and hourly periods remain in Advanced options, with hours per week when Hour is selected. Changing the period converts the entered salary and updates the result; preserve cents so a round trip does not change the user's amount. Expose the selected state to assistive technology.
- **Holiday allowance:** ask whether the entered salary already includes 8% holiday allowance and explain the assumption in one sentence. Preserve the current calculator's treatment of included/excluded allowance and its interaction with the 30% ruling. The gross and net figures must match that calculation.
- **Advanced options:** retain the existing disclosure and its tax year, additional income periods, hours per week, state pension age, 30% ruling and category, social security, and reset confirmation. The holiday allowance control can live in the basic rail, connected to the same state. Closing Advanced options hides controls without changing values or the estimate.

### Box 3 inputs and settings

Show the existing bank account, investment account, and debt groups; Manage entries dialogs retain add, edit, delete, validation, and unsaved-change behavior. Keep tax partner, tax year, reset, and the settings icon/modal. The modal retains tax-free asset and debt thresholds, tax rate, assumed return rates for bank balances, investments, and debts, year-specific defaults, validation, Save/Cancel, and Reset to defaults. Switching modes preserves each mode's values and settings.

### Results and explanations

- **Box 1 result:** show one prominent estimated take-home amount, its period, and a secondary net/gross percentage. Calculate the percentage from annual net ÷ annual gross, clamped to 0–100 for display; hide it when the calculation is unavailable. Monthly is the initial result period; retain yearly and the existing weekly view. The selected period updates the headline, ledger, compact result, and breakdown together. Explain that a monthly average spreads annual holiday pay over 12 months even when a payslip pays it separately.
- **Box 1 calculation:** show gross salary, tax and contributions, and take-home pay in the same period. Use the calculator's actual tax value rather than labeling every gross-to-net difference as one tax charge. Make the tax line a disclosure labelled “Show tax calculation.” Its expanded content reuses the existing breakdown: gross income, 30% ruling tax-free amount, taxable income, payroll tax, social security, general and labour tax credits, and net income, with current category filters and help text. Its button label changes to “Hide tax calculation” when open.
- **Box 3 result:** use the current Box 3 calculation and details. Do not invent a salary or net-income figure for Box 3. Keep its existing breakdown reachable.
- **Estimate explanation:** explain included tax credits, social contributions, holiday-pay averaging, and material assumptions in a disclosure. Keep a plain estimate note. Use concrete, user-facing wording; do not expose internal hook or configuration names in the interface.

The previous mockup used €60,000/year and an approximate €3,750/month only to test visual scale. These are not defaults or tax test cases. Production amounts and starting values come from the existing calculator.

### Coordinated results and FAQ

The main area has calculation results at the top and the existing FAQ at the bottom. Results start expanded and FAQ collapsed. Expanding FAQ minimizes Box 1 results to **net income and total tax only**, with the selected period and empty/error state still visible. It hides gross income, the full ledger, tax breakdown, and estimate explanation until results expand again. Expanding results collapses FAQ; collapsing FAQ restores expanded results. Input changes continue updating the compact values.

In Box 3 mode, the compact result shows estimated tax and taxable base. Reuse the localized questions and answers from `FaqSection`/`faqByLanguage`; individual FAQ questions can open independently. Keep visible answers and structured data consistent. The main section toggles and tax disclosure have clear, state-matching labels, `aria-expanded`, and controlled regions. Keep keyboard focus in place when a region changes height.

## Footer content to preserve

Render the footer from the existing localization keys and preserve these complete visible sentences and actions:

- **English disclaimer:** “Disclaimer: This tool is provided for educational and informational purposes only. Tax calculations are estimates and may not reflect your actual tax liability. For official advice, always consult the [Belastingdienst](https://www.belastingdienst.nl) or a qualified tax consultant.”
- **English actions:** [View on GitHub](https://github.com/nikteworks/Dutch_Tax), [Report an Issue](https://github.com/nikteworks/Dutch_Tax/issues), Credits, Terms of Use.
- **Dutch disclaimer:** “Disclaimer: Deze tool is uitsluitend bedoeld voor educatieve en informatieve doeleinden. Belastingberekeningen zijn schattingen en weerspiegelen mogelijk niet uw werkelijke belastingschuld. Raadpleeg voor officieel advies altijd de [Belastingdienst](https://www.belastingdienst.nl) of een gekwalificeerd belastingadviseur.”
- **Dutch actions:** [Bekijk op GitHub](https://github.com/nikteworks/Dutch_Tax), [Probleem melden](https://github.com/nikteworks/Dutch_Tax/issues), Credits, Gebruiksvoorwaarden.

Credits and Terms of Use remain buttons that open their current dialogs with the existing text and links.

## Accessibility and product constraints

Use semantic `header`, `main`, `aside`, and `footer`; proper form labels; `fieldset`/`legend` where choices form one question; and a real checkbox for holiday allowance. Support keyboard operation, visible focus, coherent screen-reader labels, and sufficient contrast. Announce the changed result without reading the whole ledger on each keystroke or moving focus. Localize currency, help text, errors, and controls; do not hard-code 2026 or English copy.

Calculate in the browser and preserve current data handling. Do not add transmission of salary or asset inputs to analytics or a server. Reuse `useBox1Calculator` and `useBox3Calculator` as the sources of truth. Keep saved preferences, query-language routing, prerendered pages, and SEO metadata working.

## Implementation and review

The implementation will touch `TaxCalculatorShell.jsx`, the Box 1 and Box 3 form/result components, `PrimaryLayout.jsx`, `FaqSection.jsx`, and localization files. Build a working calculator flow before polishing visual details. Compare the first render against common generic calculator layouts, then revise any choice that does not help this product. In a final self-critique, remove at least one accessory or redundant treatment; the decorative monogram and numbered ledger markers have already been cut from this design.

Acceptance: both calculators and existing settings paths work; totals agree with breakdowns for the selected year and period; empty/invalid inputs never show a misleading estimate; the GitHub icon and full footer work in both languages; the tax line reveals the existing breakdown; opening FAQ leaves only the correct compact metrics; keyboard and screen-reader states are coherent; and there is no horizontal overflow at 390, 768, or 1440 px. Verify the rendered page at those widths and inspect focus, hover, expanded, empty, and error states before implementation is complete.
