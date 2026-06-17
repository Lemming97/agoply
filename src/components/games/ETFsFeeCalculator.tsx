import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IconCoins } from '@tabler/icons-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface Props {
  isCompleted: boolean
  onComplete: () => void
}

export default function ETFsFeeCalculator({ isCompleted, onComplete }: Props) {
  const [initial, setInitial] = useState(10000)
  const [annualReturn, setAnnualReturn] = useState(7)
  const [feeA, setFeeA] = useState(0.07)
  const [feeB, setFeeB] = useState(1.5)
  const [touched, setTouched] = useState(new Set<string>())

  function handle(key: string, setter: (v: number) => void) {
    return (_: Event, val: number | number[]) => {
      setter(Array.isArray(val) ? val[0] : val)
      setTouched(prev => new Set([...prev, key]))
    }
  }

  const lineData = useMemo(() =>
    Array.from({ length: 21 }, (_, year) => ({
      year,
      'Low-cost ETF': Math.round(initial * Math.pow(1 + (annualReturn - feeA) / 100, year)),
      'Active Fund':  Math.round(initial * Math.pow(1 + (annualReturn - feeB) / 100, year)),
    })),
    [initial, annualReturn, feeA, feeB]
  )

  const finalA = lineData[20]['Low-cost ETF']
  const finalB = lineData[20]['Active Fund']
  const feesLost = finalA - finalB
  const feeDiff = feeB - feeA

  const insight = feeDiff < 0.5
    ? 'Small difference, big impact. Even 0.5% in extra fees costs you thousands over time.'
    : feeDiff < 1
    ? "That's a new car lost to fees. Always check the expense ratio before investing."
    : "That's a house deposit lost to fees. Low-cost index ETFs exist for a reason."

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<IconCoins size={14} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' } }}
        />
        {isCompleted && (
          <Chip label="Completed" size="small" sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 600, fontSize: 11 }} />
        )}
      </Stack>

      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, mb: 0.25 }}>
        Fee Impact Calculator
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mb: 2.5 }}>
        See how fees silently eat your returns over 20 years
      </Typography>

      {/* Sliders */}
      {[
        {
          key: 'initial', label: `€${initial.toLocaleString()} invested`, sublabel: 'Initial investment',
          value: initial, min: 1000, max: 50000, step: 1000, color: '#1D9E75',
          onChange: handle('initial', setInitial),
          marks: [{ value: 1000, label: '€1k' }, { value: 25000, label: '€25k' }, { value: 50000, label: '€50k' }],
          format: (v: number) => `€${(v / 1000).toFixed(0)}k`,
        },
        {
          key: 'return', label: `${annualReturn}% expected annual return`, sublabel: 'Annual return (same for both funds)',
          value: annualReturn, min: 3, max: 12, step: 0.5, color: '#2E86AB',
          onChange: handle('return', setAnnualReturn),
          marks: [{ value: 3, label: '3%' }, { value: 7, label: '7%' }, { value: 12, label: '12%' }],
          format: (v: number) => `${v}%`,
        },
        {
          key: 'feeA', label: `${feeA.toFixed(2)}% low-cost ETF fee`, sublabel: 'Low-cost ETF expense ratio',
          value: feeA, min: 0.03, max: 0.5, step: 0.01, color: '#1D9E75',
          onChange: handle('feeA', setFeeA),
          marks: [{ value: 0.03, label: '0.03%' }, { value: 0.25, label: '0.25%' }, { value: 0.5, label: '0.5%' }],
          format: (v: number) => `${v.toFixed(2)}%`,
        },
        {
          key: 'feeB', label: `${feeB.toFixed(1)}% active fund fee`, sublabel: 'Active fund expense ratio',
          value: feeB, min: 0.5, max: 2.5, step: 0.1, color: '#DC2626',
          onChange: handle('feeB', setFeeB),
          marks: [{ value: 0.5, label: '0.5%' }, { value: 1.5, label: '1.5%' }, { value: 2.5, label: '2.5%' }],
          format: (v: number) => `${v.toFixed(1)}%`,
        },
      ].map(({ key, label, sublabel, value, min, max, step, color, onChange, marks, format }) => (
        <Box key={key} sx={{ mb: 2.5 }}>
          <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', mb: 0.25 }}>{sublabel}</Typography>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color, mb: 0.5 }}>{label}</Typography>
          <Slider
            value={value} min={min} max={max} step={step}
            marks={marks} valueLabelDisplay="auto" valueLabelFormat={format}
            onChange={onChange}
            sx={{ color }}
          />
        </Box>
      ))}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tickFormatter={v => `Y${v}`} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={44} />
          <Tooltip formatter={(v: unknown, name: unknown) => [`€${Number(v).toLocaleString()}`, String(name ?? '')]} labelFormatter={l => `Year ${l}`} />
          <Legend />
          <Line type="monotone" dataKey="Low-cost ETF" stroke="#1D9E75" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="Active Fund"  stroke="#DC2626" strokeWidth={2.5} dot={false} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>

      {/* Results summary */}
      <Box sx={{ mt: 2.5, p: 2, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa' }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, mb: 1.5, textAlign: 'center', color: 'text.secondary' }}>
          After 20 Years
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
          {[
            { label: 'Low-cost ETF', value: `€${finalA.toLocaleString()}`, color: '#1D9E75' },
            { label: 'Active Fund',  value: `€${finalB.toLocaleString()}`, color: '#DC2626' },
            { label: 'You Lost',     value: `€${feesLost.toLocaleString()}`, color: '#E07B39' },
          ].map(({ label, value, color }) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled', mb: 0.25 }}>{label}</Typography>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color }}>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Hero number */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#DC2626' }}>
          You lost €{feesLost.toLocaleString()} to fees
        </Typography>
      </Box>

      {/* Insight */}
      <Box sx={{ mt: 1.5, mb: 2.5, p: 1.5, borderRadius: '10px', bgcolor: '#fff8f8', border: '1px solid #fee2e2' }}>
        <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#DC2626', lineHeight: 1.6 }}>
          {insight}
        </Typography>
      </Box>

      {touched.size >= 2 && (
        <Button
          fullWidth variant="contained" onClick={onComplete} disabled={isCompleted}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25, bgcolor: '#3AAFA9', '&:hover': { bgcolor: '#2e9a94' }, '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-400)' } }}
        >
          {isCompleted ? 'Already completed ✓' : "I'll always check fees! +20 XP"}
        </Button>
      )}
    </Box>
  )
}