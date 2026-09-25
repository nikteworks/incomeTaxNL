import StandardModal from '../../../components/StandardModal.jsx'
import { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  InputAdornment,
  Tooltip,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Button,
  Typography,
} from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { BOX1_AVAILABLE_YEARS } from '../hooks/useBox1Calculator.js'
import {
  BOX1_EMPTY_FORM,
  INCOME_PERIODS,
  RULING_30_CATEGORIES,
} from '../constants/box1Defaults.js'
import { useLanguage } from '../../../context/LanguageContext.jsx'
import './Box1InputForm.css'

function Box1InputForm({ values, onChange, year, onYearChange, onReset, guided = false }) {
  const { t } = useLanguage()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleInputChange = useCallback((field, value) => {
    onChange(field, value)
  }, [onChange])

  const handleNumberChange = useCallback((field) => (event) => {
    const val = event.target.value
    // Allow empty string for clearing
    if (val === '') {
      handleInputChange(field, '')
      return
    }
    const numVal = parseFloat(val)
    if (!Number.isNaN(numVal)) {
      handleInputChange(field, numVal)
    }
  }, [handleInputChange])

  const handleToggleChange = useCallback((field) => (event) => {
    handleInputChange(field, event.target.checked)
  }, [handleInputChange])

  const handleSelectChange = useCallback((field) => (event) => {
    handleInputChange(field, event.target.value)
  }, [handleInputChange])

  // Get income label based on period
  const getIncomeLabel = () => {
    const periodLabels = {
      yearly: t('box1Form.annualGrossIncome'),
      monthly: t('box1Form.monthlyGrossIncome'),
      weekly: t('box1Form.weeklyGrossIncome'),
      daily: t('box1Form.dailyGrossIncome'),
      hourly: t('box1Form.hourlyGrossIncome'),
    }
    return periodLabels[values.period] || t('box1Form.grossIncome')
  }

  // Get translated period options
  const translatedPeriods = INCOME_PERIODS.map(p => ({
    ...p,
    label: t(`periods.${p.value}`)
  }))

  // Get translated ruling categories
  const translatedCategories = RULING_30_CATEGORIES.map(cat => ({
    ...cat,
    label: t(`box1Form.${cat.value === 'researchWorker' ? 'researchWorker' : cat.value === 'youngProfessional' ? 'youngProfessional' : 'other'}`)
  }))

  return (
    <form className="box1-form" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="box1-form__compact-card">
        {guided && (
          <div className="guided-basic-fields">
            <div className="guided-salary-field">
              <label htmlFor="guided-salary">{t('guidedRail.salary')}</label>
              <div className="guided-salary-input"><span aria-hidden="true">€</span><input
                id="guided-salary" type="number" min="0.01" step="any" value={values.grossIncome}
                onChange={handleNumberChange('grossIncome')} aria-describedby="guided-salary-help" aria-invalid={values.grossIncome !== '' && (!Number.isFinite(Number(values.grossIncome)) || Number(values.grossIncome) <= 0)}
              /></div>
              <p id="guided-salary-help" className={values.grossIncome !== '' && Number(values.grossIncome) <= 0 ? 'guided-salary-help--error' : 'guided-salary-help--quiet'}>{values.grossIncome !== '' && Number(values.grossIncome) <= 0 ? t('guidedRail.invalidSalary') : t('guidedRail.salaryHelp')}</p>
            </div>
            <div className="guided-income-period">
              <label htmlFor="guided-income-period">{t('box1Form.period')}</label>
              <select id="guided-income-period" value={values.period} onChange={handleSelectChange('period')}>
                {translatedPeriods.map(period => <option key={period.value} value={period.value}>{period.label}</option>)}
              </select>
            </div>
          </div>
        )}
        {!guided && (
          <div className="box1-form__income-row">
            <TextField
              label={getIncomeLabel()}
              type="number"
              value={values.grossIncome}
              onChange={handleNumberChange('grossIncome')}
              placeholder="e.g. 50000"
              className="box1-form__income-input"
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />
            <TextField
              select
              size="small"
              label={t('box1Form.period')}
              value={values.period}
              onChange={handleSelectChange('period')}
              className="box1-form__period-select"
              aria-label={t('box1Form.period')}
            >
              {translatedPeriods.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
        )}
        <div className="box1-form__actions-row">
          <div className="box1-form__main-ruling">
            <div className="box1-form__ruling-section">
              <FormControlLabel
                control={
                  <Switch
                    checked={values.ruling30Enabled}
                    onChange={handleToggleChange('ruling30Enabled')}
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <span>{t('box1Form.ruling30')}</span>
                    <Tooltip title={t('box1Form.ruling30Tooltip')}>
                      <InfoOutlinedIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Stack>
                }
              />
            </div>
          </div>
          <button type="button" className="advanced-options-link" aria-haspopup="dialog"
            onClick={() => setShowAdvanced(true)}>{t('box1Form.advancedOptions')}</button>
        </div>
      </div>
      <StandardModal open={showAdvanced} onClose={() => setShowAdvanced(false)}
        title={t('box1Form.advancedOptions')}>
        <Stack spacing={3} component={Box} className="box1-form__fields">
          {values.ruling30Enabled && <FormControl component="fieldset" className="box1-form__ruling-options">
            <FormLabel component="legend" className="box1-form__ruling-legend">{t('box1Form.category')}</FormLabel>
            <RadioGroup value={values.ruling30Category} onChange={handleSelectChange('ruling30Category')}
              className="box1-form__ruling-radio-group">
              {translatedCategories.map((cat) => <FormControlLabel key={cat.value} value={cat.value}
                control={<Radio size="small" />} label={cat.label} className="box1-form__ruling-radio-label" />)}
            </RadioGroup>
          </FormControl>}
          <div className="box1-form__year-row">
            <TextField
              select
              size="small"
              label={t('box1Form.taxYear')}
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="box1-form__year-select"
              aria-label={t('box1Form.taxYear')}
            >
              {BOX1_AVAILABLE_YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </div>
          {values.period === 'hourly' && (
            <TextField
              label={t('box1Form.hoursPerWeek')}
              type="number"
              value={values.hoursPerWeek}
              onChange={handleNumberChange('hoursPerWeek')}
              placeholder="40"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">{t('box1Form.hoursUnit')}</InputAdornment>,
              }}
              error={!Number.isFinite(Number(values.hoursPerWeek)) || Number(values.hoursPerWeek) <= 0 || Number(values.hoursPerWeek) > 168}
              helperText={Number(values.hoursPerWeek) > 0 && Number(values.hoursPerWeek) <= 168 ? t('box1Form.hoursHelperText') : t('guidedRail.invalidHours')}
            />
          )}

          <Box className="box1-form__toggles">
            <FormControlLabel
              control={
                <Switch
                  checked={values.holidayAllowanceIncluded}
                  onChange={handleToggleChange('holidayAllowanceIncluded')}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <span>{t('box1Form.holidayAllowanceIncluded')}</span>
                  <Tooltip title={t('box1Form.holidayAllowanceTooltip')}>
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </Stack>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={values.older}
                  onChange={handleToggleChange('older')}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <span>{guided ? t('guidedRail.pensionAge') : t('box1Form.olderAge')}</span>
                  <Tooltip title={t('box1Form.olderAgeTooltip')}>
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </Stack>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={values.socialSecurity}
                  onChange={handleToggleChange('socialSecurity')}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <span>{t('box1Form.socialSecurity')}</span>
                  <Tooltip title={t('box1Form.socialSecurityTooltip')}>
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </Stack>
              }
            />
          </Box>
          <Box className="box1-form__reset-section">
            <Button size="small" color="error" className="box1-form__reset-button"
              startIcon={<RestartAltIcon fontSize="small" />} aria-label={t('box1Form.reset')}
              onClick={() => setShowResetConfirm(true)}>
              {t('box1Form.reset')}
            </Button>
          </Box>
        </Stack>
      </StandardModal>

      {/* Reset confirmation dialog */}
      <StandardModal open={showResetConfirm} onClose={() => setShowResetConfirm(false)} size="xs"
        title={t('box1Form.resetTitle')}
        actions={<>
          <Button onClick={() => setShowResetConfirm(false)} color="inherit">
            {t('box1Form.cancel')}
          </Button>
          <Button
            onClick={() => {
              onReset()
              setShowResetConfirm(false)
            }}
            variant="contained"
            color="error"
          >
            {t('box1Form.reset')}
          </Button>
        </>}
      >
        <Typography variant="body2">
          {t('box1Form.resetMessage')}
        </Typography>
      </StandardModal>
    </form>
  )
}

Box1InputForm.propTypes = {
  guided: PropTypes.bool,
  values: PropTypes.shape({
    grossIncome: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    period: PropTypes.string,
    hoursPerWeek: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    holidayAllowanceIncluded: PropTypes.bool,
    older: PropTypes.bool,
    ruling30Enabled: PropTypes.bool,
    ruling30Category: PropTypes.string,
    socialSecurity: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  year: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
}

export default Box1InputForm
