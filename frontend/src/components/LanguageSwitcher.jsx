import { useLanguage } from '../context/LanguageContext.jsx'
import { Link } from 'react-router-dom'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { language, languageHref, t } = useLanguage()

  return (
    <Link
      to={languageHref(language === 'en' ? 'nl' : 'en')}
      hrefLang={language === 'en' ? 'nl' : 'en'}
      className="language-switcher"
      aria-label={t('language.switchTo')}
      title={t('language.switchTo')}
    >
      <span className="language-switcher__flag" aria-hidden="true">
        {language === 'en' ? '🇳🇱' : '🇬🇧'}
      </span>
      <span className="language-switcher__label">
        {language === 'en' ? 'NL' : 'EN'}
      </span>
    </Link>
  )
}

export default LanguageSwitcher
