# Guided Rail — salary calculator design

**Status:** design specification for a future implementation. The interactive mockup was used to choose this direction and has been removed from the application. This document describes the design; it does not change the production calculator.

## Purpose

Help someone who knows their salary but not Dutch tax terminology get a trustworthy take-home estimate. The interface gives the user a short, numbered set of inputs on the left and an immediate explanation of the result on the right. It should feel like a personal salary statement rather than a dashboard.

The existing calculator handles both employment income (Box 1) and savings/investments (Box 3). Guided Rail is the proposed **Box 1 salary view**. A production implementation must retain access to Box 3, language selection, supported tax years, and existing advanced Box 1 options. Their placement needs a separate integration pass; the three-field mockup is not a replacement for those capabilities.

## Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ incometax.nl                                      Netherlands · tax year     │
├─────────────────────────────┬────────────────────────────────────────────────┤
│ LEFT RAIL                   │ PERSONAL SALARY STATEMENT                     │
│ n.                          │                                                │
│ YOUR INPUTS                 │ YOUR ESTIMATED RESULT       [Month] [Year]    │
│ A few details.              │ Salary breakdown                               │
│ One clear answer.           │ ┌────────────────────────────────────────────┐ │
│                             │ │ Estimated take-home pay         NET/GROSS │ │
│ ① Salary before tax         │ │ €3,750 / month                    75%      │ │
│    € 60,000                 │ └────────────────────────────────────────────┘ │
│ ② This amount is per        │ 01  Gross salary                    €5,000    │
│    [Year] [Month]           │ 02  Tax & contributions          − €1,250    │
│ ③ Includes holiday pay      │ 03  Take-home pay                   €3,750    │
│                             │                                                │
│ SALARY CALCULATOR · 2026    │ How is this worked out?   Estimate note       │
└─────────────────────────────┴────────────────────────────────────────────────┘
```

- **Global header:** white, 66 px high. Brand on the left; current country and tax year on the right. Keep the application's real language and calculator navigation in the production version.
- **Left rail:** about 375 px wide on large screens, pale blue (`#e3eaf4`) with a subtle right divider. The content sits vertically near the centre, with a small brand monogram at the top and tax-year label at the bottom. Three numbered input groups are divided by fine horizontal rules.
- **Main area:** remaining width, nearly white (`#f9fbfd`), with generous horizontal padding (about 6%). A quiet statement label leads to the result heading and the month/year control. The dark result panel is followed by a ruled three-row calculation.
- **At 761–1050 px:** reduce the rail to about 300 px and tighten main padding and result type. Keep the two-column relationship.
- **At 760 px and below:** stack rail above main. Inputs remain in their numbered order; the result follows. The result panel stacks the amount and net/gross percentage. Ledger amounts remain aligned with their labels, and no horizontal scrolling is allowed. The page header, rail, and main area remain separate visual regions.

## Visual system

| Element | Specification |
| --- | --- |
| Primary ink / result panel | Navy `#172941` |
| Selected controls | Blue `#2246ae` |
| Rail | Pale blue `#e3eaf4` |
| Main canvas | Off-white `#f9fbfd` |
| Dividers | Blue-gray `#cbd4df`; 1 px, except the ledger's top and final rule at 2 px |
| Main type | Manrope, with system sans-serif fallback |
| Monogram | Small `n.` in a serif face; decorative, not the sole brand label |
| Result amount | Semibold, about 78 px on wide desktop and 58 px on mobile; reduce or wrap safely for large amounts |
| Labels | Small uppercase with restrained letter spacing; supporting text remains at comfortable contrast |

Use solid colours, clear rules, and predictable spacing. Avoid decorative charts, shadows, and unexplained symbols. The percentage is secondary to the euro amount.

## Content and interaction

1. **Salary before tax.** Label the numeric field plainly. Prefix it with `€`, accept positive euro amounts, and show help text that points to a contract or payslip. On invalid or empty input, show a short inline error and replace result amounts with an em dash; never display a plausible zero-tax result.
2. **Income period.** Year and Month are mutually exclusive buttons. Changing the period converts the entered salary, then updates the calculation. Preserve cents during conversion so switching back does not silently alter the user's amount. The current choice must be available to assistive technology via `aria-pressed` or an equivalent control.
3. **Holiday pay.** A checkbox asks whether the entered salary already includes 8% holiday pay. Include a one-line explanation. If it is excluded, the estimate adds holiday pay before calculating; the gross and net figures shown in the result must consistently include it. Make the assumption explicit near the result.
4. **Result period.** The main area defaults to a monthly average and offers a yearly view. The choice changes the hero and all three ledger values together. The actual annual holiday-pay payment may be separate from regular monthly payslips; explain that the monthly figure spreads it over 12 months.
5. **Result panel.** Show “Estimated take-home pay,” one prominent amount, its period, and a smaller net/gross percentage. The percentage is `net annual income ÷ gross annual income`, clamped to 0–100 for display. Hide it or show an em dash when the calculation is unavailable.
6. **Ledger.** Show gross salary, the difference between gross and net as estimated tax/contributions, and take-home pay. Use the same period throughout. Keep negative signs clear and align values on the right. If the production calculator exposes a more accurate breakdown, use that data rather than implying that every gross-to-net difference is a single tax charge.
7. **Explanation.** A disclosure labelled “How is this worked out?” describes included tax credits, social contributions, holiday-pay averaging, and material assumptions. A persistent note says this is an estimate, not a final payslip.

The mockup used €60,000/year, holiday pay included, 2026, and an approximate monthly take-home of €3,750 as a visual example. **Those values are not design constants or a tax test case.** In production, use the year and results from the existing calculator and follow its current policy for initial form values.

## Accessibility and product constraints

- Use semantic `header`, `main`, `aside`, form labels, `fieldset`/`legend` for the period choice, and a real checkbox for holiday pay. Number badges supplement labels; they do not replace them.
- Support keyboard operation, visible focus, clear selected states, and sufficient contrast in the navy result panel and pale rail.
- Announce the result when inputs change without announcing the entire ledger on each keystroke. Do not move focus automatically.
- Keep currency formatting and explanatory copy localizable. Do not hard-code `2026`, English labels, or the Netherlands locale in the final component.
- Calculate in the browser and preserve the current product's privacy behaviour. Do not send salary inputs to analytics or a server.
- Keep the existing Box 1 calculation hook as the source of truth. The mockup used a reduced input set and assumed a person below state pension age with standard social contributions and no 30% ruling or pension deductions. The production view must surface or preserve applicable existing options, not silently force these assumptions.

## Implementation boundary

The design is intentionally separate from the production UI. A follow-up implementation should adapt `frontend/src/features/tax-calculator/components/TaxCalculatorShell.jsx`, its Box 1 form/result components, and the existing localization files. It should reuse `useBox1Calculator`, display error/empty states from that hook, and avoid copying the mockup's hard-coded sample data. The Box 3 flow, saved preferences, query-language routing, prerendered pages, and SEO metadata must continue to work.

Acceptance for that implementation: the three inputs and both period choices work at desktop and mobile sizes; the result and ledger agree numerically; empty/invalid inputs never show a misleading estimate; advanced options remain reachable; both supported languages work; keyboard and screen-reader labels are coherent; there is no horizontal overflow at 390, 768, or 1440 px.
