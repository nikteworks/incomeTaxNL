import { useLanguage } from '../context/LanguageContext.jsx'
import { useHydrated } from '../hooks/useHydrated.js'
import { Link } from 'react-router-dom'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { language, languageHref, t } = useLanguage()

  const hydrated = useHydrated()
  const target = language === 'en' ? 'nl' : 'en'

  return (
    <Link
      to={hydrated ? languageHref(target) : (target === 'nl' ? '/?lang=nl' : '/')}
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
