import StandardModal from '../../../components/StandardModal.jsx'
import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  IconButton,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
  Tooltip,
  MenuItem,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import RestoreIcon from '@mui/icons-material/Restore'
import { BOX3_DEFAULTS, BOX3_DEFAULTS_BY_YEAR, AVAILABLE_YEARS, getDefaultsForYear } from 'dutch-tax-box3-calculator'
import { useLanguage } from '../../../context/LanguageContext'
import './ConfigurationMenu.css'

function ConfigurationMenu({ config, onConfigChange }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [localConfig, setLocalConfig] = useState(config)
  const [errors, setErrors] = useState({})

  const handleOpen = () => {
    setLocalConfig(config)
    setErrors({})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const validateField = (path, value) => {
    const numValue = Number(value)
    if (value === '' || Number.isNaN(numValue)) {
      return t('config.validNumber')
    }
    if (path.includes('Rate') && (numValue < 0 || numValue > 100)) {
      return t('config.rateRange')
    }
    if (!path.includes('Rate') && numValue < 0) {
      return t('config.notNegative')
    }
    return ''
  }

  const handleFieldChange = (section, field, value) => {
    const path = `${section}.${field}`
    const error = validateField(path, value)
    
    setErrors((prev) => ({
      ...prev,
      [path]: error,
    }))

    if (section === 'root') {
      setLocalConfig((prev) => ({
        ...prev,
        [field]: value,
      }))
    } else {
      setLocalConfig((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }))
    }
  }

  const handleResetDefaults = () => {
    const year = localConfig.year || BOX3_DEFAULTS.year
    const yearDefaults = getDefaultsForYear(year)
    setLocalConfig({ year, ...yearDefaults })
    setErrors({})
  }

  const handleYearChange = (newYear) => {
    const yearNum = Number(newYear)
    const yearDefaults = getDefaultsForYear(yearNum)
    // When year changes, load that year's defaults
    setLocalConfig({ year: yearNum, ...yearDefaults })
    setErrors({})
  }

  const hasErrors = Object.values(errors).some((e) => e !== '')

  const handleSave = () => {
    if (hasErrors) return

    // Convert string values to numbers
    const parsedConfig = {
      year: Number(localConfig.year),
      thresholds: {
        taxFreeAssetsPerIndividual: Number(localConfig.thresholds.taxFreeAssetsPerIndividual),
        debtsThresholdPerIndividual: Number(localConfig.thresholds.debtsThresholdPerIndividual),
      },
      taxRate: Number(localConfig.taxRate) / 100,
      assumedReturnRates: {
        bankBalance: Number(localConfig.assumedReturnRates.bankBalance) / 100,
        investmentAssets: Number(localConfig.assumedReturnRates.investmentAssets) / 100,
        debts: Number(localConfig.assumedReturnRates.debts) / 100,
      },
    }

    onConfigChange(parsedConfig)
    setOpen(false)
  }

  // Convert rates from decimals to percentages for display
  const displayConfig = {
    ...localConfig,
    taxRate: typeof localConfig.taxRate === 'number' ? localConfig.taxRate * 100 : localConfig.taxRate,
    assumedReturnRates: {
      bankBalance: typeof localConfig.assumedReturnRates?.bankBalance === 'number' 
        ? localConfig.assumedReturnRates.bankBalance * 100 
        : localConfig.assumedReturnRates?.bankBalance,
      investmentAssets: typeof localConfig.assumedReturnRates?.investmentAssets === 'number'
        ? localConfig.assumedReturnRates.investmentAssets * 100
        : localConfig.assumedReturnRates?.investmentAssets,
      debts: typeof localConfig.assumedReturnRates?.debts === 'number'
        ? localConfig.assumedReturnRates.debts * 100
        : localConfig.assumedReturnRates?.debts,
    },
  }

  return (
    <>
      <Tooltip title={t('config.openSettings')}>
        <IconButton
          onClick={handleOpen}
          className="config-menu__trigger"
          aria-label={t('config.openSettings')}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <StandardModal open={open} onClose={handleClose} size="sm"
        title={t('config.title')}
        headerActions={<Tooltip title={t('config.resetToDefaults')}>
            <IconButton onClick={handleResetDefaults} size="small" aria-label={t('config.resetToDefaults')}>
              <RestoreIcon />
            </IconButton>
          </Tooltip>}
        actions={<>
          <Button onClick={handleClose} color="inherit">
            {t('config.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={hasErrors}>
            {t('config.save')}
          </Button>
        </>}
      >
        <Stack spacing={3}>
          {/* Year */}
          <TextField
            select
            label={t('config.taxYear')}
            size="small"
            value={displayConfig.year}
            onChange={(e) => handleYearChange(e.target.value)}
            helperText={t('config.yearHelperText')}
          >
            {AVAILABLE_YEARS.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          {/* Thresholds Section */}
          <div>
            <Typography variant="subtitle2" className="config-menu__section-title">
              {t('config.thresholds')}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label={t('config.taxFreeAssets')}
                type="number"
                size="small"
                value={displayConfig.thresholds?.taxFreeAssetsPerIndividual ?? ''}
                onChange={(e) => handleFieldChange('thresholds', 'taxFreeAssetsPerIndividual', e.target.value)}
                error={!!errors['thresholds.taxFreeAssetsPerIndividual']}
                helperText={errors['thresholds.taxFreeAssetsPerIndividual'] || t('config.taxFreeAssetsHelper')}
                fullWidth
              />
              <TextField
                label={t('config.debtsThreshold')}
                type="number"
                size="small"
                value={displayConfig.thresholds?.debtsThresholdPerIndividual ?? ''}
                onChange={(e) => handleFieldChange('thresholds', 'debtsThresholdPerIndividual', e.target.value)}
                error={!!errors['thresholds.debtsThresholdPerIndividual']}
                helperText={errors['thresholds.debtsThresholdPerIndividual'] || t('config.debtsThresholdHelper')}
                fullWidth
              />
            </Stack>
          </div>

          <Divider />

          {/* Tax Rate */}
          <TextField
            label={t('config.taxRate')}
            type="number"
            size="small"
            value={displayConfig.taxRate ?? ''}
            onChange={(e) => handleFieldChange('root', 'taxRate', e.target.value)}
            error={!!errors['root.taxRate']}
            helperText={errors['root.taxRate'] || t('config.taxRateHelper')}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />

          <Divider />

          {/* Assumed Return Rates */}
          <div>
            <Typography variant="subtitle2" className="config-menu__section-title">
              {t('config.assumedReturnRates')}
            </Typography>
            <Typography variant="caption" color="text.secondary" className="config-menu__section-description">
              {t('config.assumedReturnRatesDesc')}
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label={t('config.bankBalanceRate')}
                type="number"
                size="small"
                value={displayConfig.assumedReturnRates?.bankBalance ?? ''}
                onChange={(e) => handleFieldChange('assumedReturnRates', 'bankBalance', e.target.value)}
                error={!!errors['assumedReturnRates.bankBalance']}
                helperText={errors['assumedReturnRates.bankBalance']}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                fullWidth
              />
              <TextField
                label={t('config.investmentAssetsRate')}
                type="number"
                size="small"
                value={displayConfig.assumedReturnRates?.investmentAssets ?? ''}
                onChange={(e) => handleFieldChange('assumedReturnRates', 'investmentAssets', e.target.value)}
                error={!!errors['assumedReturnRates.investmentAssets']}
                helperText={errors['assumedReturnRates.investmentAssets']}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                fullWidth
              />
              <TextField
                label={t('config.debtsRate')}
                type="number"
                size="small"
                value={displayConfig.assumedReturnRates?.debts ?? ''}
                onChange={(e) => handleFieldChange('assumedReturnRates', 'debts', e.target.value)}
                error={!!errors['assumedReturnRates.debts']}
                helperText={errors['assumedReturnRates.debts']}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                fullWidth
              />
            </Stack>
          </div>
        </Stack>
      </StandardModal>
    </>
  )
}

ConfigurationMenu.propTypes = {
  config: PropTypes.shape({
    year: PropTypes.number.isRequired,
    thresholds: PropTypes.shape({
      taxFreeAssetsPerIndividual: PropTypes.number.isRequired,
      debtsThresholdPerIndividual: PropTypes.number.isRequired,
    }).isRequired,
    taxRate: PropTypes.number.isRequired,
    assumedReturnRates: PropTypes.shape({
      bankBalance: PropTypes.number.isRequired,
      investmentAssets: PropTypes.number.isRequired,
      debts: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  onConfigChange: PropTypes.func.isRequired,
}

export default ConfigurationMenu
