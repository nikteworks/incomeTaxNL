import StandardModal from '../components/StandardModal.jsx'

import PropTypes from 'prop-types'
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import CalculatorLink from '../features/tax-calculator/components/CalculatorLink.jsx'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import './PrimaryLayout.css'
import { useHydrated } from '../hooks/useHydrated.js'
import { pageCopy } from '../seo/metadata.js'


function PrimaryLayout({ children, guided = false }) {
  const { t, language } = useLanguage()
  const hydrated = useHydrated()
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  return (
    <div className={`app-shell${guided ? ' app-shell--guided' : ''}`}>
      <header className="app-header">
        <span className="app-brand">{t('app.title')}</span>
        <nav className="app-header__nav">
          <LanguageSwitcher />
          <button
            type="button"
            className="app-header__icon-button"
            onClick={() => setShowInfo(true)}
            aria-label={t('header.aboutAriaLabel')}
            aria-haspopup="dialog"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm1.5 11.25h-3v-2h1v-3h-1v-2h2a1 1 0 0 1 1 1v4h1v2Z"/>
            </svg>
          </button>
          <a
            href="https://twitter.com/messages/compose?recipient_id=718363377798615041"
            target="_blank"
            rel="noopener noreferrer"
            className="app-header__helpdesk-link"
            aria-label={t('header.contactAriaLabel')}
            title={t('header.contactTitle')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M12 2C6.48 2 2 5.58 2 10c0 2.03 1.01 3.87 2.64 5.24-.17 1.89-1.05 3.47-1.07 3.5a.5.5 0 0 0 .42.76c2.31 0 4.13-1.06 5.24-1.88.57.1 1.16.16 1.77.16 5.52 0 10-3.58 10-8S17.52 2 12 2Zm-3 9.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm3 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm3 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"/>
            </svg>
          </a>
          <a
            href="https://github.com/nikteworks/incomeTaxNL"
            target="_blank"
            rel="noopener noreferrer"
            className="app-header__github-link"
            aria-label={t('header.githubAriaLabel')}
          >
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </nav>
      </header>
      <div className="app-notice">
        {t('app.notice')} <button onClick={() => setShowPrivacy(true)} className="app-notice__link">{t('app.noticeLink')}</button>
      </div>
      <main className="app-main">
        {guided && hydrated ? <h1 className="guided-page-title">{pageCopy[language].heading}</h1> : <section className="app-introduction">
          <h1>{pageCopy[language].heading}</h1>
          <p>{pageCopy[language].introduction}</p>
          <nav className="calculator-links" aria-label={t('guide.navigation')}>
            <CalculatorLink boxType="box1" />
            <CalculatorLink boxType="box3" />
          </nav>
        </section>}
        {children}
      </main>
      <footer className="app-footer">
        <div className="app-footer__disclaimer">
          <p>
            <strong>{t('footer.disclaimer')}</strong> {t('footer.disclaimerText')}{' '}
            <a href="https://www.belastingdienst.nl" target="_blank" rel="noopener noreferrer">{t('footer.belastingdienst')}</a> {t('footer.disclaimerEnd')}
          </p>
        </div>
        <div className="app-footer__links">
          <a href="https://github.com/nikteworks/incomeTaxNL" target="_blank" rel="noopener noreferrer">
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            {t('footer.viewOnGithub')}
          </a>
          <span className="app-footer__separator">•</span>
          <a href="https://github.com/nikteworks/incomeTaxNL/issues" target="_blank" rel="noopener noreferrer">
            {t('footer.reportIssue')}
          </a>
          <span className="app-footer__separator">•</span>
          <button onClick={() => setShowCredits(true)} className="app-footer__link-button">
            {t('footer.credits')}
          </button>
          <span className="app-footer__separator">•</span>
          <button onClick={() => setShowTerms(true)} className="app-footer__link-button">
            {t('footer.termsOfUse')}
          </button>
        </div>
      </footer>
      <StandardModal open={showPrivacy} onClose={() => setShowPrivacy(false)}
        title={t('modals.privacyTitle')} size="sm">
        <p><strong>{t('modals.privacyIntro')}</strong></p>
        <p>{t('modals.privacyText')}</p>
        <p>{t('modals.privacyBullet1')}</p>
      </StandardModal>
      <StandardModal open={showInfo} onClose={() => setShowInfo(false)}
        title={t('modals.aboutTitle')} size="sm">
        <p>{t('modals.aboutText')}</p>
        <section className="standard-modal__section">
          <h3>{t('modals.howToUseTitle')}</h3>
          <ol>
            <li>{t('modals.howToUse1')}</li>
            <li>{t('modals.howToUse2')}</li>
            <li>{t('modals.howToUse3')}</li>
            <li>{t('modals.howToUse4')}</li>
          </ol>
        </section>
        <section className="standard-modal__section">
          <h3>{t('modals.originTitle')}</h3>
          <p>{t('modals.originText')}</p>
        </section>
      </StandardModal>
      <StandardModal open={showCredits} onClose={() => setShowCredits(false)}
        title={t('modals.creditsTitle')} size="sm">
        <p>
          {t('modals.creditsText')} <a href="https://github.com/nikteworks" target="_blank" rel="noopener noreferrer">@nikteworks</a> {t('modals.creditsTextEnd')}
        </p>
        <section className="standard-modal__section">
          <h3>{t('modals.specialThanks')}</h3>
          <p>
            {t('modals.salaryCalculations')} <a href="https://github.com/stevermeister/dutch-tax-income-calculator-npm" target="_blank" rel="noopener noreferrer">{t('modals.salaryLibrary')}</a> {t('modals.salaryLibraryBy')} <a href="https://buymeacoffee.com/stevermeister" target="_blank" rel="noopener noreferrer">{t('modals.byStepan')}</a>
          </p>
          <p>{t('modals.feedbackThanks')}</p>
        </section>
      </StandardModal>
      <StandardModal open={showTerms} onClose={() => setShowTerms(false)}
        title={t('modals.termsTitle')} size="md">
        <p><strong>{t('modals.termsEffectiveDate')}</strong> December 13, 2025</p>

        <section className="standard-modal__section">
          <h3>{t('modals.termsAcceptanceTitle')}</h3>
          <p>{t('modals.termsAcceptanceText')}</p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsEducationalTitle')}</h3>
          <p>{t('modals.termsEducationalText')}</p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsWarrantyTitle')}</h3>
          <p>{t('modals.termsWarrantyText')}</p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsLiabilityTitle')}</h3>
          <p>{t('modals.termsLiabilityText')}</p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsConsultationTitle')}</h3>
          <p>
            {t('modals.termsConsultationText')}{' '}
            <a href="https://www.belastingdienst.nl" target="_blank" rel="noopener noreferrer">
              {t('footer.belastingdienst')}
            </a>{' '}
            {t('modals.termsConsultationEnd')}
          </p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsPrivacyTitle')}</h3>
          <p>{t('modals.termsPrivacyText')}</p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsOpenSourceTitle')}</h3>
          <p>
            {t('modals.termsOpenSourceText')}{' '}
            <a href="https://github.com/nikteworks/incomeTaxNL" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {t('modals.termsOpenSourceEnd')}
          </p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsChangesTitle')}</h3>
          <p>{t('modals.termsChangesText')}</p>
        </section>

        <section className="standard-modal__section">
          <h3>{t('modals.termsContactTitle')}</h3>
          <p>
            {t('modals.termsContactText')}{' '}
            <a href="https://github.com/nikteworks/incomeTaxNL/issues" target="_blank" rel="noopener noreferrer">
              GitHub Issues
            </a>{' '}
            {t('modals.termsContactOr')}{' '}
            <a href="https://twitter.com/messages/compose?recipient_id=718363377798615041" target="_blank" rel="noopener noreferrer">
              {t('modals.termsContactDM')}
            </a>
            .
          </p>
        </section>
      </StandardModal>
    </div>
  )
}

PrimaryLayout.propTypes = {
  children: PropTypes.node.isRequired,
  guided: PropTypes.bool,
}

export default PrimaryLayout
