import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext.jsx'
import { useHydrated } from '../../../hooks/useHydrated.js'
import { useQueryState } from '../../../hooks/useQueryState.js'
import { patchQuery } from '../../../utils/urlState.js'

export default function CalculatorLink({ boxType }) {
  const { t, language } = useLanguage()
  const { location } = useQueryState()
  const hydrated = useHydrated()
  const target = hydrated
    ? patchQuery(location, { calcType: boxType })
    : `/?${language === 'nl' ? 'lang=nl&' : ''}calcType=${boxType}`

  const focusCalculator = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const calculator = document.getElementById('calculator')
    calculator?.focus({ preventScroll: true })
    calculator?.scrollIntoView({ block: 'start' })
  }

  return <Link to={target} onClick={focusCalculator}>{t(`guide.${boxType}Link`)}</Link>
}

CalculatorLink.propTypes = { boxType: PropTypes.oneOf(['box1', 'box3']).isRequired }
