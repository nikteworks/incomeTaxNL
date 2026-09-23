import { useLanguage } from '../../../context/LanguageContext.jsx'
import StandardModal from '../../../components/StandardModal.jsx'
import { useState } from 'react'
import {
  Button,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import './JaaropgaveGuide.css'

const BANK_GUIDE = {
  title: 'Bank Accounts (Jaaropgave)',
  icon: <AccountBalanceIcon />,
  description: 'Your bank sends a jaaropgave (annual statement) in January or February showing your balance on 1 January.',
  sections: [
    {
      heading: 'What to look for',
      items: [
        '"Saldo per 1 januari" or "Stand per 1 januari" — this is the balance you need',
        '"Vermogen op peildatum" — means wealth on reference date',
        'The document usually covers all accounts at that bank',
      ],
    },
    {
      heading: 'Common Dutch banks',
      items: [
        'ING — Look in "Jaaroverzicht" under "Spaargeld"',
        'Rabobank — "Jaaropgave" section "Vermogen"',
        'ABN AMRO — "Jaaroverzicht sparen en beleggen"',
        'ASN/RegioBank/SNS — "Jaaropgave" via de Volksbank',
        'Bunq — Check the app or web for "Year overview"',
      ],
    },
    {
      heading: 'Tips',
      items: [
        'Add each account separately for clarity, or combine if simpler',
        'Include all savings accounts, not just checking',
        'Foreign bank accounts held in the Netherlands count too',
      ],
    },
  ],
}

const INVESTMENT_GUIDE = {
  title: 'Investment Accounts (Beleggingen)',
  icon: <TrendingUpIcon />,
  description: 'Brokers and investment platforms provide an annual overview showing the market value of your portfolio on 1 January.',
  sections: [
    {
      heading: 'What to look for',
      items: [
        '"Waarde per 1 januari" or "Portefeuillewaarde" — total portfolio value',
        '"Marktwaarde" — market value of holdings',
        'Look for the value on 1 January, not 31 December',
      ],
    },
    {
      heading: 'Common platforms',
      items: [
        'DEGIRO — "Jaaroverzicht" PDF in your account',
        'Meesman — Annual statement via email or portal',
        'ABN AMRO Zelf Beleggen — Part of "Jaaroverzicht"',
        'Rabobank Beleggen — "Jaaropgave beleggingen"',
        'Brand New Day — "Jaaropgave" in your dashboard',
        'Binck/Saxo — "Annual overview" or "Jaarverslag"',
        'Trading 212 / Interactive Brokers — Year-end statement',
      ],
    },
    {
      heading: 'Tips',
      items: [
        'Use the total market value, not purchase price',
        'Include stocks, ETFs, bonds, and funds',
        'Pension accounts (pensioen) are usually exempt — check with your provider',
        'Crypto holdings are taxed in Box 3 — use value on 1 January',
      ],
    },
  ],
}

const GENERAL_INFO = {
  title: 'General Information',
  icon: <InfoOutlinedIcon />,
  description: 'Important dates and concepts for Box 3 tax.',
  sections: [
    {
      heading: 'Key date: 1 January (Peildatum)',
      items: [
        'Box 3 tax is based on your wealth on 1 January of the tax year',
        'For 2025 taxes, use balances from 1 January 2025',
        'This is called the "peildatum" (reference date)',
      ],
    },
    {
      heading: 'What counts as assets',
      items: [
        'Bank balances (spaarrekeningen, betaalrekeningen)',
        'Investments (aandelen, obligaties, ETFs)',
        'Crypto currencies',
        'Loans you gave to others',
        'Second homes (not your primary residence)',
      ],
    },
    {
      heading: 'Deductible debts (Schulden)',
      items: [
        'Mortgage on second home or investment property',
        'Personal loans and credit',
        'Debts for investments',
        'Note: Primary home mortgage is NOT deductible in Box 3',
        'Threshold: First €3,400 per person is not deductible',
      ],
    },
  ],
}

function JaaropgaveGuide() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState('panel-bank')

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleAccordionChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const renderGuideSection = (guide, panelId) => (
    <Accordion
      key={panelId}
      expanded={expanded === panelId}
      onChange={handleAccordionChange(panelId)}
      className="jaaropgave-guide__accordion"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <span className="jaaropgave-guide__icon">{guide.icon}</span>
          <Typography variant="subtitle1" fontWeight={600}>
            {guide.title}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {guide.description}
        </Typography>
        <Stack spacing={2}>
          {guide.sections.map((section, idx) => (
            <Box key={idx}>
              <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 0.5 }}>
                {section.heading}
              </Typography>
              <ul className="jaaropgave-guide__list">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )

  return (
    <>
      <Button
        variant="text"
        size="small"
        onClick={handleOpen}
        className="jaaropgave-guide__trigger"
      >
        Where can I find this information?
      </Button>

      <StandardModal open={open} onClose={handleClose} size="md"
        title={t('modals.statementTitle')}
        actions={<>
          <Button onClick={handleClose} variant="contained">
            {t('modals.close')}
          </Button>
        </>}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A jaaropgave is the annual statement from your bank or broker showing your balances for tax purposes.
          Here's how to find the values you need for Box 3.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {renderGuideSection(BANK_GUIDE, 'panel-bank')}
          {renderGuideSection(INVESTMENT_GUIDE, 'panel-investment')}
          {renderGuideSection(GENERAL_INFO, 'panel-general')}
        </Stack>
      </StandardModal>
    </>
  )
}

export default JaaropgaveGuide
