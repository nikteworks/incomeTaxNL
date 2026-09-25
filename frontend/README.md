
# Dutch Tax Calculator (Frontend)

NOTE: THIS IS A TECHNICAL README. FOR A GENERAL PROJECT README, SEE THE DIRECTORY.

TaxNL is a privacy-first web app for Dutch tax calculations. It features two separate tools:

- **Salary Calculator (Box 1):** Estimate your net salary, taxes, and deductions for income from work.
- **Savings and Investments Calculator (Box 3):** Calculate your tax on savings and investments, with configurable rates and thresholds.

**Privacy:** Calculations run locally, and entered values are saved in your browser. The site uses Vercel Analytics for page visits. If a URL contains financial values or account names, recipients can read them, and the URL may appear in hosting logs.

## Run Locally
- From the repository root: `npm ci && npm ci --prefix frontend --include=dev`
- Then `cd frontend`
- `npm run dev`
- Open the local URL printed by Vite (e.g., `http://localhost:5173`)

## Key Paths
- `src/features/tax-calculator/components/Box3InputForm.jsx` — Box 3 input modal and tax partner toggle
- `src/features/tax-calculator/components/Box1InputForm.jsx` — Box 1 salary input form
- `src/features/tax-calculator/components/GuidedRailCalculator.jsx` — live results, periods, disclosures and FAQ
- `src/features/tax-calculator/components/Box3CalculationBreakdown.jsx` — six-step Box 3 explanation
- `src/features/tax-calculator/components/TaxCalculatorShell.jsx` — saved inputs, configuration and calculator hooks
- `src/features/tax-calculator/components/ConfigurationMenu.jsx` — Box 3 configuration dialog
- `src/features/tax-calculator/hooks/useBox3Calculator.js` — Box 3 calculator logic
- `src/features/tax-calculator/hooks/useBox1Calculator.js` — Box 1 calculator logic
- `src/features/tax-calculator/utils/calculatorState.js` — input conversion and validation
- `src/seo/metadata.js` — localized canonical metadata and structured data
- `public/sitemap.xml`, `public/robots.txt` — public crawl discovery

## Notes
- Dev server port may auto-increment if busy (5173 → 5174 → 5175).
- Calculations run in-browser. Check any URL before sharing financial values or account names.

## Release checks

Run `npm run lint`, `npm test`, and `npm run test:e2e`. Browser tests build the production client and prerendered English/Dutch pages before testing them. GitHub Actions repeats these checks on pull requests and main. Run `npm audit` in both the repository root and frontend when updating dependencies.

See [production readiness and discovery](../docs/production-readiness.md) for deployment settings, SEO checks, and the post-deployment HTTP command.
