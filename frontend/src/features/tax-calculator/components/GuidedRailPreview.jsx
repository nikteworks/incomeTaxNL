import { useState } from 'react'
import { DEFAULT_YEAR, getDefaultsForYear } from 'dutch-tax-box3-calculator'
import PrimaryLayout from '../../../layouts/PrimaryLayout.jsx'
import FaqSection from '../../../components/FaqSection.jsx'
import { useLanguage } from '../../../context/LanguageContext.jsx'
import { pageCopy } from '../../../seo/metadata.js'
import Box1InputForm from './Box1InputForm.jsx'
import Box3InputForm from './Box3InputForm.jsx'
import ConfigurationMenu from './ConfigurationMenu.jsx'
import { BOX1_EMPTY_FORM } from '../constants/box1Defaults.js'
import { BOX1_DEFAULT_YEAR } from '../hooks/useBox1Calculator.js'
import './GuidedRailPreview.css'

const emptyAssets = { bankAccounts: [], investmentAccounts: [], debts: [], hasTaxPartner: false }
const breakdown = [
  ['grossIncome', 'income', 'grossIncomeInfo'],
  ['ruling30TaxFree', 'deductions', 'ruling30TaxFreeInfo'],
  ['taxableIncome', 'income', 'taxableIncomeInfo'],
  ['payrollTax', 'taxes', 'payrollTaxInfo'],
  ['socialSecurityLabel', 'taxes', 'socialSecurityInfo'],
  ['generalTaxCredit', 'taxCredits', 'generalTaxCreditInfo'],
  ['labourTaxCredit', 'taxCredits', 'labourTaxCreditInfo'],
  ['netIncome', 'income', 'netIncomeInfo'],
]

// Review-only state: deliberately no calculator hooks, URL financial data, or storage.
export default function GuidedRailPreview() {
  const { t, language } = useLanguage()
  const [mode, setMode] = useState('box1')
  const [salary, setSalary] = useState(BOX1_EMPTY_FORM)
  const [salaryYear, setSalaryYear] = useState(BOX1_DEFAULT_YEAR)
  const [assets, setAssets] = useState(emptyAssets)
  const [config, setConfig] = useState(() => ({ year: DEFAULT_YEAR, ...getDefaultsForYear(DEFAULT_YEAR) }))
  const [period, setPeriod] = useState('monthly')
  const [faqOpen, setFaqOpen] = useState(false)
  const [taxOpen, setTaxOpen] = useState(false)
  const [categories, setCategories] = useState(['income', 'taxes', 'taxCredits', 'deductions'])
  const box1 = mode === 'box1'
  const periodLabel = t(`box1Result.${{ monthly: 'perMonth', yearly: 'perYear', weekly: 'perWeek' }[period]}`)
  const metric = (label) => <div className="guided-ledger-row" key={label}><span>{label}</span><strong>—</strong></div>

  return (
    <PrimaryLayout guided>
      <p className="guided-preview-note">{t('guidedRail.preview')}</p>
      <div className="guided-rail" id="calculator">
        <aside className="guided-inputs" aria-label={t('guidedRail.inputs')}>
          <div className="guided-mode" role="group" aria-label={t('calculator.boxToggleLabel')}>
            {['box1', 'box3'].map(box => <button type="button" key={box}
              aria-pressed={mode === box} onClick={() => setMode(box)}>{t(`calculator.${box}`)}</button>)}
          </div>
          {box1 ? <Box1InputForm guided values={salary}
            onChange={(name, value) => setSalary(current => ({ ...current, [name]: value }))}
            year={salaryYear} onYearChange={setSalaryYear}
            onReset={() => { setSalary(BOX1_EMPTY_FORM); setSalaryYear(BOX1_DEFAULT_YEAR) }} />
            : <Box3InputForm values={assets}
              onChange={(name, value) => setAssets(current => ({ ...current, [name]: value }))}
              year={config.year} onYearChange={year => setConfig({ year, ...getDefaultsForYear(year) })}
              onReset={() => { setAssets(emptyAssets); setConfig({ year: DEFAULT_YEAR, ...getDefaultsForYear(DEFAULT_YEAR) }) }}
              configMenu={<ConfigurationMenu config={config} onConfigChange={setConfig} />} />}
        </aside>
        <div className="guided-reading">
          <section aria-labelledby="guided-results-title">
            <div className="guided-result-heading">
              <h2 id="guided-results-title">{t('box1Result.results')}</h2>
              <button className="guided-text-button" type="button" aria-expanded={!faqOpen}
                aria-controls="guided-results-full" onClick={() => setFaqOpen(!faqOpen)}>
                {t(faqOpen ? 'guidedRail.expand' : 'guidedRail.collapse')}
              </button>
            </div>
            <div className="guided-result-toolbar">
              <span>{t('box1Form.taxYear')} {box1 ? salaryYear : config.year}</span>
              {box1 && <div className="guided-period" role="group" aria-label={t('box1Form.period')}>
                {['monthly', 'yearly', 'weekly'].map(value => <button type="button" key={value}
                  aria-pressed={period === value} onClick={() => setPeriod(value)}>{t(`periods.${value}`)}</button>)}
              </div>}
            </div>
            <div className={`guided-headline${faqOpen ? ' guided-headline--compact' : ''}`}>
              <div><h3>{t(box1 ? 'guidedRail.takeHome' : 'box3Result.estimatedTax')}</h3>
                <div className="guided-amount"><strong>—</strong><span>{box1 ? periodLabel : t('box1Result.perYear')}</span></div>
              </div>
              {faqOpen && <div className="guided-compact-secondary"><span>{t(box1 ? 'guidedRail.tax' : 'box3Result.taxableBase')}</span><strong>—</strong></div>}
              <p>{t('guidedRail.pending')}</p>
            </div>
            <div id="guided-results-full" hidden={faqOpen}>
              <div className="guided-ledger">
                {metric(t(box1 ? 'guidedRail.gross' : 'box3Result.netAssets'))}
                <div className="guided-tax-row">
                  <button type="button" aria-expanded={taxOpen} aria-controls="guided-tax-detail"
                    onClick={() => setTaxOpen(!taxOpen)}>
                    <span>{t(box1 ? 'guidedRail.tax' : 'box3Result.taxableBase')}
                      <small>{t(taxOpen ? 'box1Result.hideBreakdown' : 'box1Result.showBreakdown')} <span aria-hidden="true">{taxOpen ? '−' : '+'}</span></small>
                    </span><strong>—</strong>
                  </button>
                  <div id="guided-tax-detail" hidden={!taxOpen}>
                    {box1 ? <>
                      <fieldset className="guided-filters"><legend>{t('guidedRail.filter')}</legend>
                        {['income', 'taxes', 'taxCredits', 'deductions'].map(category => <label key={category}>
                          <input type="checkbox" checked={categories.includes(category)} onChange={() => setCategories(current => current.includes(category) ? current.filter(item => item !== category) : [...current, category])} />
                          {t(`box1Result.${category}`)}
                        </label>)}
                      </fieldset>
                      {breakdown.filter(([, category]) => categories.includes(category)).map(([label, , help]) => <div className="guided-detail-row" key={label}>
                        <div>{t(`box1Result.${label}`)}<p>{t(`box1Result.${help}`)}</p></div><strong>—</strong>
                      </div>)}
                    </> : <>{['totalAssets', 'debts', 'allowancesApplied', 'taxableBase', 'estimatedTax'].map(key => metric(t(`box3Result.${key}`)))}<p>{t('box3Result.actualReturnDisclaimer')}</p></>}
                  </div>
                </div>
                {metric(t(box1 ? 'guidedRail.net' : 'box3Result.estimatedTax'))}
              </div>
              {box1 && <p className="guided-estimate-note">{t('guidedRail.monthlyNote')}</p>}
            </div>
          </section>
          <section className="guided-faq" aria-labelledby="guided-faq-title">
            <h2 id="guided-faq-title"><button type="button" className="guided-disclosure"
              aria-expanded={faqOpen} aria-controls="guided-faq-content" onClick={() => setFaqOpen(!faqOpen)}>
              {pageCopy[language].faqTitle}<span aria-hidden="true">{faqOpen ? '−' : '+'}</span>
            </button></h2>
            <div id="guided-faq-content" hidden={!faqOpen}><FaqSection /></div>
          </section>
        </div>
      </div>
    </PrimaryLayout>
  )
}
