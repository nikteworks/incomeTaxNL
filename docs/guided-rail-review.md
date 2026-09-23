# Issue #28: frontend shell review

This is the first implementation milestone for [issue #28](https://github.com/nikteworks/incomeTaxNL/issues/28). Human review comes before edits and final field wiring.

## Open the shell

From `frontend`, run `npm run dev` and open `/?preview=guided-rail` on the local server. Add `&lang=nl` for Dutch, or use the header language control. The preview is development-only; the existing production calculator remains the default.

The shell uses temporary component state. It does not read or write saved calculator inputs or calculate estimates. Result amounts deliberately remain unavailable. Changing an input period currently selects a period without converting salary.

## Review the interface

- Switch between Box 1 and Box 3; entered preview values remain in place.
- Inspect the basic salary controls, Advanced options, additional periods/hours, ruling categories, and reset confirmation.
- Open each Box 3 account/debt group, Manage entries, tax-partner controls, and the configuration dialog.
- Expand the tax calculation and use the category filters.
- Open FAQ: the result reduces to net pay/total tax or estimated Box 3 tax/taxable base. Reopen results to close FAQ.
- Review the explanation, language switch, About/Help/GitHub controls, disclaimer, Credits, and Terms of Use.
- Check the rail width, spacing, text, and mobile stacking.

## After human review

Apply the requested design edits, then connect the approved layout to the existing calculator hooks and settings. Complete period conversions, input validation/error states, synchronized headline/ledger/breakdown totals, net/gross percentage, persistence, URL behavior, and production integration. Preserve prerendered explanations and FAQ structured data. Review inherited dialog copy/localization and focus behavior during that integration.

## Shell verification

- ESLint and production client/SSR/prerender build pass.
- Existing Node test suite: 27 passing tests.
- Browser checks in English and Dutch at 390, 768, and 1440 px: both modes, advanced controls, tax disclosure, FAQ coordination, keyboard focus, settings and entries dialogs, and no horizontal overflow.
- Preview values survive mode and language switches; footer dialogs open. No browser JavaScript errors were observed.

Tax correctness and saved-state integration are intentionally not claimed for this unwired preview.
