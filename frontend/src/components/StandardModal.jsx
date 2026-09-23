import { useId } from 'react'
import PropTypes from 'prop-types'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { useLanguage } from '../context/LanguageContext.jsx'
import './StandardModal.css'

const modalTheme = createTheme({
  palette: {
    primary: { main: '#2246ae' },
    text: { primary: '#172941', secondary: '#465770' },
    background: { paper: '#f9fbfd' },
    divider: '#cbd4df',
  },
  typography: { fontFamily: 'var(--brand-font-family)', button: { textTransform: 'none' } },
  shape: { borderRadius: 6 },
})

/** Shared dialog frame. Callers retain ownership of validation and dismissal guards. */
export default function StandardModal({ open, onClose, title, children, actions, headerActions, summary, size = 'sm' }) {
  const titleId = useId()
  const { t } = useLanguage()

  return (
    <ThemeProvider theme={modalTheme}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth={size} scroll="paper"
        aria-labelledby={titleId} className="standard-modal">
        <div className="standard-modal__header">
          <div className="standard-modal__heading">
            <DialogTitle id={titleId}>{title}</DialogTitle>
            {summary && <div className="standard-modal__summary">{summary}</div>}
          </div>
          <div className="standard-modal__header-actions">
            {headerActions}
            <IconButton onClick={() => onClose()} aria-label={t('modals.close')} className="standard-modal__close">
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        <DialogContent className="standard-modal__content">{children}</DialogContent>
        <DialogActions className="standard-modal__actions">
          {actions ?? <Button variant="outlined" onClick={() => onClose()}>{t('modals.close')}</Button>}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

StandardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  headerActions: PropTypes.node,
  summary: PropTypes.node,
  size: PropTypes.oneOf(['xs', 'sm', 'md']),
}
