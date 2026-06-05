import { useEffect, useState } from 'react'

interface ToastProps {
  message: string | null
}

export default function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setVisible(true)
    } else {
      const t = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(t)
    }
  }, [message])

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible && message ? '0' : '20px'})`,
      background: '#1a2e27',
      color: '#fff',
      padding: '11px 22px',
      borderRadius: 24,
      fontSize: 13,
      fontWeight: 500,
      zIndex: 9999,
      opacity: visible && message ? 1 : 0,
      transition: 'opacity 0.3s, transform 0.3s',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      {message}
    </div>
  )
}
