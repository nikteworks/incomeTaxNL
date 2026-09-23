
# Dutch Tax Calculator (Frontend)

NOTE: THIS IS A TECHNICAL README. FOR A GENERAL PROJECT README, SEE THE DIRECTORY.

TaxNL is a privacy-first web app for Dutch tax calculations. It features two separate tools:

- **Salary Calculator (Box 1):** Estimate your net salary, taxes, and deductions for income from work.
- **Capital Gains Calculator (Box 3):** Calculate your tax on savings and investments, with configurable rates and thresholds.

**Privacy:** Calculations run locally, and entered values are saved in your browser. The site uses Vercel Analytics for page visits. If a URL contains financial values or account names, recipients can read them, and the URL may appear in hosting logs.

## Run Locally
- `npm install`
- `npm run dev`
- Open the local URL printed by Vite (e.g., `http://localhost:5173`)

## Key Paths
- `src/features/tax-calculator/components/Box3InputForm.jsx` — Box 3 input modal and tax partner toggle
- `src/features/tax-calculator/components/Box1InputForm.jsx` — Box 1 salary input form
- `src/features/tax-calculator/components/Box3ResultPanel.jsx` — Box 3 results and breakdown
- `src/features/tax-calculator/components/Box1ResultPanel.jsx` — Box 1 results and breakdown
- `src/features/tax-calculator/components/ConfigurationMenu.jsx` — Box 3 configuration dialog
- `src/features/tax-calculator/hooks/useBox3Calculator.js` — Box 3 calculator logic
- `src/features/tax-calculator/hooks/useBox1Calculator.js` — Box 1 calculator logic
- `src/features/tax-calculator/utils/box3.js` — Box 3 computation
- `src/features/tax-calculator/constants/box3Defaults.js` — Box 3 default constants

## Notes
- Dev server port may auto-increment if busy (5173 → 5174 → 5175).
- Calculations run in-browser. Check any URL before sharing financial values or account names.
