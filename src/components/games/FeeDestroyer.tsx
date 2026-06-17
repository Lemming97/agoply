import { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconShield, IconArrowRight, IconArrowLeft, IconChevronRight,
  IconBuildingBank, IconBolt,
} from '@tabler/icons-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import LottieAnimation from '../LottieAnimation'
import TrophyWinner from '../../assets/animations/Trophy_Winner.json'
import ThinkingAnim from '../../assets/animations/Thinking.json'

interface Props { isCompleted: boolean; onComplete: () => void }

// ─── Types ────────────────────────────────────────────────────────────────────
type BType  = 'regular' | 'zigzag' | 'wide' | 'fast' | 'split' | 'boss'
type PUType = 'etf' | 'waiver' | 'repair'
type Phase  = 'howToPlay' | 'countdown' | 'playing' | 'between' | 'gameOver' | 'results'

interface Bullet {
  id: number; type: BType; x: number; y: number; w: number; h: number
  speed: number; hp: number; maxHp: number
  dmg: number; shDmg: number; color: string; label: string; pts: number
  split: boolean; hitFlash: number; bossPulse: number
}
interface PBullet { id: number; x: number; y: number }
interface PowerUp  { id: number; type: PUType; x: number; y: number }
interface Particle { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }
interface FText    { x: number; y: number; text: string; color: string; life: number }
interface Star     { x: number; y: number; r: number; s: number }
interface RoundStat {
  blocked: number; shot: number; through: number
  powerUps: number; bossKilled: boolean
  pts: number; portfolioHP: number
}

// ─── Round configs ────────────────────────────────────────────────────────────
const ROUND_CFGS = [
  { n:1, name:'Active Fund',        fee:'1.5%/yr', dur:25, spd:1.8, spawnMs:2500, max:3,  bossAt:[],      weights:{regular:1} },
  { n:2, name:'Hedge Fund Entry',   fee:'2.0%/yr', dur:25, spd:2.2, spawnMs:2000, max:4,  bossAt:[12],    weights:{regular:.5,zigzag:.25,wide:.25} },
  { n:3, name:'Actively Managed',   fee:'2.5%/yr', dur:30, spd:2.6, spawnMs:1600, max:5,  bossAt:[15],    weights:{regular:.3,zigzag:.2,wide:.2,fast:.2,split:.1} },
  { n:4, name:'Hedge Fund Premium', fee:'3%+20%',  dur:30, spd:3.0, spawnMs:1300, max:6,  bossAt:[20,8],  weights:{regular:.25,zigzag:.2,wide:.15,fast:.25,split:.1,boss:.05} },
  { n:5, name:'WORST CASE',         fee:'4%+ALL',  dur:35, spd:3.5, spawnMs:1000, max:8,  bossAt:[28,18,8], weights:{regular:.25,zigzag:.15,wide:.15,fast:.2,split:.1,boss:.05} },
] as const

const BSPEC: Record<BType, { w:number; h:number; dmg:number; shDmg:number; color:string; label:string; pts:number; hp:number }> = {
  regular: { w:14,  h:22, dmg:8,  shDmg:10, color:'#EF4444', label:'1.5%',    pts:10,  hp:1 },
  zigzag:  { w:14,  h:22, dmg:12, shDmg:15, color:'#F97316', label:'???',      pts:20,  hp:1 },
  wide:    { w:50,  h:18, dmg:20, shDmg:25, color:'#DC2626', label:'5%',       pts:30,  hp:1 },
  fast:    { w:10,  h:28, dmg:15, shDmg:20, color:'#7C3AED', label:'20%!',     pts:25,  hp:1 },
  split:   { w:18,  h:18, dmg:10, shDmg:12, color:'#B45309', label:'2%+2%',    pts:40,  hp:1 },
  boss:    { w:40,  h:40, dmg:35, shDmg:40, color:'#991B1B', label:'TER 3%',   pts:100, hp:3 },
}

const ETF_TIPS = [
  'Hidden fees are the sneakiest — funds often bury them in fine print.',
  'Performance fees sound fair but managers charge them even in average years.',
  'Compound fees hit hardest over time — 2% per year for 20 years is 40% of your returns.',
  "The worst-case fund charges you going in, going out, and every year in between.",
]

const CANVAS_H   = 460
const LEVEL_COLOR = '#D45F8A'
const SHIELD_W   = 110, SHIELD_H = 10
const PORT_Y     = CANVAS_H - 28  // top of portfolio base
const SHIELD_Y   = PORT_Y - SHIELD_H - 6
const FIRE_Y     = SHIELD_Y - 6
const ETF_HP     = 99.93

let bSeq = 0, pSeq = 0, puSeq = 0

function rrect(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) {
  ctx.beginPath(); ctx.moveTo(x+r,y)
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r)
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r)
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r)
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r)
  ctx.closePath()
}

function makeStars(w:number): Star[] {
  return Array.from({length:25}, ()=>({ x:Math.random()*w, y:Math.random()*CANVAS_H, r:Math.random()*1.5+.5, s:Math.random()*.4+.2 }))
}

function pickType(weights: Record<string,number>): BType {
  const total = Object.values(weights).reduce((s,v)=>s+v,0)
  let r = Math.random() * total
  for (const [k,v] of Object.entries(weights)) { r -= v; if (r<=0) return k as BType }
  return 'regular'
}

function hpColor(hp:number): string {
  if (hp > 75) return '#1D9E75'
  if (hp > 50) return '#FFB300'
  if (hp > 25) return '#FF6B35'
  return '#EF4444'
}

function shieldColor(hp:number): string {
  if (hp > 50) return '#3B8FD4'
  if (hp > 25) return '#FFB300'
  return '#EF4444'
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FeeDestroyer({ isCompleted, onComplete }: Props) {
  // React state (UI)
  const [phase,        setPhase]      = useState<Phase>('howToPlay')
  const [roundIdx,     setRoundIdx]   = useState(0)
  const [portHP,       setPortHP]     = useState(100)
  const [shieldHP,     setShieldHP]   = useState(100)
  const [shieldDown,   setShieldDown] = useState(false)
  const [shieldRegenS, setShieldRegenS]=useState(0)
  const [score,        setScore]      = useState(0)
  const [mult,         setMult]       = useState(1.0)
  const [multDecay,    setMultDecay]  = useState(1.0)  // 1 = full grace, 0 = decaying
  const [roundSecs,    setRoundSecs]  = useState(25)
  const [cdNum,        setCdNum]      = useState(3)
  const [betweenStats, setBetweenStats] = useState<RoundStat|null>(null)
  const [allStats,     setAllStats]   = useState<RoundStat[]>([])

  // Refs (game loop)
  const phaseR     = useRef<Phase>('howToPlay')
  const roundR     = useRef(0)
  const portHPR    = useRef(100)
  const shieldHPR  = useRef(100)
  const shieldDnR  = useRef(false)
  const shieldRegR = useRef(0)
  const scoreR     = useRef(0)
  const multR      = useRef(1.0)
  const multGraceR = useRef(3.0)   // seconds before decay starts
  const roundSecsR = useRef(25)
  const pxR        = useRef(260)   // shield center X
  const cwR        = useRef(520)
  const bulletsR   = useRef<Bullet[]>([])
  const pbulletsR  = useRef<PBullet[]>([])
  const powerUpsR  = useRef<PowerUp[]>([])
  const particlesR = useRef<Particle[]>([])
  const ftextsR    = useRef<FText[]>([])
  const starsR     = useRef<Star[]>([])
  const shakeR     = useRef(0)
  const portFlashR = useRef(0)
  const shFlashR   = useRef(0)
  const fireCDR    = useRef(0)           // seconds until can fire again
  const lastSpawnR = useRef(0)
  const lastPUR    = useRef(0)
  const bossTrigsR = useRef<number[]>([])
  const bossTextR  = useRef(0)           // countdown for "TER APPROACHING" msg
  const feeStormR  = useRef(false)
  const waveTimerR = useRef(0)
  const blockedR   = useRef(0)
  const shotR      = useRef(0)
  const throughR   = useRef(0)
  const puR        = useRef(0)
  const bossKillR  = useRef(false)
  const roundPtsR  = useRef(0)
  const allStatsR  = useRef<RoundStat[]>([])
  const lastTickR  = useRef(0)
  const rafR       = useRef(0)
  const cdTimerR   = useRef<ReturnType<typeof setTimeout>|null>(null)
  const loopFnR    = useRef<(ts:number)=>void>(()=>{})
  const endRoundR  = useRef<()=>void>(()=>{})
  const keysR      = useRef<Record<string,boolean>>({})
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const contRef    = useRef<HTMLDivElement>(null)

  // keep phase ref in sync on render
  phaseR.current = phase

  // ── helpers ─────────────────────────────────────────────────────────────────
  function sPortHP(v:number) { const n=Math.max(0,Math.min(100,Math.round(v))); portHPR.current=n; setPortHP(n) }
  function sShieldHP(v:number) { const n=Math.max(0,Math.min(100,Math.round(v))); shieldHPR.current=n; setShieldHP(n) }
  function sScore(v:number) { scoreR.current=v; setScore(v) }
  function sMult(v:number)  { const n=Math.max(1,Math.min(4,v)); multR.current=n; setMult(n) }
  function sPhase(p:Phase)  { phaseR.current=p; setPhase(p) }

  function addMult(inc:number) {
    multGraceR.current = 3
    sMult(multR.current + inc)
    setMultDecay(1)
  }
  function addScore(pts:number) {
    const earned = Math.round(pts * multR.current)
    sScore(scoreR.current + earned)
    roundPtsR.current += earned
    return earned
  }

  function burst(x:number, y:number, color:string, n=6) {
    for (let i=0;i<n;i++) {
      const a=(Math.PI*2*i)/n
      particlesR.current.push({x,y,vx:Math.cos(a)*(Math.random()*3+1),vy:Math.sin(a)*(Math.random()*3+1),size:Math.random()*4+2,color,life:1})
    }
  }
  function ftext(x:number, y:number, text:string, color:string) {
    ftextsR.current.push({x,y,text,color,life:1})
  }

  function spawnBullet(spd: number, weights: Record<string,number>, ts:number) {
    const type = pickType(weights) as BType
    const sp   = BSPEC[type]
    const speed = type==='fast' ? spd*3 : type==='wide' ? spd*0.6 : type==='boss' ? spd*0.4 : spd
    const W = cwR.current
    const x = Math.max(0, Math.random()*(W-sp.w))
    bulletsR.current.push({ id:++bSeq, type, x, y:-sp.h, w:sp.w, h:sp.h, speed, hp:sp.hp, maxHp:sp.hp, dmg:sp.dmg, shDmg:sp.shDmg, color:sp.color, label:sp.label, pts:sp.pts, split:false, hitFlash:0, bossPulse:0 })
    if (type==='boss') {
      bossTextR.current = 2
      shakeR.current = 5
    }
    lastSpawnR.current = ts
  }

  function spawnSplitFragments(b: Bullet) {
    for (const angle of [-30, 30]) {
      const rad = (angle * Math.PI) / 180
      const sp  = BSPEC.regular
      bulletsR.current.push({
        id:++bSeq, type:'regular', x:b.x, y:b.y, w:8, h:14,
        speed: b.speed * Math.cos(rad) + 0.5,
        hp:1, maxHp:1, dmg:b.dmg, shDmg:b.shDmg,
        color:'#F59E0B', label:'2%', pts:20,
        split:true, hitFlash:0, bossPulse:0,
      })
    }
  }

  function doFire() {
    if (fireCDR.current > 0) return
    fireCDR.current = 0.4
    pbulletsR.current.push({ id:++pSeq, x:pxR.current, y:SHIELD_Y-2 })
  }

  function collectPowerUp(pu: PowerUp) {
    puR.current++; setShieldRegenS(0)
    addMult(0.5)
    const W = cwR.current
    if (pu.type === 'etf') {
      sPortHP(portHPR.current + 20)
      ftext(W/2, PORT_Y-20, '+20 HP', '#1D9E75')
      burst(pu.x, pu.y, '#1D9E75')
    } else if (pu.type === 'waiver') {
      let cleared = 0
      for (const b of bulletsR.current) { burst(b.x+b.w/2, b.y+b.h/2, b.color); cleared += addScore(b.pts) }
      bulletsR.current = []
      ftext(W/2, CANVAS_H/2, `+${cleared} CLEARED!`, '#FFD700')
    } else {
      sShieldHP(shieldHPR.current + 40)
      ftext(W/2, PORT_Y-20, '+40 SHIELD', '#3B8FD4')
      burst(pu.x, pu.y, '#3B8FD4')
    }
  }

  function endRound() {
    cancelAnimationFrame(rafR.current)
    const cfg = ROUND_CFGS[roundR.current]
    const stat: RoundStat = {
      blocked:blockedR.current, shot:shotR.current, through:throughR.current,
      powerUps:puR.current, bossKilled:bossKillR.current,
      pts:roundPtsR.current, portfolioHP:portHPR.current,
    }
    const newAll = [...allStatsR.current, stat]
    allStatsR.current = newAll
    setAllStats([...newAll])
    setBetweenStats(stat)
    if (roundR.current >= 4 || portHPR.current <= 0) { sPhase('results') }
    else { sPhase('between') }
  }
  endRoundR.current = endRound

  // ── game loop ────────────────────────────────────────────────────────────────
  loopFnR.current = (ts: number) => {
    if (phaseR.current !== 'playing') return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const W = canvas.width

    if (!lastTickR.current) lastTickR.current = ts
    const dt = Math.min((ts - lastTickR.current) / 1000, 0.05)
    lastTickR.current = ts

    const cfg = ROUND_CFGS[roundR.current]

    // round timer
    const prevSecs = roundSecsR.current
    roundSecsR.current = Math.max(0, roundSecsR.current - dt)
    if (Math.ceil(roundSecsR.current) !== Math.ceil(prevSecs)) setRoundSecs(Math.ceil(roundSecsR.current))
    if (roundSecsR.current <= 0) { endRoundR.current(); return }

    // boss triggers
    if (bossTrigsR.current.length > 0 && roundSecsR.current <= bossTrigsR.current[0]) {
      bossTrigsR.current = bossTrigsR.current.slice(1)
      spawnBullet(cfg.spd, { boss:1 }, ts)
    }

    // round-4 waves (every 8 seconds elapsed)
    if (roundR.current === 3) {
      waveTimerR.current += dt
      if (waveTimerR.current >= 8) {
        waveTimerR.current = 0
        for (let i=0;i<3;i++) {
          const x = (i+1)*(W/4) - 7
          bulletsR.current.push({id:++bSeq,type:'regular',x,y:-22,w:14,h:22,speed:cfg.spd,hp:1,maxHp:1,dmg:8,shDmg:10,color:'#EF4444',label:'1.5%',pts:10,split:false,hitFlash:0,bossPulse:0})
        }
      }
    }

    // round-5 fee storm at 15s remaining
    if (roundR.current === 4 && !feeStormR.current && roundSecsR.current <= 15) {
      feeStormR.current = true
      bossTextR.current = 2.5
      for (let i=0;i<5;i++) {
        const x = (i*(W/5)) + Math.random()*(W/5-14)
        bulletsR.current.push({id:++bSeq,type:'fast',x,y:-28,w:10,h:28,speed:cfg.spd*2.5,hp:1,maxHp:1,dmg:15,shDmg:20,color:'#7C3AED',label:'FEE!',pts:25,split:false,hitFlash:0,bossPulse:0})
      }
    }

    // spawn regular bullets
    if (ts - lastSpawnR.current > cfg.spawnMs && bulletsR.current.length < cfg.max) {
      spawnBullet(cfg.spd, cfg.weights as Record<string,number>, ts)
    }

    // spawn power-ups
    if (ts - lastPUR.current > (12000 + Math.random()*3000)) {
      const types: PUType[] = ['etf','etf','waiver','repair']
      powerUpsR.current.push({ id:++puSeq, type:types[Math.floor(Math.random()*4)], x:Math.random()*(W-24)+12, y:-20 })
      lastPUR.current = ts
    }

    // multiplier decay
    multGraceR.current -= dt
    if (multGraceR.current < 0 && multR.current > 1.0) {
      sMult(multR.current - 0.1*dt)
    }
    setMultDecay(Math.max(0, Math.min(1, multGraceR.current/3)))

    // fire cooldown
    if (fireCDR.current > 0) fireCDR.current = Math.max(0, fireCDR.current - dt)

    // keyboard
    const K = keysR.current
    if (K['ArrowLeft']||K['a'])  pxR.current = Math.max(SHIELD_W/2, pxR.current-6)
    if (K['ArrowRight']||K['d']) pxR.current = Math.min(W-SHIELD_W/2, pxR.current+6)

    // shield regen
    if (shieldDnR.current) {
      shieldRegR.current -= dt
      const d = Math.ceil(shieldRegR.current)
      setShieldRegenS(d)
      if (shieldRegR.current <= 0) {
        shieldDnR.current = false; setShieldDown(false)
        sShieldHP(25)
      }
    }

    // ── DRAW ──────────────────────────────────────────────────────────────────
    const sx = (Math.random()-.5)*shakeR.current*2, sy = (Math.random()-.5)*shakeR.current*2
    ctx.save(); ctx.translate(sx, sy)
    shakeR.current *= 0.8

    // background
    const g = ctx.createLinearGradient(0,0,0,CANVAS_H)
    g.addColorStop(0,'#061B14'); g.addColorStop(.6,'#0A3728'); g.addColorStop(1,'#0F6E56')
    ctx.fillStyle=g; ctx.fillRect(0,0,W,CANVAS_H)

    // stars
    for (const s of starsR.current) {
      s.y += s.s; if (s.y>CANVAS_H) s.y=0
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,.4)'; ctx.fill()
    }

    // header
    ctx.font='bold 11px system-ui,sans-serif'; ctx.textAlign='left'
    ctx.fillStyle=cfg.n<=2?'#FBBF24':cfg.n<=4?'#F97316':'#EF4444'
    ctx.fillText(`${cfg.name} · ${cfg.fee}`, 10, 18)
    ctx.textAlign='right'; ctx.fillStyle=roundSecsR.current<8?'#EF4444':'#fff'
    ctx.font='bold 14px system-ui,sans-serif'
    ctx.fillText(`${Math.ceil(roundSecsR.current)}s`, W-8, 18)

    // boss approaching text
    if (bossTextR.current > 0) {
      bossTextR.current -= dt
      const alpha = Math.min(1, bossTextR.current)
      ctx.save(); ctx.globalAlpha=alpha
      ctx.fillStyle=`rgba(255,255,255,0.15)`
      ctx.fillRect(0,0,W,CANVAS_H)
      ctx.globalAlpha = alpha
      ctx.font='bold 20px system-ui,sans-serif'; ctx.textAlign='center'
      ctx.fillStyle=roundR.current===4?'#EF4444':'#F97316'
      ctx.fillText(roundR.current===4&&feeStormR.current?'⚡ FEE STORM!':'⚠ TER APPROACHING', W/2, CANVAS_H/2-10)
      ctx.restore()
    }

    // portfolio flash
    if (portFlashR.current > 0) {
      ctx.fillStyle=`rgba(239,68,68,${portFlashR.current/3*0.35})`
      ctx.fillRect(0,0,W,CANVAS_H)
      portFlashR.current--
    }

    // update + draw power-ups
    const livePUs: PowerUp[] = []
    for (const pu of powerUpsR.current) {
      pu.y += 0.8
      if (pu.y > CANVAS_H) continue
      // player bullet collision
      let puHit = false
      for (const pb of pbulletsR.current) {
        if (pb.x>pu.x-20&&pb.x<pu.x+20&&pb.y>pu.y-20&&pb.y<pu.y+20) { collectPowerUp(pu); puHit=true; break }
      }
      if (puHit) continue
      // shield collision
      if (pu.y+20>=SHIELD_Y&&pu.y<PORT_Y&&Math.abs(pu.x-pxR.current)<=SHIELD_W/2+10) { collectPowerUp(pu); continue }
      livePUs.push(pu)
      // draw
      const c = pu.type==='etf'?'#1D9E75':pu.type==='waiver'?'#FFD700':'#3B8FD4'
      const lbl = pu.type==='etf'?'ETF':pu.type==='waiver'?'WAIVER':'REPAIR'
      ctx.fillStyle=c+'55'; ctx.strokeStyle=c; ctx.lineWidth=2
      rrect(ctx,pu.x-20,pu.y-10,40,20,6); ctx.fill(); ctx.stroke()
      ctx.font='bold 9px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillStyle=c
      ctx.fillText(lbl, pu.x, pu.y+4)
    }
    powerUpsR.current = livePUs

    // update + draw player bullets
    const livePB: PBullet[] = []
    for (const pb of pbulletsR.current) {
      pb.y -= 9
      if (pb.y < -20) continue
      livePB.push(pb)
      ctx.fillStyle='#FFD700'
      rrect(ctx,pb.x-3,pb.y,6,14,2); ctx.fill()
    }
    pbulletsR.current = livePB

    // update + draw enemy bullets
    const shL = pxR.current-SHIELD_W/2, shR = pxR.current+SHIELD_W/2
    const alive: Bullet[] = []
    for (const b of bulletsR.current) {
      // zigzag movement
      if (b.type==='zigzag') b.x += Math.sin(ts*0.003+b.id)*2.5
      b.x = Math.max(0, Math.min(W-b.w, b.x))
      b.y += b.speed

      // boss pulse
      if (b.type==='boss') b.bossPulse += 0.06

      // split check at midscreen
      if (b.type==='split'&&!b.split&&b.y>CANVAS_H/2) {
        b.split=true; spawnSplitFragments(b); burst(b.x+b.w/2,b.y+b.h/2,b.color); continue
      }

      const bcx=b.x+b.w/2, bBot=b.y+b.h

      // player bullet hit
      let bHit=false
      for (let i=0;i<pbulletsR.current.length;i++) {
        const pb=pbulletsR.current[i]
        if (pb.x>=b.x-2&&pb.x<=b.x+b.w+2&&pb.y>=b.y-2&&pb.y<=bBot+2) {
          b.hp--; b.hitFlash=3
          pbulletsR.current.splice(i,1); i--
          if (b.hp<=0) {
            bHit=true
            const earned=addScore(b.pts)
            burst(bcx,b.y+b.h/2,b.color); ftext(bcx,b.y,`+${earned}`, '#FFD700')
            if (b.type==='boss') bossKillR.current=true
            addMult(0.3)
            shotR.current++
            // split on hit
            if (b.type==='split'&&!b.split) { b.split=true; spawnSplitFragments(b) }
          }
          break
        }
      }
      if (bHit) continue

      // shield hit
      if (!shieldDnR.current&&bBot>=SHIELD_Y&&b.y<SHIELD_Y+SHIELD_H&&bcx>=shL&&bcx<=shR) {
        if (b.type==='split'&&!b.split) { b.split=true; spawnSplitFragments(b); burst(bcx,SHIELD_Y,b.color); continue }
        const newSh = shieldHPR.current - b.shDmg
        sShieldHP(newSh)
        shFlashR.current = 3
        const earned=addScore(b.pts); ftext(bcx,SHIELD_Y-10,`+${earned}`, '#FFD700')
        burst(bcx,SHIELD_Y,'#ffffff',5)
        addMult(0.2)
        blockedR.current++
        if (newSh<=0) {
          shieldDnR.current=true; setShieldDown(true)
          shieldRegR.current=4; setShieldRegenS(4)
          sMult(Math.max(1,multR.current-1))
          ftext(W/2, CANVAS_H/2-20, 'SHIELD DOWN!', '#EF4444')
          shakeR.current=8
        }
        continue
      }

      // portfolio hit
      if (bBot>=PORT_Y) {
        const newHP=portHPR.current-b.dmg
        sPortHP(newHP); throughR.current++
        portFlashR.current=3; shakeR.current=b.dmg*0.4
        ftext(bcx,PORT_Y-15,`-${b.dmg}HP`,'#EF4444')
        burst(bcx,PORT_Y,'#EF4444')
        sMult(Math.max(1,multR.current-0.5))
        if (newHP<=0) { endRoundR.current(); ctx.restore(); return }
        continue
      }

      if (b.y>CANVAS_H+10) continue
      alive.push(b)

      // draw
      const pulse = b.type==='boss' ? 1+Math.sin(b.bossPulse)*0.1 : 1
      const bw=b.w*pulse, bh=b.h*pulse
      const bx=bcx-bw/2, by=b.y+(b.h-bh)/2
      ctx.fillStyle = b.hitFlash>0 ? '#ffffff' : b.color
      if (b.hitFlash>0) b.hitFlash--
      rrect(ctx,bx,by,bw,bh,3); ctx.fill()
      ctx.font=`bold ${b.type==='boss'?9:b.w>30?8:9}px system-ui,sans-serif`
      ctx.fillStyle= b.hitFlash>0?b.color:'#fff'; ctx.textAlign='center'
      ctx.fillText(b.label, bcx, b.type==='boss'?by+bh/2+4:b.y+b.h-5)
      // boss HP indicators
      if (b.type==='boss') {
        const sqS=7, gap=3, total=b.hp*(sqS+gap)-gap
        let sx=bcx-total/2
        for(let i=0;i<b.hp;i++) {
          ctx.fillStyle=b.hp===1?'#EF4444':'#1D9E75'
          ctx.fillRect(sx,by+bh/2-sqS/2,sqS,sqS); sx+=sqS+gap
        }
      }
    }
    bulletsR.current = alive

    // draw shield
    if (!shieldDnR.current) {
      const sc = shieldColor(shieldHPR.current)
      if (shFlashR.current>0) { shFlashR.current--; ctx.fillStyle='#ffffff' }
      else ctx.fillStyle=sc
      rrect(ctx,pxR.current-SHIELD_W/2,SHIELD_Y,SHIELD_W,SHIELD_H,4); ctx.fill()
      // fire cooldown bar
      const pct=1-fireCDR.current/0.4
      ctx.fillStyle='rgba(255,255,255,0.2)'
      ctx.fillRect(pxR.current-SHIELD_W/2,FIRE_Y,SHIELD_W,4)
      ctx.fillStyle=fireCDR.current<=0?'#FFD700':'#666'
      ctx.fillRect(pxR.current-SHIELD_W/2,FIRE_Y,SHIELD_W*pct,4)
    } else {
      // shield down icon
      ctx.font='11px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#EF4444'
      ctx.fillText(`SHIELD DOWN — ${shieldRegenS}s`, pxR.current, SHIELD_Y)
    }

    // portfolio base
    const portColor = hpColor(portHPR.current)
    ctx.fillStyle=portColor+'33'
    ctx.fillRect(0,PORT_Y,W,CANVAS_H-PORT_Y)
    ctx.fillStyle=portColor; ctx.fillRect(0,PORT_Y,W,2)
    ctx.font='bold 10px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillStyle=portColor
    ctx.fillText('YOUR PORTFOLIO', W/2, PORT_Y+14)

    // particles
    particlesR.current=particlesR.current.filter(p=>p.life>0)
    for (const p of particlesR.current) {
      p.x+=p.vx; p.y+=p.vy; p.life-=0.04
      ctx.globalAlpha=p.life; ctx.fillStyle=p.color
      ctx.fillRect(p.x-p.size/2, p.y-p.size/2, p.size*p.life, p.size*p.life)
      ctx.globalAlpha=1
    }

    // float texts
    ftextsR.current=ftextsR.current.filter(f=>f.life>0)
    for (const f of ftextsR.current) {
      f.y-=1.2; f.life-=0.02
      ctx.font='bold 12px system-ui,sans-serif'; ctx.textAlign='center'; ctx.globalAlpha=f.life
      ctx.fillStyle=f.color; ctx.fillText(f.text,f.x,f.y); ctx.globalAlpha=1
    }

    ctx.restore()
    rafR.current = requestAnimationFrame((ts2)=>loopFnR.current!(ts2))
  }

  // ── start/end functions ───────────────────────────────────────────────────
  function drawCountdown(n:number, ri:number) {
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d'); if(!ctx) return
    const W=canvas.width, cfg=ROUND_CFGS[ri]
    const g=ctx.createLinearGradient(0,0,0,CANVAS_H)
    g.addColorStop(0,'#061B14'); g.addColorStop(1,'#0A3728')
    ctx.fillStyle=g; ctx.fillRect(0,0,W,CANVAS_H)
    for(const s of starsR.current){ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fill()}
    ctx.textAlign='center'
    ctx.font='bold 26px system-ui,sans-serif'; ctx.fillStyle='#fff'
    ctx.fillText(`Round ${ri+1}`, W/2, CANVAS_H/2-55)
    ctx.font='14px system-ui,sans-serif'; ctx.fillStyle=cfg.n<=2?'#FBBF24':cfg.n<=4?'#F97316':'#EF4444'
    ctx.fillText(`${cfg.name} · ${cfg.fee}`, W/2, CANVAS_H/2-28)
    ctx.font='12px system-ui,sans-serif'; ctx.fillStyle='rgba(255,255,255,.6)'
    ctx.fillText('DEFEND YOUR PORTFOLIO!', W/2, CANVAS_H/2-4)
    ctx.font='bold 72px system-ui,sans-serif'; ctx.fillStyle='#FFD700'
    ctx.fillText(String(n), W/2, CANVAS_H/2+55)
  }

  function startRound(ri:number) {
    cancelAnimationFrame(rafR.current)
    if (cdTimerR.current) clearTimeout(cdTimerR.current)
    bulletsR.current=[]; pbulletsR.current=[]; powerUpsR.current=[]; particlesR.current=[]; ftextsR.current=[]
    lastSpawnR.current=0; lastPUR.current=0; lastTickR.current=0
    feeStormR.current=false; waveTimerR.current=0
    blockedR.current=0; shotR.current=0; throughR.current=0; puR.current=0; bossKillR.current=false; roundPtsR.current=0
    bossTextR.current=0
    shakeR.current=0; portFlashR.current=0; shFlashR.current=0; fireCDR.current=0
    sShieldHP(100); setShieldDown(false); shieldDnR.current=false; shieldRegR.current=0
    const cfg=ROUND_CFGS[ri]
    roundSecsR.current=cfg.dur; setRoundSecs(cfg.dur)
    roundR.current=ri; setRoundIdx(ri)
    bossTrigsR.current=[...cfg.bossAt]
    const W=cwR.current; pxR.current=W/2
    sPhase('countdown'); setCdNum(3)
    setTimeout(()=>{
      const canvas=canvasRef.current, cont=contRef.current
      if(canvas&&cont){const w=Math.min(cont.clientWidth,520);if(w>0){canvas.width=w;canvas.height=CANVAS_H;cwR.current=w;pxR.current=w/2;starsR.current=makeStars(w)}}
      drawCountdown(3,ri)
      let n=3
      const tick=()=>{
        n--
        if(n<=0){sPhase('playing');rafR.current=requestAnimationFrame((ts)=>loopFnR.current!(ts))}
        else{setCdNum(n);cdTimerR.current=setTimeout(()=>{drawCountdown(n,ri);tick()},1000)}
      }
      cdTimerR.current=setTimeout(tick,1000)
    },50)
  }

  function resetGame() {
    cancelAnimationFrame(rafR.current); if(cdTimerR.current) clearTimeout(cdTimerR.current)
    sPortHP(100); sScore(0); sMult(1); allStatsR.current=[]; setAllStats([]); setBetweenStats(null); setMultDecay(1)
    sPhase('howToPlay')
  }

  // ── canvas setup ──────────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current, cont=contRef.current; if(!canvas||!cont) return
    const w=Math.min(window.innerWidth-32,520)
    canvas.width=w; canvas.height=CANVAS_H; cwR.current=w; pxR.current=w/2; starsR.current=makeStars(w)
    const ro=new ResizeObserver(()=>{const nw=Math.min(cont.clientWidth,520);if(nw>0){canvas.width=nw;canvas.height=CANVAS_H;cwR.current=nw;pxR.current=nw/2;starsR.current=makeStars(nw)}})
    ro.observe(cont)
    const onMM=(e:MouseEvent)=>{const rect=canvas.getBoundingClientRect(),sx=canvas.width/rect.width;pxR.current=Math.max(SHIELD_W/2,Math.min(canvas.width-SHIELD_W/2,(e.clientX-rect.left)*sx))}
    const onTM=(e:TouchEvent)=>{e.preventDefault();const rect=canvas.getBoundingClientRect(),sx=canvas.width/rect.width;pxR.current=Math.max(SHIELD_W/2,Math.min(canvas.width-SHIELD_W/2,(e.touches[0].clientX-rect.left)*sx))}
    const onClick=(e:MouseEvent)=>{if(phaseR.current==='playing')doFire()}
    const onKD=(e:KeyboardEvent)=>{keysR.current[e.key]=true;if(e.key===' '&&phaseR.current==='playing'){e.preventDefault();doFire()}}
    const onKU=(e:KeyboardEvent)=>{keysR.current[e.key]=false}
    canvas.addEventListener('mousemove',onMM)
    canvas.addEventListener('touchmove',onTM,{passive:false})
    canvas.addEventListener('click',onClick)
    window.addEventListener('keydown',onKD)
    window.addEventListener('keyup',onKU)
    return ()=>{
      cancelAnimationFrame(rafR.current); if(cdTimerR.current) clearTimeout(cdTimerR.current)
      ro.disconnect(); canvas.removeEventListener('mousemove',onMM); canvas.removeEventListener('touchmove',onTM)
      canvas.removeEventListener('click',onClick); window.removeEventListener('keydown',onKD); window.removeEventListener('keyup',onKU)
    }
  },[]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── derived UI values ─────────────────────────────────────────────────────
  const portValue = Math.round(portHP * 100)
  const etfValue  = Math.round(10000 * Math.pow(1-0.0007, allStats.length || 1))
  const showCanvas = phase==='playing'||phase==='countdown'

  const chartData = allStats.map((s,i)=>({
    name:`R${i+1}`, 'Your Portfolio':Math.round(s.portfolioHP*100), 'Low-cost ETF': Math.round(10000*Math.pow(1-0.0007,i+1))
  }))

  function perfMsg() {
    const totalPts = allStats.reduce((s,r)=>s+r.pts,0)
    if (totalPts>1500&&portHP>75) return "Fee destroyer legend! You protected your portfolio like a pro and took down every boss. In real life, just pick a 0.07% ETF and you never have to play this game again."
    if (totalPts>1000&&portHP>50) return "Strong performance! You blocked most fees and kept your portfolio healthy. The boss bullets (TER) are the ones to watch in real investing."
    if (portHP>25) return "You survived but took heavy damage. The compound and hidden fees got through too often. In real life, always read the full fee schedule before investing."
    return "The fees destroyed your portfolio! This is exactly what happens to real investors who ignore expense ratios over 20 years. A 0.07% ETF would still be at 98.6%."
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  const headerChip = (
    <Stack direction="row" sx={{alignItems:'center',gap:1,mb:.5}}>
      <Chip icon={<IconShield size={13} strokeWidth={1.5}/>} label="Mini-Game" size="small"
        sx={{bgcolor:`${LEVEL_COLOR}18`,color:LEVEL_COLOR,fontWeight:700,fontSize:10,height:22}}/>
    </Stack>
  )

  // ── HOW TO PLAY ───────────────────────────────────────────────────────────
  if (phase==='howToPlay') return (
    <Box sx={{fontFamily:'var(--font-body)'}}>
      {headerChip}
      <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,lineHeight:1.2}}>Fee Destroyer</Typography>
      <Typography sx={{fontSize:12,color:'text.secondary',mb:2}}>Block the fees before they eat your portfolio!</Typography>
      <Box sx={{bgcolor:'var(--teal-50)',border:'1px solid var(--teal-100)',borderRadius:'14px',p:2.5,mb:2}}>
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:15,mb:1.5}}>How to Play</Typography>
        {['Fee bullets fall from the sky — 6 types with different behaviors','Move your shield left and right to block bullets','CLICK or SPACEBAR to fire a shot upward','Collect power-ups: ETF Bonus (+HP), Fee Waiver (clear screen), Repair (+Shield)','Your shield has its own health bar — it can go down!','5 rounds of increasing difficulty · Beat every boss TER bullet!'].map((s,i)=>(
          <Stack key={i} direction="row" sx={{gap:1.5,mb:1,alignItems:'flex-start'}}>
            <Box sx={{width:22,height:22,borderRadius:'50%',bgcolor:'var(--teal-400)',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</Box>
            <Typography sx={{fontSize:12.5,lineHeight:1.5,pt:.25}}>{s}</Typography>
          </Stack>
        ))}
        <Typography sx={{fontSize:12,color:'text.secondary',mt:1.5,mb:2,fontStyle:'italic'}}>Can you survive all 5 rounds and protect your portfolio from greedy fees?</Typography>
        <Button variant="contained" fullWidth endIcon={<IconArrowRight size={16} strokeWidth={1.5}/>}
          onClick={()=>startRound(0)}
          sx={{bgcolor:'#1D9E75',borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25}}>
          Start Game
        </Button>
      </Box>
      {/* canvas hidden but in DOM */}
      <Box ref={contRef} sx={{display:'none'}}><canvas ref={canvasRef}/></Box>
    </Box>
  )

  // ── PLAYING / COUNTDOWN ───────────────────────────────────────────────────
  if (showCanvas) return (
    <Box sx={{fontFamily:'var(--font-body)'}}>
      {headerChip}
      <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,lineHeight:1.2}}>Fee Destroyer</Typography>

      {/* Portfolio HP bar */}
      <Box sx={{mt:1.5,mb:1}}>
        <Stack direction="row" sx={{justifyContent:'space-between',alignItems:'center',mb:.4}}>
          <Stack direction="row" sx={{gap:.75,alignItems:'center'}}>
            <IconBuildingBank size={14} strokeWidth={1.5} color={hpColor(portHP)}/>
            <Typography sx={{fontSize:11,fontWeight:700,letterSpacing:'.5px',color:'text.secondary'}}>PORTFOLIO</Typography>
          </Stack>
          <Typography sx={{fontSize:12,fontWeight:700,color:hpColor(portHP)}}>{portHP}% · €{portValue.toLocaleString()}</Typography>
        </Stack>
        <Box sx={{height:14,bgcolor:'rgba(0,0,0,.12)',borderRadius:7,overflow:'hidden',border:'1px solid rgba(0,0,0,.08)'}}>
          <Box sx={{height:'100%',width:`${portHP}%`,bgcolor:hpColor(portHP),borderRadius:7,transition:'width .25s, background-color .3s',
            animation:portHP<=25?'pulse 1s infinite':'none','@keyframes pulse':{'0%,100%':{opacity:1},'50%':{opacity:.5}}}}/>
        </Box>
      </Box>

      {/* Shield HP bar */}
      <Box sx={{mb:1.5}}>
        <Stack direction="row" sx={{justifyContent:'space-between',alignItems:'center',mb:.4}}>
          <Stack direction="row" sx={{gap:.75,alignItems:'center'}}>
            <IconShield size={14} strokeWidth={1.5} color={shieldDown?'#EF4444':shieldColor(shieldHP)}/>
            <Typography sx={{fontSize:11,fontWeight:700,letterSpacing:'.5px',color:'text.secondary'}}>SHIELD</Typography>
          </Stack>
          <Typography sx={{fontSize:12,fontWeight:700,color:shieldDown?'#EF4444':shieldColor(shieldHP)}}>
            {shieldDown?`REGENERATING ${shieldRegenS}s…`:`${shieldHP}%`}
          </Typography>
        </Stack>
        <Box sx={{height:10,bgcolor:'rgba(0,0,0,.12)',borderRadius:5,overflow:'hidden',border:'1px solid rgba(0,0,0,.08)'}}>
          <Box sx={{height:'100%',width:`${shieldDown?0:shieldHP}%`,bgcolor:shieldDown?'#666':shieldColor(shieldHP),borderRadius:5,transition:'width .25s, background-color .3s'}}/>
        </Box>
      </Box>

      {/* Stats row */}
      <Stack direction="row" sx={{gap:1,mb:1.5}}>
        {[
          {label:'SCORE',    val:score.toLocaleString(),          c:LEVEL_COLOR},
          {label:'×MULT',    val:`×${mult.toFixed(1)}`,           c:mult>=2?'#C08B00':'text.secondary'},
          {label:`RND ${roundIdx+1}/5`, val:`${roundSecs}s`,       c:roundSecs<8?'#EF4444':LEVEL_COLOR},
        ].map(s=>(
          <Box key={s.label} sx={{flex:1,bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'10px',p:1,textAlign:'center'}}>
            <Typography sx={{fontSize:9.5,color:'text.secondary',fontWeight:700,letterSpacing:'.5px'}}>{s.label}</Typography>
            <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:13,color:s.c}}>{s.val}</Typography>
            {s.label.startsWith('×')&&(
              <Box sx={{mt:.5,height:3,bgcolor:'#f0f0f0',borderRadius:2}}>
                <Box sx={{height:'100%',width:`${Math.round(multDecay*100)}%`,bgcolor:'#C08B00',borderRadius:2,transition:'width .1s'}}/>
              </Box>
            )}
          </Box>
        ))}
      </Stack>

      <Box ref={contRef} sx={{width:'100%',maxWidth:520,mx:'auto'}}>
        <canvas ref={canvasRef} style={{display:'block',width:'100%',borderRadius:12,touchAction:'none',cursor:'none'}}/>
      </Box>

      {/* Mobile controls */}
      <Stack direction="row" sx={{gap:1,mt:1.5}}>
        {[
          {key:'ArrowLeft',  el:<IconArrowLeft   size={24} strokeWidth={2} color="white"/>,  bg:'#1D9E75'},
          {key:'fire',       el:<IconBolt        size={22} strokeWidth={2} color="#000"/>,   bg:'#FFD700'},
          {key:'ArrowRight', el:<IconChevronRight size={24} strokeWidth={2} color="white"/>, bg:'#1D9E75'},
        ].map(({key,el,bg})=>(
          <Button key={key} variant="contained" fullWidth
            onPointerDown={()=>{ if(key==='fire') doFire(); else keysR.current[key]=true }}
            onPointerUp={()=>{ if(key!=='fire') keysR.current[key]=false }}
            onPointerLeave={()=>{ if(key!=='fire') keysR.current[key]=false }}
            sx={{height:56,bgcolor:bg,borderRadius:'10px','&:hover':{bgcolor:bg},'&:active':{filter:'brightness(.85)'}}}>
            {el}
          </Button>
        ))}
      </Stack>
    </Box>
  )

  // ── BETWEEN ROUNDS ────────────────────────────────────────────────────────
  if (phase==='between'&&betweenStats) {
    const tip = ETF_TIPS[roundIdx] ?? ETF_TIPS[0]
    return (
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,mb:2}}>Fee Destroyer</Typography>
        <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2.5,mb:2}}>
          <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16,mb:2}}>Round {roundIdx+1} Complete</Typography>
          {[
            {label:'Bullets blocked by shield',  val:betweenStats.blocked, c:'#1D9E75'},
            {label:'Bullets shot down',          val:betweenStats.shot,    c:'#1D9E75'},
            {label:'Bullets that got through',   val:betweenStats.through, c:'#EF4444'},
            {label:'Power-ups collected',        val:betweenStats.powerUps,c:'#C08B00'},
            {label:'Boss bullet destroyed',      val:betweenStats.bossKilled?'Yes':'No',c:betweenStats.bossKilled?'#1D9E75':'text.secondary'},
          ].map(r=>(
            <Stack key={r.label} direction="row" sx={{justifyContent:'space-between',mb:.75}}>
              <Typography sx={{fontSize:13,color:'text.secondary'}}>{r.label}</Typography>
              <Typography sx={{fontSize:13,fontWeight:700,color:r.c}}>{r.val}</Typography>
            </Stack>
          ))}
          <Box sx={{height:'1px',bgcolor:'var(--border,#E0E0E0)',my:1}}/>
          <Stack direction="row" sx={{justifyContent:'space-between',mb:1.5}}>
            <Typography sx={{fontSize:13,fontWeight:700}}>Round score</Typography>
            <Typography sx={{fontSize:13,fontWeight:700,color:LEVEL_COLOR}}>{betweenStats.pts.toLocaleString()}</Typography>
          </Stack>

          {/* Portfolio HP bar */}
          <Typography sx={{fontSize:11,fontWeight:700,color:'text.secondary',mb:.5}}>PORTFOLIO HEALTH</Typography>
          <Stack direction="row" sx={{alignItems:'center',gap:1,mb:.5}}>
            <Box sx={{flex:1,height:12,bgcolor:'#f0f0f0',borderRadius:6,overflow:'hidden'}}>
              <Box sx={{height:'100%',width:`${portHP}%`,bgcolor:hpColor(portHP),borderRadius:6,transition:'width .3s'}}/>
            </Box>
            <Typography sx={{fontSize:12,fontWeight:700,color:hpColor(portHP),minWidth:36}}>{portHP}%</Typography>
          </Stack>
          <Stack direction="row" sx={{justifyContent:'space-between',mb:2}}>
            <Typography sx={{fontSize:12,color:'text.secondary'}}>Low-cost ETF: still at {ETF_HP}%</Typography>
            <Typography sx={{fontSize:12,color:'#1D9E75',fontWeight:600}}>€{Math.round(ETF_HP*100).toLocaleString()}</Typography>
          </Stack>
        </Box>

        {/* Educational tip */}
        <Box sx={{bgcolor:'#F3F0FF',border:'1px solid #E2DAFF',borderRadius:'10px',p:1.5,mb:2}}>
          <Typography sx={{fontSize:11,fontWeight:700,color:'#7B5FD4',letterSpacing:'.6px',mb:.5}}>DID YOU KNOW?</Typography>
          <Typography sx={{fontSize:12.5,lineHeight:1.6,color:'text.secondary'}}>{tip}</Typography>
        </Box>

        <Button variant="contained" fullWidth endIcon={<IconArrowRight size={16} strokeWidth={1.5}/>}
          onClick={()=>startRound(roundIdx+1)}
          sx={{bgcolor:LEVEL_COLOR,borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#b84d74'}}}>
          Round {roundIdx+2} →
        </Button>
        <Box ref={contRef} sx={{display:'none'}}><canvas ref={canvasRef}/></Box>
      </Box>
    )
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (phase==='results') {
    const totalPts=allStats.reduce((s,r)=>s+r.pts,0)
    const totalBlocked=allStats.reduce((s,r)=>s+r.blocked,0)
    const totalShot=allStats.reduce((s,r)=>s+r.shot,0)
    const totalThrough=allStats.reduce((s,r)=>s+r.through,0)
    const totalPU=allStats.reduce((s,r)=>s+r.powerUps,0)
    const bossCount=allStats.filter(r=>r.bossKilled).length
    const diff=Math.max(0,etfValue-portValue)
    return (
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,mb:2}}>Fee Destroyer</Typography>

        <Box sx={{display:'flex',justifyContent:'center',mb:1}}>
          <LottieAnimation animationData={portHP>50?TrophyWinner:ThinkingAnim} width={160} height={160} loop={false}/>
        </Box>

        {/* Summary card */}
        <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2.5,mb:2}}>
          <Stack direction="row" sx={{alignItems:'center',gap:1,mb:2}}>
            <IconShield size={20} strokeWidth={1.5} color={LEVEL_COLOR}/>
            <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16}}>Final Score: {totalPts.toLocaleString()}</Typography>
          </Stack>

          {/* Portfolio HP */}
          <Typography sx={{fontSize:11,fontWeight:700,letterSpacing:'.5px',color:'text.secondary',mb:.4}}>PORTFOLIO SURVIVED</Typography>
          <Stack direction="row" sx={{alignItems:'center',gap:1,mb:1.5}}>
            <Box sx={{flex:1,height:14,bgcolor:'#f0f0f0',borderRadius:7,overflow:'hidden'}}>
              <Box sx={{height:'100%',width:`${portHP}%`,bgcolor:hpColor(portHP),borderRadius:7,transition:'width .3s'}}/>
            </Box>
            <Typography sx={{fontSize:13,fontWeight:800,color:hpColor(portHP),minWidth:40}}>{portHP}%</Typography>
          </Stack>

          {[
            {label:'Bullets blocked',    val:totalBlocked,                 c:'#1D9E75'},
            {label:'Bullets shot down',  val:totalShot,                    c:'#1D9E75'},
            {label:'Fees got through',   val:totalThrough,                 c:'#EF4444'},
            {label:'Power-ups collected',val:totalPU,                      c:'#C08B00'},
            {label:'Boss bullets killed',val:`${bossCount}`,               c:bossCount>0?'#1D9E75':'text.secondary'},
          ].map(r=>(
            <Stack key={r.label} direction="row" sx={{justifyContent:'space-between',mb:.75}}>
              <Typography sx={{fontSize:13,color:'text.secondary'}}>{r.label}</Typography>
              <Typography sx={{fontSize:13,fontWeight:700,color:r.c}}>{r.val}</Typography>
            </Stack>
          ))}
          <Box sx={{height:'1px',bgcolor:'var(--border,#E0E0E0)',my:1}}/>
          {[
            {label:'Your fund value',    val:`€${portValue.toLocaleString()}`,   c:'text.primary'},
            {label:'Low-cost ETF value', val:`€${etfValue.toLocaleString()}`,     c:'#1D9E75'},
            {label:'Lost to fees',       val:`-€${diff.toLocaleString()}`,        c:'#DC2626'},
          ].map(r=>(
            <Stack key={r.label} direction="row" sx={{justifyContent:'space-between',mb:.75}}>
              <Typography sx={{fontSize:13,color:'text.secondary'}}>{r.label}</Typography>
              <Typography sx={{fontSize:13,fontWeight:700,color:r.c}}>{r.val}</Typography>
            </Stack>
          ))}
        </Box>

        {/* Chart */}
        {chartData.length>0&&(
          <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2,mb:2}}>
            <Typography sx={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,mb:1.5}}>Portfolio vs ETF Per Round</Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{top:0,right:0,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:10}} domain={[0,10200]} tickFormatter={(v:number)=>`€${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={(v:unknown)=>`€${Number(v).toLocaleString()}`}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="Your Portfolio" fill="#EF4444" radius={[3,3,0,0] as [number,number,number,number]}/>
                <Bar dataKey="Low-cost ETF"   fill="#1D9E75" radius={[3,3,0,0] as [number,number,number,number]}/>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Performance message */}
        <Box sx={{bgcolor:'var(--teal-50)',border:'1px solid var(--teal-100)',borderRadius:'10px',p:1.5,mb:2}}>
          <Typography sx={{fontSize:12.5,lineHeight:1.6,color:'var(--teal-600)'}}>{perfMsg()}</Typography>
        </Box>

        {/* Insight */}
        <Box sx={{bgcolor:'#fff8f0',border:'1px solid #fed7aa',borderRadius:'10px',p:1.5,mb:2.5}}>
          <Typography sx={{fontSize:11,fontWeight:700,color:'#C2460A',letterSpacing:'.6px',mb:.5}}>REAL WORLD IMPACT</Typography>
          <Typography sx={{fontSize:12.5,lineHeight:1.6,color:'text.secondary'}}>
            In this game, fees felt dramatic and sudden. In real life, they&apos;re invisible — taken automatically each year from your returns.
            A 2% annual fee over 20 years on €10,000 costs you €4,875 more than a 0.07% ETF. That&apos;s a holiday. That&apos;s a car. That&apos;s your money.
          </Typography>
        </Box>

        <Stack sx={{gap:1}}>
          {!isCompleted?(
            <Button variant="contained" fullWidth onClick={onComplete}
              sx={{bgcolor:'#1D9E75',borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25}}>
              Never paying high fees again! +20 XP
            </Button>
          ):(
            <Typography sx={{textAlign:'center',fontSize:13,color:'#1D9E75',fontWeight:600,py:.5}}>+20 XP already earned</Typography>
          )}
          <Button variant="outlined" fullWidth onClick={resetGame}
            sx={{borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25}}>
            Play Again
          </Button>
        </Stack>
        <Box ref={contRef} sx={{display:'none'}}><canvas ref={canvasRef}/></Box>
      </Box>
    )
  }

  return null
}
