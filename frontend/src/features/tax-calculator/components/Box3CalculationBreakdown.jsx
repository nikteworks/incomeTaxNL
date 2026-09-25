import { useLanguage } from '../../../context/LanguageContext.jsx'
import { formatEuro, formatPercent } from '../../../utils/formatters.js'

export default function Box3CalculationBreakdown({ inputs, summary, config, ready }) {
  const { t, locale } = useLanguage()
  const copy = key => t(`box3Breakdown.${key}`)
  const money = value => ready && Number.isFinite(value) ? formatEuro(value, locale) : '—'
  const percent = value => ready && Number.isFinite(value) ? formatPercent(value, locale) : '—'
  const result = (key, value, asPercent = false) => <span data-metric={key}><strong>{asPercent ? percent(value) : money(value)}</strong></span>
  const totalAssets = inputs.bankBalance + inputs.investmentAssets
  const steps = [
    {
      key: 'totalAssets',
      formula: <>{money(inputs.bankBalance)} + {money(inputs.investmentAssets)} = {result('totalAssets', totalAssets)}</>,
    },
    {
      key: 'netAssets',
      formula: <>{money(totalAssets)} − {money(summary?.deductibleDebts)} = {result('netAssets', summary?.netAssets)}</>,
      detail: <>{copy('deductibleDebts')} {money(inputs.debts)} − {money(summary?.totalDebtsThreshold)}; {copy('minimumZero')} → {result('deductibleDebts', summary?.deductibleDebts)}.</>,
    },
    {
      key: 'taxableBase',
      formula: <>{money(summary?.netAssets)} − {money(summary?.totalTaxFreeAllowance)}; {copy('minimumZero')} → {result('taxableBase', summary?.taxableBase)}</>,
    },
    {
      key: 'taxableShare',
      formula: ready && summary.netAssets <= 0
        ? <>{copy('noPositiveBase')} → {result('taxableShare', summary.taxableShare, true)}</>
        : <>{money(summary?.taxableBase)} ÷ {money(summary?.netAssets)} = {result('taxableShare', summary?.taxableShare, true)}</>,
    },
    {
      key: 'taxableIncome',
      formula: <>{money(summary?.taxableReturns)} × {percent(summary?.taxableShare)} = {result('taxableIncome', summary?.taxableIncome)}</>,
      detail: <>
        <p>{copy('bankReturns')} {money(inputs.bankBalance)} × {percent(config.assumedReturnRates.bankBalance)} = {result('bankReturns', summary?.bankReturns)}.</p>
        <p>{copy('investmentReturns')} {money(inputs.investmentAssets)} × {percent(config.assumedReturnRates.investmentAssets)} = {result('investmentReturns', summary?.investmentReturns)}.</p>
        <p>{copy('debtCosts')} {money(summary?.deductibleDebts)} × {percent(config.assumedReturnRates.debts)} = {result('debtCosts', summary?.totalCosts)}.</p>
        <p>{copy('taxableReturns')} {money(summary?.bankReturns)} + {money(summary?.investmentReturns)} − {money(summary?.totalCosts)}; {copy('minimumZero')} → {result('taxableReturns', summary?.taxableReturns)}.</p>
      </>,
    },
    {
      key: 'estimatedTax',
      formula: <>{money(summary?.taxableIncome)} × {percent(config.taxRate)} = {result('estimatedTax', summary?.estimatedTax)}</>,
    },
  ]

  return <div className="guided-box3-breakdown">
    <p>{copy('introduction')}</p>
    <ol className="guided-calculation-steps">
      {steps.map(step => <li key={step.key}>
        <div className="guided-calculation-formula">
          <strong>{copy(`${step.key}.title`)}</strong> = {copy(`${step.key}.formula`)}<br />
          {step.formula}
        </div>
        <p>{copy(`${step.key}.explanation`)}</p>
        {step.detail && <div className="guided-calculation-detail">{step.detail}</div>}
      </li>)}
    </ol>
    <p className="guided-estimate-note">{t('box3Result.actualReturnDisclaimer')}</p>
  </div>
}
