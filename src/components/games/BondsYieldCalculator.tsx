import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconCalculator, IconAlertTriangle, IconChartBar,
  IconBulb, IconRocket, IconArrowUpRight, IconArrowDownRight,
} from '@tabler/icons-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceDot,
} from 'recharts'

interface Props {
  isCompleted: boolean
  onComplete: () => void
}

export default function BondsYieldCalculator({ isCompleted, onComplete }: Props) {
  const [rate, setRate] = useState(5)
  const [slideCount, setSlideCount] = useState(0)

  const bondPrice = Math.min(2000, Math.max(400, Math.round(5000 / rate)))
  const yourYield = Math.round((50 / bondPrice) * 1000) / 10

  const chartData = useMemo(() => {
    const data = []
    for (let r = 10; r <= 150; r += 5) {
      const rv = r / 10
      data.push({ rate: rv, price: Math.min(2000, Math.max(400, Math.round(5000 / rv))) })
    }
    return data
  }, [])

  function handleSlider(_: Event, val: number | number[]) {
    setRate(Array.isArray(val) ? val[0] : val)
    setSlideCount(c => c + 1)
  }

  const priceUp = rate < 5
  const priceDown = rate > 5
  const priceColor = priceDown ? '#DC2626' : priceUp ? '#1D9E75' : '#666'

  const insight = rate > 8
    ? { Icon: IconAlertTriangle, color: '#DC2626', text: 'High rates crush bond prices. Existing bondholders lose money when rates spike.' }
    : rate >= 5
    ? { Icon: IconChartBar, color: '#2E86AB', text: 'Moderate rates — bond prices are below face value but yields are attractive.' }
    : rate >= 3
    ? { Icon: IconBulb, color: '#C08B00', text: 'Low rates push bond prices above face value. Good for existing holders!' }
    : { Icon: IconRocket, color: '#7C3AED', text: 'Very low rates mean bond prices soar far above face value.' }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<IconCalculator size={14} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' } }}
        />
        {isCompleted && (
          <Chip label="Completed" size="small" sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 600, fontSize: 11 }} />
        )}
      </Stack>

      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, mb: 0.25 }}>
        Bonds Yield Calculator
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mb: 2 }}>
        See how interest rates affect bond prices in real time
      </Typography>

      {/* Explainer */}
      <Box sx={{ bgcolor: 'var(--teal-50)', borderRadius: '10px', p: 2, mb: 3 }}>
        <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--teal-700, #065f46)', lineHeight: 1.7 }}>
          A bond pays a fixed <strong>€50/year</strong> coupon on a <strong>€1,000</strong> face value.
          When market interest rates change, the bond's price adjusts so its yield matches the market rate.
          Drag the slider to see this in action.
        </Typography>
      </Box>

      {/* Slider */}
      <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, mb: 0.5 }}>
        Market Interest Rate
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#1D9E75', mb: 1 }}>
        {rate}% interest rate
      </Typography>
      <Slider
        value={rate}
        min={1}
        max={15}
        step={0.5}
        marks={[{ value: 1, label: '1%' }, { value: 5, label: '5%' }, { value: 10, label: '10%' }, { value: 15, label: '15%' }]}
        valueLabelDisplay="auto"
        valueLabelFormat={v => `${v}%`}
        onChange={handleSlider}
        sx={{ color: '#1D9E75', mb: 3 }}
      />

      {/* Live stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 3 }}>
        {[
          { label: 'Bond Face Value', value: '€1,000', color: 'text.primary', sub: null },
          {
            label: 'Bond Price',
            value: `€${bondPrice.toLocaleString()}`,
            color: priceColor,
            sub: priceDown ? (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, mt: 0.25 }}>
                <IconArrowDownRight size={13} strokeWidth={1.5} color="#DC2626" />
                <Typography sx={{ fontSize: 10, color: '#DC2626', fontFamily: 'var(--font-body)' }}>Price fell</Typography>
              </Stack>
            ) : priceUp ? (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, mt: 0.25 }}>
                <IconArrowUpRight size={13} strokeWidth={1.5} color="#1D9E75" />
                <Typography sx={{ fontSize: 10, color: '#1D9E75', fontFamily: 'var(--font-body)' }}>Price rose</Typography>
              </Stack>
            ) : null,
          },
          { label: 'Your Yield', value: `${yourYield}%`, color: 'text.primary', sub: null },
        ].map(({ label, value, color, sub }) => (
          <Box key={label} sx={{ bgcolor: '#f8f9fa', borderRadius: '10px', p: 1.5, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled', mb: 0.5 }}>{label}</Typography>
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color }}>{value}</Typography>
            {sub}
          </Box>
        ))}
      </Box>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bondAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="rate" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `€${v}`} tick={{ fontSize: 11 }} width={52} />
          <Tooltip formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, 'Bond Price']} labelFormatter={l => `Rate: ${l}%`} />
          <Area type="monotone" dataKey="price" stroke="#1D9E75" strokeWidth={2} fill="url(#bondAreaGrad)" dot={false} />
          <ReferenceDot x={rate} y={bondPrice} r={6} fill="#1D9E75" stroke="white" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Insight */}
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1, mt: 2, mb: 2.5, p: 1.5, borderRadius: '10px', bgcolor: '#f8f9fa', border: '1px solid var(--border, #E0E0E0)' }}>
        <insight.Icon size={18} strokeWidth={1.5} color={insight.color} style={{ flexShrink: 0, marginTop: 1 }} />
        <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6 }}>{insight.text}</Typography>
      </Stack>

      {/* Complete button */}
      {slideCount >= 3 && (
        <Button
          fullWidth
          variant="contained"
          onClick={onComplete}
          disabled={isCompleted}
          sx={{
            borderRadius: '10px', textTransform: 'none', fontWeight: 700,
            fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25,
            bgcolor: '#1D9E75', '&:hover': { bgcolor: '#0f6e56' },
            '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-400)' },
          }}
        >
          {isCompleted ? 'Already completed ✓' : 'I understand the relationship! +20 XP'}
        </Button>
      )}
    </Box>
  )
}