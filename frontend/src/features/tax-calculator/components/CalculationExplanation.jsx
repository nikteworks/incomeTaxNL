import { useLanguage } from '../../../context/LanguageContext.jsx'
import CalculatorLink from './CalculatorLink.jsx'
import './CalculationExplanation.css'

const sources = {
  salary: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/',
  holiday: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/brutoloon-en-nettoloon',
  ruling: {
    en: 'https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/content/coming-to-work-in-the-netherlands-30-percent-facility',
    nl: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/ik-kom-in-nederland-werken-30-procent-regeling-aanvragen',
  },
  box3: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026',
  actual: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/wat-is-mijn-werkelijk-rendement',
}

// Outside the client calculator island so explanations are visible in initial HTML.
export default function CalculationExplanation() {
  const { t, language } = useLanguage()
  return (
    <section className="calculation-guide" aria-labelledby="calculation-guide-title">
      <h2 id="calculation-guide-title">{t('guide.title')}</h2>
      <p className="calculation-guide__review">{t('guide.reviewed')}: <time dateTime="2026-09-23">{t('guide.reviewDate')}</time></p>
      <p>{t('guide.years')}</p>
      {['salary', 'holiday', 'ruling', 'box3'].map((topic) => (
        <section key={topic} aria-labelledby={`guide-${topic}`}>
          <h3 id={`guide-${topic}`}>{t(`guide.${topic}Title`)}</h3>
          <p>{t(`guide.${topic}Text`)}</p>
          <p><a href={topic === 'ruling' ? sources.ruling[language] : sources[topic]}>{t(`guide.${topic}Source`)}</a></p>
          {topic === 'box3' && <p>{t('guide.actualText')} <a href={sources.actual}>{t('guide.actualSource')}</a></p>}
          {(topic === 'salary' || topic === 'box3') && <CalculatorLink boxType={topic === 'salary' ? 'box1' : 'box3'} />}
        </section>
      ))}
      <section aria-labelledby="guide-limits">
        <h3 id="guide-limits">{t('guide.limitsTitle')}</h3>
        <p>{t('guide.limitsText')}</p>
      </section>
    </section>
  )
}
