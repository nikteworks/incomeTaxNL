import { useLanguage } from '../context/LanguageContext.jsx'
import { pageCopy } from '../seo/metadata.js'
import { faqByLanguage } from '../seo/faq.js'
import './FaqSection.css'

export default function FaqSection() {
  const { language } = useLanguage()
  const copy = pageCopy[language]
  const questions = faqByLanguage[language].mainEntity

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-section__heading">
        <h2 id="faq-title">{copy.faqTitle}</h2>
        <p>{copy.faqIntro}</p>
      </div>
      <div className="faq-section__questions">
        {questions.map((question, index) => (
          <details className="faq-section__item" key={index}>
            <summary>{question.name}</summary>
            <p>{question.acceptedAnswer.text}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
