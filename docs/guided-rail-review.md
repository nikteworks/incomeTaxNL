# Issue #28: frontend shell review

This is the first implementation milestone for [issue #28](https://github.com/nikteworks/incomeTaxNL/issues/28). Human review comes before edits and final field wiring.

## Open the shell

From `frontend`, run `npm run dev` and open `/?preview=guided-rail` on the local server. Add `&lang=nl` for Dutch, or use the header language control. The preview is development-only; the existing production calculator remains the default.

The shell uses temporary component state. It does not read or write saved calculator inputs or calculate estimates. Result amounts deliberately remain unavailable. Changing an input period currently selects a period without converting salary.

## Review the interface

- Switch between Box 1 and Box 3; entered preview values remain in place.
- Inspect all salary periods and 30% ruling categories in the main form, the Advanced Options modal (tax year, hourly hours, pension age, social security), and reset confirmation.
- Open each Box 3 account/debt group, Manage entries, tax-partner controls, and the configuration dialog.
- Expand the tax calculation and use the category filters.
- Open FAQ: the result reduces to net pay/total tax or estimated Box 3 tax/taxable base. Reopen results to close FAQ.
- Review the language switch, About/Help/GitHub controls, disclaimer, Credits, and Terms of Use.
- Check the rail width, spacing, text, and mobile stacking.

## After human review

Apply the requested design edits, then connect the approved layout to the existing calculator hooks and settings. Complete period conversions, input validation/error states, synchronized headline/ledger/breakdown totals, net/gross percentage, persistence, URL behavior, and production integration. Preserve prerendered explanations and FAQ structured data. Review inherited dialog content/localization during that integration.

## Shell verification

- ESLint and production client/SSR/prerender build pass.
- Existing Node test suite: 27 passing tests.
- Browser checks in English and Dutch at 390, 768, and 1440 px: both modes, advanced controls, tax disclosure, FAQ coordination, keyboard focus, settings and entries dialogs, and no horizontal overflow.
- Preview values survive mode and language switches; footer dialogs open. No browser JavaScript errors were observed.

Tax correctness and saved-state integration are intentionally not claimed for this unwired preview.

## Shared modal shell

All popups now use `StandardModal`: Privacy, About, Credits, Terms, Box 1/Box 3 resets, Box 3 settings, account/investment/debt entries, the unsaved-entry warning, and the annual-statement guide. The shared frame applies the Guided Rail colours and typography, three content widths, a consistent close control, a scrolling body, and persistent footer actions. Informational dialogs receive a standard Close action. Header tools and entry totals use dedicated slots.

The shell uses Material UI focus trapping, Escape/backdrop dismissal, accessible titles, and focus restoration. Entry dismissal still calls the existing unsaved-change guard. Modal shell labels are localized; existing informational content is retained.

Validation: eight browser tests cover English/Dutch dialogs at 390/768/1440 px, focus trapping/restoration, visible footer actions, and nested discard/cancel behavior. The shared frame also applies to the default calculator's dialogs.

## Human-review edits

- Standardized both result disclosures to Show Breakdown / Hide Breakdown and indented their contents on desktop.
- Removed the “How this estimate is worked out” section from the Guided Rail preview.
- Replaced the Box 3 settings gear with an Advanced Options link and separated section headings, floating field labels, helper text, and field groups in its modal.
- Moved Box 1 Advanced Options into the shared modal. All income periods and the 30% ruling/category controls now live in the main form; the modal contains no duplicate period selector.
- Verified English/Dutch at 390, 768, and 1440 px. Ten modal browser tests cover focus, dismissal guards, field persistence, and configuration label spacing. Lint, production build/prerender, and all 27 Node tests pass. Calculator wiring remains deferred.
