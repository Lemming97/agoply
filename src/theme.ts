import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary:    { main: '#1D9E75', light: '#E1F5EE', dark: '#0F6E56', contrastText: '#fff' },
    secondary:  { main: '#FFB300', light: '#FFF8E1', dark: '#C08B00' },
    error:      { main: '#E24B4A', light: '#FCEBEB' },
    warning:    { main: '#C08B00', light: '#FFF8E1' },
    background: { default: '#F8FFFE', paper: '#ffffff' },
    text:       { primary: '#1a2e27', secondary: '#5a7a6e' },
    divider:    '#D0EDE5',
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
  shape: { borderRadius: 14 },
  components: {
    MuiButton:     { defaultProps: { disableElevation: true } },
    MuiCard:       { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #D0EDE5' } } },
    MuiPaper:      { defaultProps: { elevation: 0 } },
    MuiChip:       { defaultProps: { size: 'small' } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, backgroundColor: '#e8e8e8' } } },
  },
})

export default theme
