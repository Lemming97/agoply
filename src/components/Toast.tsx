import type { ReactNode } from 'react'
import Snackbar from '@mui/material/Snackbar'

interface ToastProps {
  message: ReactNode
}

export default function Toast({ message }: ToastProps) {
  return (
    <Snackbar
      open={!!message}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      message={message}
      sx={{
        bottom: 28,
        '& .MuiSnackbarContent-root': {
          background: '#1a2e27',
          borderRadius: '24px',
          fontSize: 13,
          fontWeight: 500,
          minWidth: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          flexWrap: 'nowrap',
          whiteSpace: 'nowrap',
        },
      }}
    />
  )
}
