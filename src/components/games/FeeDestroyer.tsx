import { useRef, useEffect, useState, useCallback } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IconShield, IconArrowRight, IconArrowLeft, IconChevronRight } from '@tabler/icons-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

interface Props { isCompleted: boolean; onComplete: () => void }

const ROUNDS = [
  { name: 'Active Fund',  feeLabel: '1.5%', speed: 2, spawnMs: 2000, maxBullets: 3, hColor: '#FBBF24' },
  { name: 'Hedge Fund',   feeLabel: '2%',   speed: 3, spawnMs: 1500, maxBullets: 4, hColor: '#F97316' },
  { name: 'Worst Case',   feeLabel: '2.5%', speed: 4, spawnMs: 1000, maxBullets: 5, hColor: '#EF4444' },
] as const

const CANVAS_H       = 380
const START_PORTFOLIO= 10_000
const ETF_PORTFOLIO  = Math.round(10_000 * (1 - 0.0007)) // 9993
const SAVE_PER_BLOCK = 50
const DAMAGE_PER_HIT = 100
const ROUND_SECS     = 30
const LEVEL_COLOR    = '#D45F8A'
const PORT_W = 80, PORT_H = 30, SHIELD_W = 100, SHIELD_H = 8

interface Bullet    { id: number; x: number; y: number; w: number; label: string; speed: number }
interface Particle  { x: number; y: number; vx: number; vy: number; alpha: number; red: boolean }
interface FText     { x: number; y: number; text: string; red: boolean; alpha: number }
interface Star      { x: number; y: number; r: number; s: number }
interface RoundRes  { portfolio: number; etf: number; hit: number }

type Phase = 'howToPlay' | 'countdown' | 'playing' | 'between' | 'results'

let bulletSeq = 0

function makeStars(w: number): Star[] {
  return Array.from({ length: 20 }, () => ({
    x: Math.random() * w, y: Math.random() * CANVAS_H,
    r: Math.random() * 1.5 + 0.5, s: Math.random() * 0.4 + 0.2,
  }))
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function drawBg(ctx: CanvasRenderingContext2D, W: number) {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
  g.addColorStop(0, '#085041'); g.addColorStop(1, '#0F6E56')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, CANVAS_H)
}

export default function FeeDestroyer({ isCompleted, onComplete }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [phase,        setPhase]       = useState<Phase>('howToPlay')
  const [roundIdx,     setRoundIdx]    = useState(0)
  const [portfolio,    setPortfolio]   = useState(START_PORTFOLIO)
  const [saved,        setSaved]       = useState(0)
  const [timeLeft,     setTimeLeft]    = useState(ROUND_SECS)
  const [results,      setResults]     = useState<RoundRes[]>([])
  const [earlyOut,     setEarlyOut]    = useState(false)
  const [earlyRound,   setEarlyRound]  = useState(0)
  const [cdNum,        setCdNum]       = useState(3)

  // mutable refs — game loop reads these directly (no stale closures)
  const phaseR   = useRef<Phase>('howToPlay')
  const roundR   = useRef(0)
  const portR    = useRef(START_PORTFOLIO)
  const savedR   = useRef(0)
  const timeR    = useRef(ROUND_SECS)
  const pxR      = useRef(250)          // portfolio center X
  const cwR      = useRef(500)          // canvas width
  const bulletsR = useRef<Bullet[]>([])
  const partsR   = useRef<Particle[]>([])
  const ftextsR  = useRef<FText[]>([])
  const starsR   = useRef<Star[]>([])
  const keysR    = useRef<Record<string, boolean>>({})
  const rafR     = useRef(0)
  const spawnTR  = useRef(0)
  const lastTR   = useRef(0)
  const deadR    = useRef(false)
  const resR     = useRef<RoundRes[]>([])
  const endR     = useRef<(early?: boolean) => void>(() => {})
  const cdTimerR = useRef<ReturnType<typeof setTimeout> | null>(null)

  // sync helpers
  const sPhase = (p: Phase) => { phaseR.current = p; setPhase(p) }
  const sPort  = (v: number) => { portR.current  = v; setPortfolio(v) }
  const sSaved = (v: number) => { savedR.current = v; setSaved(v) }
  const sTime  = (v: number) => { timeR.current  = v; setTimeLeft(v) }
  const sRound = (i: number) => { roundR.current = i; setRoundIdx(i) }

  const portY   = () => CANVAS_H - PORT_H - 10
  const shieldY = () => portY() - SHIELD_H - 5

  function burst(x: number, y: number, red: boolean) {
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8
      partsR.current.push({ x, y, vx: Math.cos(a) * (Math.random() * 3 + 1), vy: Math.sin(a) * (Math.random() * 3 + 1), alpha: 1, red })
    }
  }
  function floatText(x: number, y: number, text: string, red: boolean) {
    ftextsR.current.push({ x, y, text, red, alpha: 1 })
  }

  const loop = useCallback((ts: number) => {
    if (phaseR.current !== 'playing') return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const W = canvas.width

    if (!lastTR.current) lastTR.current = ts
    const dt = ts - lastTR.current; lastTR.current = ts

    const newTime = timeR.current - dt / 1000
    if (newTime <= 0) { endR.current(); return }
    sTime(Math.max(0, newTime))

    const K = keysR.current
    if (K['ArrowLeft']  || K['a']) pxR.current = Math.max(PORT_W / 2, pxR.current - 5)
    if (K['ArrowRight'] || K['d']) pxR.current = Math.min(W - PORT_W / 2, pxR.current + 5)

    const cfg = ROUNDS[roundR.current]
    if (ts - spawnTR.current > cfg.spawnMs && bulletsR.current.length < cfg.maxBullets) {
      const isHidden = roundR.current === 2 && Math.random() < 0.2
      const bw = isHidden ? 40 : 12
      bulletsR.current.push({ id: ++bulletSeq, x: Math.random() * (W - bw - 10) + 5, y: -22, w: bw, label: isHidden ? 'HIDDEN' : cfg.feeLabel, speed: cfg.speed })
      spawnTR.current = ts
    }

    drawBg(ctx, W)

    for (const s of starsR.current) {
      s.y += s.s; if (s.y > CANVAS_H) s.y = 0
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill()
    }

    ctx.font = 'bold 11px system-ui,sans-serif'; ctx.textAlign = 'left'
    ctx.fillStyle = cfg.hColor; ctx.fillText(`${cfg.name} — ${cfg.feeLabel} fee`, 10, 18)
    ctx.font = 'bold 14px system-ui,sans-serif'; ctx.textAlign = 'right'
    ctx.fillStyle = timeR.current < 10 ? '#EF4444' : '#fff'
    ctx.fillText(`${Math.ceil(timeR.current)}s`, W - 10, 18)

    const pX = pxR.current, pY = portY(), sY = shieldY()
    const shL = pX - SHIELD_W / 2, portL = pX - PORT_W / 2, portR2 = pX + PORT_W / 2

    const alive: Bullet[] = []
    for (const b of bulletsR.current) {
      b.y += b.speed
      const bcx = b.x + b.w / 2, bot = b.y + 22
      const inSX = bcx >= shL && bcx <= shL + SHIELD_W
      const inPX = bcx >= portL && bcx <= portR2

      if (bot >= sY && b.y < sY + SHIELD_H && inSX) {
        sSaved(savedR.current + SAVE_PER_BLOCK)
        burst(bcx, sY, false); floatText(bcx, sY - 8, `+€${SAVE_PER_BLOCK}`, false)
        continue
      }
      if (bot >= pY && inPX) {
        const np = portR.current - DAMAGE_PER_HIT
        sPort(Math.max(0, np))
        burst(bcx, pY, true); floatText(bcx, pY - 8, `-€${DAMAGE_PER_HIT}`, true)
        if (np <= 0 && !deadR.current) { deadR.current = true; endR.current(true); return }
        continue
      }
      if (b.y > CANVAS_H + 25) continue
      alive.push(b)
      ctx.fillStyle = b.w > 12 ? '#DC2626' : '#EF4444'
      rr(ctx, b.x, b.y, b.w, 22, 3); ctx.fill()
      ctx.font = `bold ${b.w > 12 ? 7 : 9}px system-ui,sans-serif`
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
      ctx.fillText(b.label, b.x + b.w / 2, b.y + 14)
    }
    bulletsR.current = alive

    ctx.fillStyle = '#1D9E75'; rr(ctx, shL, sY, SHIELD_W, SHIELD_H, 3); ctx.fill()
    ctx.fillStyle = '#FFD700'; rr(ctx, portL, pY, PORT_W, PORT_H, 4); ctx.fill()
    ctx.font = 'bold 10px system-ui,sans-serif'; ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'center'
    ctx.fillText(`€${portR.current.toLocaleString()}`, pX, pY + 19)

    partsR.current = partsR.current.filter(p => p.alpha > 0.02)
    for (const p of partsR.current) {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.05
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = p.red ? `rgba(239,68,68,${p.alpha})` : `rgba(255,255,255,${p.alpha})`
      ctx.fill()
    }

    ftextsR.current = ftextsR.current.filter(f => f.alpha > 0.02)
    for (const f of ftextsR.current) {
      f.y -= 1.2; f.alpha -= 0.025
      ctx.font = 'bold 12px system-ui,sans-serif'; ctx.textAlign = 'center'
      ctx.fillStyle = f.red ? `rgba(239,68,68,${f.alpha})` : `rgba(255,215,0,${f.alpha})`
      ctx.fillText(f.text, f.x, f.y)
    }

    rafR.current = requestAnimationFrame(loop)
  }, [])

  function endRound(early = false) {
    cancelAnimationFrame(rafR.current)
    const r: RoundRes = { portfolio: portR.current, etf: ETF_PORTFOLIO, hit: START_PORTFOLIO - portR.current }
    const next = [...resR.current, r]
    resR.current = next; setResults([...next])
    if (early) { setEarlyOut(true); setEarlyRound(roundR.current + 1); sPhase('results') }
    else if (roundR.current >= 2) sPhase('results')
    else sPhase('between')
  }
  endR.current = endRound

  function drawCountdown(idx: number, n: number) {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const W = canvas.width, cfg = ROUNDS[idx]
    drawBg(ctx, W)
    for (const s of starsR.current) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill()
    }
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px system-ui,sans-serif'; ctx.fillStyle = '#fff'
    ctx.fillText(`Round ${idx + 1}`, W / 2, CANVAS_H / 2 - 55)
    ctx.font = '14px system-ui,sans-serif'; ctx.fillStyle = cfg.hColor
    ctx.fillText(`${cfg.name} — ${cfg.feeLabel} Annual Fee`, W / 2, CANVAS_H / 2 - 28)
    ctx.font = '12px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.fillText('DEFEND YOUR PORTFOLIO!', W / 2, CANVAS_H / 2)
    ctx.font = 'bold 72px system-ui,sans-serif'; ctx.fillStyle = '#FFD700'
    ctx.fillText(String(n), W / 2, CANVAS_H / 2 + 65)
  }

  function startRound(idx: number) {
    cancelAnimationFrame(rafR.current)
    if (cdTimerR.current) clearTimeout(cdTimerR.current)
    bulletsR.current = []; partsR.current = []; ftextsR.current = []
    spawnTR.current = 0; lastTR.current = 0; deadR.current = false
    sPort(START_PORTFOLIO); sTime(ROUND_SECS); sRound(idx)
    pxR.current = cwR.current / 2
    sPhase('countdown'); setCdNum(3)
    // wait one frame so canvas is visible and sized correctly
    setTimeout(() => {
      const canvas = canvasRef.current, cont = containerRef.current
      if (canvas && cont) {
        const w = Math.min(cont.clientWidth, 500)
        if (w > 0) { canvas.width = w; canvas.height = CANVAS_H; cwR.current = w; pxR.current = w / 2; starsR.current = makeStars(w) }
      }
      drawCountdown(idx, 3)
      let n = 3
      const tick = () => {
        n--
        if (n <= 0) { sPhase('playing'); rafR.current = requestAnimationFrame(loop) }
        else { setCdNum(n); cdTimerR.current = setTimeout(() => { drawCountdown(idx, n); tick() }, 1000) }
      }
      cdTimerR.current = setTimeout(tick, 1000)
    }, 50)
  }

  function resetGame() {
    cancelAnimationFrame(rafR.current)
    if (cdTimerR.current) clearTimeout(cdTimerR.current)
    bulletsR.current = []; resR.current = []
    sSaved(0); setResults([]); setEarlyOut(false); sPhase('howToPlay')
  }

  useEffect(() => {
    const canvas = canvasRef.current, cont = containerRef.current
    if (!canvas || !cont) return
    const w = Math.min(window.innerWidth - 48, 500)
    canvas.width = w; canvas.height = CANVAS_H
    cwR.current = w; pxR.current = w / 2; starsR.current = makeStars(w)

    const ro = new ResizeObserver(() => {
      const nw = Math.min(cont.clientWidth, 500); if (nw <= 0) return
      canvas.width = nw; canvas.height = CANVAS_H
      cwR.current = nw; pxR.current = nw / 2; starsR.current = makeStars(nw)
    })
    ro.observe(cont)

    const onMM = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect(), sx = canvas.width / rect.width
      pxR.current = Math.max(PORT_W / 2, Math.min(canvas.width - PORT_W / 2, (e.clientX - rect.left) * sx))
    }
    const onTM = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect(), sx = canvas.width / rect.width
      pxR.current = Math.max(PORT_W / 2, Math.min(canvas.width - PORT_W / 2, (e.touches[0].clientX - rect.left) * sx))
    }
    const onKD = (e: KeyboardEvent) => { keysR.current[e.key] = true }
    const onKU = (e: KeyboardEvent) => { keysR.current[e.key] = false }

    canvas.addEventListener('mousemove', onMM)
    canvas.addEventListener('touchmove', onTM, { passive: false })
    window.addEventListener('keydown', onKD)
    window.addEventListener('keyup', onKU)
    return () => {
      cancelAnimationFrame(rafR.current)
      if (cdTimerR.current) clearTimeout(cdTimerR.current)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMM)
      canvas.removeEventListener('touchmove', onTM)
      window.removeEventListener('keydown', onKD)
      window.removeEventListener('keyup', onKU)
    }
  }, [])

  const showCanvas = phase === 'playing' || phase === 'countdown'
  const totalHit   = results.reduce((s, r) => s + r.hit, 0)
  const finalPort  = results[results.length - 1]?.portfolio ?? START_PORTFOLIO
  const totalEtf   = ETF_PORTFOLIO * Math.max(1, results.length)
  const lostToFees = Math.max(0, totalEtf - finalPort)
  const ratio      = saved / Math.max(1, saved + totalHit)

  const chartData = results.map((r, i) => ({
    name: `R${i + 1}`,
    'Your Portfolio': r.portfolio,
    'Low-cost ETF': r.etf,
  }))

  function perfLabel() {
    if (ratio > 0.8) return 'Fee destroyer!'
    if (ratio > 0.5) return 'Good defending!'
    return 'The fees won!'
  }
  function perfMsg() {
    if (ratio > 0.8) return 'You protected most of your portfolio. In real life, choosing a low-cost ETF does this automatically.'
    if (ratio > 0.5) return 'You saved a lot but some fees still got through. Every percentage point matters over decades.'
    return "The fees won this round! Imagine this happening every year for 20 years — that's why expense ratios matter."
  }

  return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Chip
          icon={<IconShield size={13} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{ bgcolor: `${LEVEL_COLOR}18`, color: LEVEL_COLOR, fontWeight: 700, fontSize: 10, height: 22 }}
        />
      </Stack>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
        Fee Destroyer
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>
        Block the fees before they eat your portfolio!
      </Typography>

      {/* HOW TO PLAY */}
      {phase === 'howToPlay' && (
        <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '14px', p: 2.5, mb: 2 }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, mb: 1.5 }}>
            How to Play
          </Typography>
          {[
            'Fee bullets fall from the sky',
            'Move your portfolio left and right',
            'Block bullets with your shield to save money',
            'Fees that get through reduce your portfolio',
            '3 rounds — each with higher fees',
          ].map((step, i) => (
            <Stack key={i} direction="row" sx={{ gap: 1.5, mb: 1, alignItems: 'flex-start' }}>
              <Box sx={{
                width: 22, height: 22, borderRadius: '50%', bgcolor: 'var(--teal-400)',
                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i + 1}
              </Box>
              <Typography sx={{ fontSize: 13, lineHeight: 1.5, pt: 0.25 }}>{step}</Typography>
            </Stack>
          ))}
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5, mb: 2, fontStyle: 'italic' }}>
            Can you protect your portfolio from greedy fees?
          </Typography>
          <Button
            variant="contained"
            fullWidth
            endIcon={<IconArrowRight size={16} strokeWidth={1.5} />}
            onClick={() => startRound(0)}
            sx={{ bgcolor: '#1D9E75', borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}
          >
            Start Game
          </Button>
        </Box>
      )}

      {/* STATS BAR */}
      {showCanvas && (
        <Stack direction="row" sx={{ gap: 1, mb: 1.5 }}>
          {[
            { label: 'PORTFOLIO', value: `€${portfolio.toLocaleString()}`, color: '#1D9E75' },
            { label: 'SAVED',     value: `€${saved.toLocaleString()}`,     color: '#C08B00' },
            { label: 'ROUND',     value: `${roundIdx + 1} of 3`,           color: LEVEL_COLOR },
          ].map(s => (
            <Box key={s.label} sx={{
              flex: 1, bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)',
              borderRadius: '10px', p: 1, textAlign: 'center',
            }}>
              <Typography sx={{ fontSize: 9.5, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.5px' }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: s.color }}>
                {s.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      {/* CANVAS — always in DOM, hidden when inactive */}
      <Box
        ref={containerRef}
        sx={{ width: '100%', maxWidth: 500, mx: 'auto', display: showCanvas ? 'block' : 'none' }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', borderRadius: 12, touchAction: 'none' }}
        />
      </Box>

      {/* MOBILE CONTROLS */}
      {showCanvas && (
        <Stack direction="row" sx={{ gap: 1, mt: 1.5 }}>
          {([
            { key: 'ArrowLeft',  El: <IconArrowLeft   size={24} strokeWidth={2} color="white" /> },
            { key: 'ArrowRight', El: <IconChevronRight size={24} strokeWidth={2} color="white" /> },
          ] as const).map(({ key, El }) => (
            <Button
              key={key}
              variant="contained"
              fullWidth
              onPointerDown={() => { keysR.current[key] = true }}
              onPointerUp={() => { keysR.current[key] = false }}
              onPointerLeave={() => { keysR.current[key] = false }}
              sx={{ height: 56, bgcolor: '#1D9E75', borderRadius: '10px', '&:hover': { bgcolor: '#177a5c' } }}
            >
              {El}
            </Button>
          ))}
        </Stack>
      )}

      {/* BETWEEN ROUNDS */}
      {phase === 'between' && results.length > 0 && (() => {
        const r = results[results.length - 1]
        const i = results.length - 1
        return (
          <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2.5, mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, mb: 2 }}>
              Round {i + 1} Complete
            </Typography>
            {[
              { label: 'Your portfolio (fees hit)',  val: `€${r.portfolio.toLocaleString()}`, red: r.portfolio < START_PORTFOLIO },
              { label: 'Low-cost ETF (0.07% fee)',   val: `€${r.etf.toLocaleString()}`,       red: false },
            ].map(row => (
              <Stack key={row.label} direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: row.red ? '#DC2626' : '#1D9E75' }}>{row.val}</Typography>
              </Stack>
            ))}
            <Box sx={{ height: '1px', bgcolor: 'var(--border,#E0E0E0)', my: 1 }} />
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Fees cost you this round</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
                €{Math.max(0, r.etf - r.portfolio).toLocaleString()}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              fullWidth
              endIcon={<IconArrowRight size={16} strokeWidth={1.5} />}
              onClick={() => startRound(roundIdx + 1)}
              sx={{ bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25, '&:hover': { bgcolor: '#b84d74' } }}
            >
              Next Round
            </Button>
          </Box>
        )
      })()}

      {/* RESULTS */}
      {phase === 'results' && (
        <>
          <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2.5, mb: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2 }}>
              <IconShield size={20} strokeWidth={1.5} color={LEVEL_COLOR} />
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>
                Fee Destroyer Results
              </Typography>
            </Stack>
            {earlyOut && (
              <Box sx={{ bgcolor: '#fff0f0', border: '1px solid #fca5a5', borderRadius: '10px', p: 1.5, mb: 2 }}>
                <Typography sx={{ fontSize: 12, color: '#DC2626', fontWeight: 600, lineHeight: 1.5 }}>
                  Portfolio wiped out by fees in Round {earlyRound}. This is why fees matter!
                </Typography>
              </Box>
            )}
            {[
              { label: 'Fees blocked (saved)',   val: `€${saved.toLocaleString()}`,           color: '#1D9E75' },
              { label: 'Fees that got through',  val: `-€${totalHit.toLocaleString()}`,        color: '#DC2626' },
              { label: 'Final portfolio',        val: `€${finalPort.toLocaleString()}`,        color: 'text.primary' },
            ].map(r => (
              <Stack key={r.label} direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{r.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.val}</Typography>
              </Stack>
            ))}
            <Box sx={{ height: '1px', bgcolor: 'var(--border,#E0E0E0)', my: 1 }} />
            {[
              { label: 'Low-cost ETF total',  val: `€${totalEtf.toLocaleString()}`,           color: '#1D9E75' },
              { label: 'You lost to fees',    val: `-€${lostToFees.toLocaleString()}`,         color: '#DC2626' },
            ].map(r => (
              <Stack key={r.label} direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{r.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.val}</Typography>
              </Stack>
            ))}
          </Box>

          {chartData.length > 0 && (
            <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2, mb: 2 }}>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, mb: 1.5 }}>
                Portfolio vs Low-Cost ETF Per Round
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 10200]} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: unknown) => `€${Number(v).toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Your Portfolio" fill="#EF4444" radius={[3, 3, 0, 0] as [number, number, number, number]} />
                  <Bar dataKey="Low-cost ETF"   fill="#1D9E75" radius={[3, 3, 0, 0] as [number, number, number, number]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '10px', p: 1.5, mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-600)', mb: 0.5 }}>
              {perfLabel()}
            </Typography>
            <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: 'text.secondary' }}>
              {perfMsg()}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: '#fff8f0', border: '1px solid #fed7aa', borderRadius: '10px', p: 1.5, mb: 2.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C2460A', letterSpacing: '0.6px', mb: 0.5 }}>
              REAL WORLD IMPACT
            </Typography>
            <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: 'text.secondary' }}>
              A 2% annual fee sounds small. But on €10,000 over 20 years, it costs you €4,875 more than
              a 0.07% ETF. That&apos;s almost 50% of your original investment — lost to fees silently, every year.
            </Typography>
          </Box>

          <Stack sx={{ gap: 1 }}>
            {!isCompleted ? (
              <Button
                variant="contained"
                fullWidth
                onClick={onComplete}
                sx={{ bgcolor: '#1D9E75', borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}
              >
                I&apos;ll always check fees! +20 XP
              </Button>
            ) : (
              <Typography sx={{ textAlign: 'center', fontSize: 13, color: '#1D9E75', fontWeight: 600, py: 0.5 }}>
                +20 XP already earned
              </Typography>
            )}
            <Button
              variant="outlined"
              fullWidth
              onClick={resetGame}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}
            >
              Play Again
            </Button>
          </Stack>
        </>
      )}
    </Box>
  )
}
