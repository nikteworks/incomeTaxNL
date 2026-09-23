# Issue #28: Guided Rail implementation

The frontend shell was reviewed and the requested modal, disclosure, main-form, tooltip, and compact period edits were applied. The user subsequently authorized final calculation wiring.

## Open the calculator

From `frontend`, run `npm run dev` and open `/`. Add `?lang=nl` for Dutch, or use the header language control. The old `?preview=guided-rail` link also opens the live calculator; there is no separate mock calculator.

Both modes use the existing tax packages, saved inputs and configuration. Result display defaults to monthly for Box 1 and annual for Box 3. Input period changes keep a canonical annual amount, so rounding the displayed amount does not accumulate errors across period switches or reloads. Editing income or hourly hours establishes a new annual amount. The package's holiday allowance semantics are preserved, with its separate holiday deduction shown when applicable. The ruling amount uses the package's euro-valued `taxFreeYear`, not its percentage-valued `taxFree` field.

Box 3 configuration is persisted, uses one authoritative tax year, and converts percentages at the dialog boundary. Entry Save commits pending adds/edits; cancel or dismissal protects unsaved entry changes. Empty and invalid inputs show an unavailable result, while an explicitly entered zero asset balance can produce a valid zero estimate.

The prerendered introduction, calculator links, FAQ and structured data remain available without JavaScript. After hydration, the compact rail replaces the introductory fallback and the FAQ starts collapsed. The separate calculation explanation section is removed as requested.

## Review the interface

- Switch between Box 1 and Box 3; entered values remain in place.
- Inspect all salary periods and 30% ruling categories in the main form, the Advanced Options modal (tax year, hourly hours, pension age, social security), and reset confirmation.
- Open each Box 3 account/debt group, Manage entries, tax-partner controls, and the configuration dialog.
- Expand the tax calculation and use the category filters.
- Open FAQ: the result reduces to net pay/total tax or estimated Box 3 tax/taxable base. Reopen results to close FAQ.
- Review the language switch, About/Help/GitHub controls, disclaimer, Credits, and Terms of Use.
- Check the rail width, spacing, text, and mobile stacking.

## Historical shell verification

- ESLint and production client/SSR/prerender build pass.
- Existing Node test suite: 27 passing tests.
- Browser checks in English and Dutch at 390, 768, and 1440 px: both modes, advanced controls, tax disclosure, FAQ coordination, keyboard focus, settings and entries dialogs, and no horizontal overflow.
- Preview values survive mode and language switches; footer dialogs open. No browser JavaScript errors were observed.

These initial checks covered the shell only; calculation integration is covered by the tests described below.

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

## Calculation integration verification

- Node coverage checks period round trips (including small amounts), edits to converted inputs, and invalid persisted data.
- Browser tests compare headline, compact view, ledger and breakdown values directly with both installed calculation packages, including ruling categories, holiday allowance, pension age, social security, hourly hours, partner status, tax year and custom Box 3 rates.
- Browser coverage also exercises entry add/edit/delete, unchanged configuration saves, reloads, resets, invalid inputs, filters, FAQ keyboard focus, localized metadata/FAQ, all shared modals, and populated layouts at 390/768/1440 px.
- Changes are local to the issue branch; no deployment is performed.
