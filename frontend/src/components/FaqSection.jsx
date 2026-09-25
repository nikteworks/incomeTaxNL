import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useLanguage } from '../context/LanguageContext.jsx'
import { pageCopy } from '../seo/pageCopy.js'
import { loadFaq, readPrerenderedFaq } from '../seo/faqClient.js'
import './FaqSection.css'

export default function FaqSection({ initialFaq = null }) {
  const { language } = useLanguage()
  const copy = pageCopy[language]
  const [faq, setFaq] = useState(() => ({
    language,
    questions: initialFaq || (typeof document !== 'undefined' && readPrerenderedFaq(language, document)),
  }))
  useEffect(() => {
    if (faq.language === language && faq.questions) return
    let active = true
    loadFaq(language).then((data) => {
      if (active) setFaq({ language, questions: data.mainEntity })
    })
    return () => { active = false }
  }, [faq, language])
  const questions = faq.language === language ? faq.questions : null

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-section__heading">
        <h2 id="faq-title">{copy.faqTitle}</h2>
        <p>{copy.faqIntro}</p>
      </div>
      <div className="faq-section__questions">
        {questions?.map((question, index) => (
          <details className="faq-section__item" key={index}>
            <summary>{question.name}</summary>
            <p>{question.acceptedAnswer.text}</p>
          </details>
        ))}
      </div>
      {!questions && <p role="status">{copy.loading}</p>}
    </section>
  )
}

FaqSection.propTypes = {
  initialFaq: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    acceptedAnswer: PropTypes.shape({ text: PropTypes.string.isRequired }).isRequired,
  })),
}
