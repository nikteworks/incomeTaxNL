import { useState } from 'react'
import FaqSection from '../../../components/FaqSection.jsx'
import { useLanguage } from '../../../context/LanguageContext.jsx'
import { pageCopy } from '../../../seo/metadata.js'
import Box1InputForm from './Box1InputForm.jsx'
import Box3InputForm from './Box3InputForm.jsx'
import Box3CalculationBreakdown from './Box3CalculationBreakdown.jsx'
import ConfigurationMenu from './ConfigurationMenu.jsx'
import { formatEuro, formatPercent } from '../../../utils/formatters.js'

const breakdown = [
  ['grossIncome', 'income', 'grossIncomeInfo', 'grossYear'],
  ['holidayAllowance', 'deductions', 'holidayAllowanceInfo', 'grossAllowance'],
  ['ruling30TaxFree', 'deductions', 'ruling30TaxFreeInfo', 'taxFree'],
  ['taxableIncome', 'income', 'taxableIncomeInfo', 'taxableYear'],
  ['payrollTax', 'taxes', 'payrollTaxInfo', 'payrollTax'],
  ['socialSecurityLabel', 'taxes', 'socialSecurityInfo', 'socialTax'],
  ['generalTaxCredit', 'taxCredits', 'generalTaxCreditInfo', 'generalCredit'],
  ['labourTaxCredit', 'taxCredits', 'labourTaxCreditInfo', 'labourCredit'],
  ['totalTax', 'taxes', 'totalTaxInfo', 'incomeTax'],
  ['netIncome', 'income', 'netIncomeInfo', 'netYear'],
]

export default function GuidedRailCalculator({ mode, onModeChange, salary, salaryYear, salarySummary,
  salaryStatus, onSalaryChange, onSalaryYearChange, onSalaryReset, assets, assetInputs, assetSummary,
  assetStatus, config, onConfigChange, onAssetChange, onAssetYearChange, onAssetReset }) {
  const { t, language, locale } = useLanguage()
  const [period, setPeriod] = useState('monthly')
  const [faqOpen, setFaqOpen] = useState(false)
  const [taxOpen, setTaxOpen] = useState(false)
  const [categories, setCategories] = useState(['income', 'taxes', 'taxCredits', 'deductions'])
  const box1 = mode === 'box1'
  const periodLabel = t(`box1Result.${{ monthly: 'perMonth', yearly: 'perYear', weekly: 'perWeek' }[period]}`)
  const divisor = { monthly: 12, yearly: 1, weekly: 52 }[period]
  const details = salarySummary.details
  const status = box1 ? salaryStatus : assetStatus
  const ready = !status
  const money = value => ready && Number.isFinite(value) ? formatEuro(value, locale) : '—'
  const net = details ? details.netYear / divisor : null
  const tax = details ? Math.abs(details.incomeTax) / divisor : null
  const ratio = ready && box1 && details.grossYear > 0 ? Math.min(1, Math.max(0, details.netYear / details.grossYear)) : null
  const headline = box1 ? net : assetSummary?.estimatedTax
  const secondary = box1 ? tax : assetSummary?.taxableBase
  const metric = (label, value, id) => <div className="guided-ledger-row" key={label} data-metric={id}><span>{label}</span><strong>{money(value)}</strong></div>


  return (
    <div className="guided-rail calculator-shell" id="calculator" tabIndex={-1}>
        <aside className={`guided-inputs${box1 ? ' guided-inputs--box1' : ''}`} aria-label={t('guidedRail.inputs')}>
          <div className="guided-mode" role="group" aria-label={t('calculator.boxToggleLabel')}>
            {['box1', 'box3'].map(box => <button type="button" key={box}
              aria-pressed={mode === box} aria-label={box === 'box1' ? 'Box 1' : 'Box 3'} onClick={() => onModeChange(box)}>{t(`calculator.${box}`)}</button>)}
          </div>
          {box1 ? <Box1InputForm guided values={salary}
            onChange={onSalaryChange} year={salaryYear} onYearChange={onSalaryYearChange} onReset={onSalaryReset} />
            : <Box3InputForm values={assets} onChange={onAssetChange}
              year={config.year} onYearChange={onAssetYearChange} onReset={onAssetReset}
              configMenu={<ConfigurationMenu config={config} onConfigChange={onConfigChange} />} />}

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
              <div aria-live="polite" aria-atomic="true"><h3>{t(box1 ? 'guidedRail.takeHome' : 'box3Result.estimatedTax')}</h3>
                <div className="guided-amount"><strong data-metric="headline">{money(headline)}</strong><span>{box1 ? periodLabel : t('box1Result.perYear')}</span></div>
              </div>
              {faqOpen && <div className="guided-compact-secondary"><span>{t(box1 ? 'guidedRail.tax' : 'box3Result.taxableBase')}</span><strong data-metric="compact-secondary">{money(secondary)}</strong></div>}
              {status && <p role="status">{t(`guidedRail.${status}`)}</p>}
              {ratio !== null && !faqOpen && <div className="guided-ratio">
                <span>{t('guidedRail.ratio')} <strong>{formatPercent(ratio, locale)}</strong></span>
                <meter min="0" max="1" value={ratio} aria-label={t('guidedRail.ratio')} />
              </div>}
            </div>
            <div id="guided-results-full" hidden={faqOpen}>
              <div className="guided-ledger">
                {metric(t(box1 ? 'guidedRail.gross' : 'box3Result.netAssets'), box1 ? details?.grossYear / divisor : assetSummary?.netAssets, 'gross')}
                {box1 && ready && details.taxFree === 0 && details.grossAllowance > 0 && metric(t('box1Result.holidayAllowance'), -details.grossAllowance / divisor, 'holiday')}
                <div className="guided-tax-row">
                  <button type="button" aria-expanded={taxOpen} aria-controls="guided-tax-detail"
                    onClick={() => setTaxOpen(!taxOpen)}>
                    <span>{t(box1 ? 'guidedRail.tax' : 'box3Result.taxableBase')}
                      <small>{t(taxOpen ? 'box1Result.hideBreakdown' : 'box1Result.showBreakdown')} <span aria-hidden="true">{taxOpen ? '−' : '+'}</span></small>
                    </span><strong data-metric="tax">{money(secondary)}</strong>
                  </button>
                  <div id="guided-tax-detail" hidden={!taxOpen}>
                    {box1 ? <>
                      <fieldset className="guided-filters"><legend>{t('guidedRail.filter')}</legend>
                        {['income', 'taxes', 'taxCredits', 'deductions'].map(category => <label key={category}>
                          <input type="checkbox" checked={categories.includes(category)} onChange={() => setCategories(current => current.includes(category) ? current.filter(item => item !== category) : [...current, category])} />
                          {t(`box1Result.${category}`)}
                        </label>)}
                      </fieldset>
                      {breakdown.filter(([, category]) => categories.includes(category)).map(([label, , help, field]) => <div className="guided-detail-row" key={label} data-metric={field}>
                        <div>{t(`box1Result.${label}`)}<p>{t(`box1Result.${help}`)}</p></div><strong>{money(details?.[field] / divisor)}</strong>
                      </div>)}
                    </> : <Box3CalculationBreakdown inputs={assetInputs} summary={assetSummary} config={config} ready={ready} />}
                  </div>
                </div>
                {metric(t(box1 ? 'guidedRail.net' : 'box3Result.estimatedTax'), headline, 'net')}
              </div>
              {box1 && <p className="guided-estimate-note">{t('guidedRail.periodNote')} {ready && details.taxFree === 0 && details.grossAllowance > 0 && t('guidedRail.holidayNote')}</p>}
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
  )
}
