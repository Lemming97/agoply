import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconBrain, IconShoppingCart, IconBolt, IconPlaneDeparture,
  IconRocket, IconChartLine, IconChartBar, IconTrophy,
  IconWallet, IconPlayerPause, IconTrendingUp, IconTrendingDown,
  IconCircleCheck, IconCircleX, IconRobot, IconChevronRight,
  IconBuildingStore, IconChevronUp, IconArrowRight,
} from '@tabler/icons-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import LottieAnimation from '../LottieAnimation'
import TrophyWinner from '../../assets/animations/Trophy_Winner.json'
import Champion from '../../assets/animations/Champion.json'
import Thinking from '../../assets/animations/Thinking.json'

interface Props { isCompleted: boolean; onComplete: () => void }

// ─── Types ───────────────────────────────────────────────────────────────────
type Diff = 'EASY' | 'MEDIUM' | 'HARD'
type Phase =
  | 'difficulty' | 'howtoplay'
  | 'ipo' | 'iporesult' | 'phase1done'
  | 'earnings' | 'earningsresult' | 'phase2done'
  | 'live' | 'final'
type EarnStep = 'predict' | 'trade'

interface Holding { shares: number; avgBuyPrice: number; currentPrice: number }
type Holdings = Record<string, Holding>

interface IpoResult {
  company: string; invested: number; shares: number
  ipoPrice: number; closePrice: number; pnl: number; skipped: boolean
}
interface EarningResult {
  company: string; prediction: string; actual: string; correct: boolean
  trade: string; tradePnl: number; pts: number
}

// ─── Data ────────────────────────────────────────────────────────────────────
const DIFF_CFG = {
  EASY:   { ipoSecs: 15, earnSecs: 12, liveSecs: 120 },
  MEDIUM: { ipoSecs: 10, earnSecs: 10, liveSecs: 100 },
  HARD:   { ipoSecs:  7, earnSecs:  7, liveSecs:  90 },
}

const IPO_COS = [
  {
    id: 'MSTR', name: 'Mistral AI', ticker: 'MSTR.PA',
    sector: 'Artificial Intelligence', country: 'France',
    color: '#7B5FD4', Icon: IconBrain,
    ipoPrice: 42.00,
    description: 'French AI startup challenging OpenAI and Google with open-source language models.',
    revenue: '€85M', growth: '+340% YoY', employees: '280', founded: '2023',
    analystRating: 'BUY', analystTarget: '€58', risk: 'HIGH',
    pros: ['Fastest growing AI company in Europe', 'Strong government backing', 'Open-source competitive advantage'],
    cons: ['Not yet profitable', 'Competing with US giants', 'Unproven at scale'],
    ipoResult: 28,
    explanation: 'Strong investor demand for European AI. The open-source angle resonated with institutional investors.',
    hint: 'Analyst target of €58 suggests 38% upside from IPO price of €42. High risk, high potential reward.',
  },
  {
    id: 'SHEIN', name: 'Shein Europe', ticker: 'SHEIN',
    sector: 'Fast Fashion / E-commerce', country: 'Singapore/Global',
    color: '#EC4899', Icon: IconShoppingCart,
    ipoPrice: 28.50,
    description: 'Ultra-fast fashion giant attempting European listing amid regulatory scrutiny.',
    revenue: '€32B', growth: '+18% YoY', employees: '10,000+', founded: '2008',
    analystRating: 'HOLD', analystTarget: '€31', risk: 'MEDIUM-HIGH',
    pros: ['Massive revenue base', 'Dominant Gen Z market share', 'Efficient supply chain'],
    cons: ['EU regulatory risk', 'ESG concerns', 'Slowing growth vs peak'],
    ipoResult: -8,
    explanation: 'EU regulators announced an investigation into working conditions the day before listing. Cautious debut.',
    hint: 'Analyst target of €31 is only 9% above IPO price. Limited upside with significant regulatory headwinds.',
  },
]

const EARN_COS = [
  {
    id: 'MC', name: 'LVMH', ticker: 'MC.PA', sector: 'Luxury Goods', country: 'France',
    color: '#C08B00', Icon: IconBuildingStore,
    currentPrice: 694.50,
    analystExpectation: '€8.2B quarterly revenue',
    actualResult: 'BEAT' as const, actualRevenue: '€8.9B (+8.5% vs estimate)', priceChange: 7.2,
    explanation: "Chinese luxury demand rebounded strongly. LVMH's diversified brand portfolio — Louis Vuitton, Dior, Moët — all outperformed.",
  },
  {
    id: 'TSLA', name: 'Tesla', ticker: 'TSLA', sector: 'Electric Vehicles', country: 'USA',
    color: '#E24B4A', Icon: IconBolt,
    currentPrice: 248.50,
    analystExpectation: '460,000 quarterly deliveries',
    actualResult: 'MISS' as const, actualRevenue: '412,000 deliveries (-10.4% vs estimate)', priceChange: -9.8,
    explanation: 'Price cuts to maintain market share hurt margins. Competition from Chinese EVs like BYD intensified. Investors punished the miss hard.',
  },
  {
    id: 'AIR', name: 'Airbus', ticker: 'AIR.PA', sector: 'Aerospace & Defence', country: 'France/Germany',
    color: '#3B8FD4', Icon: IconPlaneDeparture,
    currentPrice: 168.20,
    analystExpectation: '720 aircraft deliveries',
    actualResult: 'MEET' as const, actualRevenue: '718 deliveries (in line with estimate)', priceChange: 1.4,
    explanation: 'In line with expectations — no surprise either way. Supply chain issues limited upside but strong order book maintained confidence.',
  },
]

interface NewsEvent {
  id: string; headline: string; affectedTicker: string; affectedName: string
  direction: 'UP' | 'DOWN'; priceImpact: number; timeDelay: number
}

const EU_TICKERS = new Set(['MC','AIR','TTE','BNP','MSTR','SHEIN'])
const TICKER_MAP: Record<string,string> = {
  'MC.PA':'MC','AIR.PA':'AIR','TTE.PA':'TTE','BNP.PA':'BNP','MSTR.PA':'MSTR',
}
function resolveT(t:string){ return TICKER_MAP[t]??t }

const NEWS_EVENTS: NewsEvent[] = [
  { id:'n1',  headline:'Apple reports record iPhone sales in Europe — up 23%',             affectedTicker:'AAPL',   affectedName:'Apple',              direction:'UP',   priceImpact:4.2,   timeDelay:4  },
  { id:'n2',  headline:'EU fines Meta €1.3B for data privacy violations',                  affectedTicker:'META',   affectedName:'Meta',               direction:'DOWN', priceImpact:-3.8,  timeDelay:9  },
  { id:'n3',  headline:'NVIDIA announces next-gen AI chip — 3× faster than current',      affectedTicker:'NVDA',   affectedName:'NVIDIA',             direction:'UP',   priceImpact:8.5,   timeDelay:14 },
  { id:'n4',  headline:'Airbus wins €12B contract with Air France for 150 aircraft',      affectedTicker:'AIR.PA', affectedName:'Airbus',             direction:'UP',   priceImpact:5.1,   timeDelay:19 },
  { id:'n5',  headline:'China announces luxury goods import tariffs — LVMH hit hard',     affectedTicker:'MC.PA',  affectedName:'LVMH',               direction:'DOWN', priceImpact:-6.3,  timeDelay:24 },
  { id:'n6',  headline:'Tesla recalls 200,000 vehicles due to software defect',            affectedTicker:'TSLA',   affectedName:'Tesla',              direction:'DOWN', priceImpact:-4.9,  timeDelay:29 },
  { id:'n7',  headline:'ECB signals rate cuts — European stocks surge broadly',            affectedTicker:'ALL_EU', affectedName:'All European stocks', direction:'UP',  priceImpact:2.1,   timeDelay:34 },
  { id:'n8',  headline:'Microsoft acquires French AI startup for €2.4B',                  affectedTicker:'MSFT',   affectedName:'Microsoft',          direction:'UP',   priceImpact:3.2,   timeDelay:39 },
  { id:'n9',  headline:'Oil prices crash 8% on surprise OPEC production increase',        affectedTicker:'TTE.PA', affectedName:'TotalEnergies',       direction:'DOWN', priceImpact:-5.7,  timeDelay:44 },
  { id:'n10', headline:'Mistral AI signs €800M deal with European Commission',             affectedTicker:'MSTR.PA',affectedName:'Mistral AI',         direction:'UP',   priceImpact:12.4,  timeDelay:49 },
  { id:'n11', headline:'US inflation data beats expectations — markets sell off',          affectedTicker:'ALL',    affectedName:'All stocks',          direction:'DOWN', priceImpact:-2.8,  timeDelay:54 },
  { id:'n12', headline:'Samsung announces foldable phone — Apple loses market share fear', affectedTicker:'AAPL',   affectedName:'Apple',              direction:'DOWN', priceImpact:-3.1,  timeDelay:59 },
  { id:'n13', headline:'LVMH CEO confirms record Asia sales — China ban fears overblown',  affectedTicker:'MC.PA',  affectedName:'LVMH',               direction:'UP',   priceImpact:4.8,   timeDelay:64 },
  { id:'n14', headline:'Tesla unveils €18,000 Model Q — most affordable EV ever',         affectedTicker:'TSLA',   affectedName:'Tesla',              direction:'UP',   priceImpact:7.3,   timeDelay:69 },
  { id:'n15', headline:'Airbus production halted at Toulouse plant — strike begins',       affectedTicker:'AIR.PA', affectedName:'Airbus',             direction:'DOWN', priceImpact:-4.2,  timeDelay:74 },
  { id:'n16', headline:'BREAKING: Major European bank reports €3B trading loss',           affectedTicker:'BNP.PA', affectedName:'BNP Paribas',        direction:'DOWN', priceImpact:-9.1,  timeDelay:79 },
  { id:'n17', headline:'NVIDIA wins €5B EU defence AI contract — stock rockets',           affectedTicker:'NVDA',   affectedName:'NVIDIA',             direction:'UP',   priceImpact:6.8,   timeDelay:84 },
  { id:'n18', headline:'Markets close up — best week for European stocks in 2 years',     affectedTicker:'ALL_EU', affectedName:'All European stocks', direction:'UP',  priceImpact:1.8,   timeDelay:88 },
]

const PHASE3_BASE: Record<string,{name:string;basePrice:number}> = {
  AAPL: { name:'Apple',        basePrice:180 },
  META: { name:'Meta',         basePrice:460 },
  NVDA: { name:'NVIDIA',       basePrice:850 },
  MSFT: { name:'Microsoft',    basePrice:415 },
  TTE:  { name:'TotalEnergies',basePrice:62  },
  BNP:  { name:'BNP Paribas',  basePrice:74  },
}

function getStockName(t:string){
  const ipo=IPO_COS.find(c=>c.id===t); if(ipo) return ipo.name
  const earn=EARN_COS.find(c=>c.id===t); if(earn) return earn.name
  return PHASE3_BASE[t]?.name||t
}

const LEVEL_COLOR = '#2E86AB'
const START_CASH  = 1000
const BENCHMARK   = 5.0

// ─── Component ────────────────────────────────────────────────────────────────
export default function StocksPortfolioBuilder({ isCompleted, onComplete }: Props) {
  const [phase,       setPhase]      = useState<Phase>('difficulty')
  const [diff,        setDiff]       = useState<Diff>('MEDIUM')
  const [cash,        setCash]       = useState(START_CASH)
  const [holdings,    setHoldings]   = useState<Holdings>({})
  const [stockPrices, setSP]         = useState<Record<string,number>>({})
  const [ipoRound,    setIpoRound]   = useState(0)
  const [ipoAmount,   setIpoAmount]  = useState(200)
  const [pendingIpo,  setPendingIpo] = useState<{invested:number;shares:number;closePrice:number;pnl:number}|null>(null)
  const [ipoResults,  setIpoResults] = useState<IpoResult[]>([])
  const [earnRound,   setEarnRound]  = useState(0)
  const [earnStep,    setEarnStep]   = useState<EarnStep>('predict')
  const [beatPred,    setBeatPred]   = useState<'BEAT'|'MISS'|'MEET'|null>(null)
  const [tradePred,   setTradePred]  = useState<'BUY'|'HOLD'|'SHORT'|null>(null)
  const [earnResults, setEarnResults]= useState<EarningResult[]>([])
  const [score,       setScore]      = useState(0)
  const [correctPreds,setCorrectPreds]=useState(0)
  const [portHistory, setPortHistory]= useState([{label:'Start',value:START_CASH,bench:START_CASH}])
  const [predTimer,   setPredTimer]  = useState(10)
  const [liveTimer,   setLiveTimer]  = useState(60)
  const [shownNews,   setShownNews]  = useState<string[]>([])
  const [activeNews,  setActiveNews] = useState<NewsEvent|null>(null)
  const [flashTicker, setFlashTicker]= useState<{t:string;d:'up'|'down'}|null>(null)

  const timerRef    = useRef<ReturnType<typeof setInterval>|null>(null)
  const newsRef     = useRef<ReturnType<typeof setTimeout>|null>(null)
  const advRef      = useRef(false)
  const liveElapsed = useRef(0)
  const cashRef     = useRef(cash)
  const holdRef     = useRef(holdings)
  const spRef       = useRef(stockPrices)

  useEffect(() => { cashRef.current = cash },       [cash])
  useEffect(() => { holdRef.current = holdings },   [holdings])
  useEffect(() => { spRef.current   = stockPrices },[stockPrices])

  const cfg = DIFF_CFG[diff]

  function clearTimers() {
    if (timerRef.current) { clearInterval(timerRef.current);  timerRef.current = null }
    if (newsRef.current)  { clearTimeout(newsRef.current);    newsRef.current  = null }
  }

  function portValue(h=holdings, sp=stockPrices, c=cash) {
    return c + Object.entries(h).reduce((s,[t,hd])=>s+hd.shares*(sp[t]??hd.currentPrice),0)
  }
  const pv  = portValue()
  const pct = ((pv - START_CASH) / START_CASH) * 100

  // ── Phase 1 timer ──────────────────────────────────────────────────────────
  useEffect(()=>{
    if (phase !== 'ipo') return
    advRef.current = false
    setPredTimer(cfg.ipoSecs)
    setIpoAmount(Math.min(200, cash))
    timerRef.current = setInterval(()=>{
      setPredTimer(t=>{
        if (t<=1){ clearTimers(); if(!advRef.current){advRef.current=true; doIpoDecide(0)} return 0 }
        return t-1
      })
    },1000)
    return clearTimers
  },[phase,ipoRound]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase 2 predict timer ──────────────────────────────────────────────────
  useEffect(()=>{
    if (phase!=='earnings'||earnStep!=='predict') return
    advRef.current = false
    setPredTimer(cfg.earnSecs)
    timerRef.current = setInterval(()=>{
      setPredTimer(t=>{
        if (t<=1){ clearTimers(); if(!advRef.current){advRef.current=true; handleBeatPred('MEET')} return 0 }
        return t-1
      })
    },1000)
    return clearTimers
  },[phase,earnRound,earnStep]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase 3 live timer ─────────────────────────────────────────────────────
  useEffect(()=>{
    if (phase!=='live') return
    liveElapsed.current = 0
    timerRef.current = setInterval(()=>{
      liveElapsed.current++
      const elapsed = liveElapsed.current

      // fire news
      setShownNews(prev=>{
        const pending = NEWS_EVENTS.filter(e=>!prev.includes(e.id)&&elapsed>=e.timeDelay)
        if (!pending.length) return prev
        const ev = pending[0]
        const rt = resolveT(ev.affectedTicker)
        const mult = 1 + ev.priceImpact/100
        setSP(sp=>{
          const ns = {...sp}
          if (ev.affectedTicker==='ALL') {
            Object.keys(ns).forEach(t=>{ ns[t]=ns[t]*mult })
          } else if (ev.affectedTicker==='ALL_EU') {
            Object.keys(ns).forEach(t=>{ if(EU_TICKERS.has(t)) ns[t]=ns[t]*mult })
          } else {
            if (ns[rt]!==undefined) ns[rt]=ns[rt]*mult
            else {
              const base=PHASE3_BASE[rt]
              if(base) ns[rt]=base.basePrice*mult
            }
          }
          spRef.current=ns
          return ns
        })
        setHoldings(h=>{
          if (ev.affectedTicker==='ALL') {
            const nh:Holdings={}
            Object.entries(h).forEach(([t,hd])=>{ nh[t]={...hd,currentPrice:hd.currentPrice*mult} })
            holdRef.current=nh; return nh
          }
          if (ev.affectedTicker==='ALL_EU') {
            const nh={...h}
            Object.entries(h).forEach(([t,hd])=>{ if(EU_TICKERS.has(t)) nh[t]={...hd,currentPrice:hd.currentPrice*mult} })
            holdRef.current=nh; return nh
          }
          if (!h[rt]) return h
          const nh={...h,[rt]:{...h[rt],currentPrice:h[rt].currentPrice*mult}}
          holdRef.current=nh; return nh
        })
        setActiveNews(ev)
        const ft=ev.affectedTicker==='ALL'||ev.affectedTicker==='ALL_EU'?ev.affectedTicker:rt
        setFlashTicker({t:ft,d:ev.direction==='UP'?'up':'down'})
        if(newsRef.current) clearTimeout(newsRef.current)
        newsRef.current=setTimeout(()=>{setActiveNews(null);setFlashTicker(null)},6000)
        return [...prev, ev.id]
      })

      setLiveTimer(t=>{
        if (t<=1){
          clearTimers()
          const val = portValue(holdRef.current, spRef.current, cashRef.current)
          setPortHistory(prev=>[...prev,{label:'Final',value:Math.round(val),bench:Math.round(START_CASH*1.05)}])
          setPhase('final')
          return 0
        }
        return t-1
      })
    },1000)
    return clearTimers
  },[phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────
  function doIpoDecide(amount:number){
    clearTimers(); advRef.current=true
    const co = IPO_COS[ipoRound]
    const shares  = amount>0 ? Math.floor(amount/co.ipoPrice) : 0
    const invested= shares*co.ipoPrice
    const closeP  = parseFloat((co.ipoPrice*(1+co.ipoResult/100)).toFixed(2))
    const pnl     = parseFloat((shares*(closeP-co.ipoPrice)).toFixed(2))
    const newCash = cash - invested
    const newH    = shares>0
      ? {...holdings,[co.id]:{shares,avgBuyPrice:co.ipoPrice,currentPrice:closeP}}
      : {...holdings}
    setCash(newCash)
    setHoldings(newH)
    setIpoResults(p=>[...p,{company:co.name,invested,shares,ipoPrice:co.ipoPrice,closePrice:closeP,pnl,skipped:shares===0}])
    setPendingIpo({invested,shares,closePrice:closeP,pnl})
    setPhase('iporesult')
  }

  function ipoNext(){
    setPendingIpo(null)
    if (ipoRound+1<IPO_COS.length){
      setIpoRound(ipoRound+1); setPhase('ipo')
    } else {
      const val = portValue()
      const bench = Math.round(START_CASH*(1+BENCHMARK/100/3*1))
      setPortHistory(p=>[...p,{label:'After IPOs',value:Math.round(val),bench}])
      setPhase('phase1done')
    }
  }

  function handleBeatPred(pred:'BEAT'|'MISS'|'MEET'){
    clearTimers(); advRef.current=true
    setBeatPred(pred); setEarnStep('trade')
  }

  function handleEarningsTrade(trade:'BUY'|'HOLD'|'SHORT'){
    clearTimers()
    const co = EARN_COS[earnRound]
    const newP = parseFloat((co.currentPrice*(1+co.priceChange/100)).toFixed(2))
    let nc=cash, nh={...holdings}, pnl=0

    if (trade==='BUY'&&nc>=50){
      const toBuy=Math.min(100,nc)
      const shares=parseFloat((toBuy/co.currentPrice).toFixed(4))
      nc-=shares*co.currentPrice
      if(nh[co.id]){
        const tot=nh[co.id].shares+shares
        const avg=(nh[co.id].shares*nh[co.id].avgBuyPrice+shares*co.currentPrice)/tot
        nh[co.id]={shares:tot,avgBuyPrice:avg,currentPrice:newP}
      } else {
        nh[co.id]={shares,avgBuyPrice:co.currentPrice,currentPrice:newP}
      }
      pnl=parseFloat((shares*(newP-co.currentPrice)).toFixed(2))
    } else if (trade==='SHORT'){
      const bet=Math.min(100,nc)
      const gain=parseFloat((bet*Math.abs(co.priceChange)/100).toFixed(2))
      pnl = co.priceChange<0 ? gain : -gain
      nc+=pnl
    } else {
      // HOLD — update existing position price
      if(nh[co.id]){
        pnl=parseFloat((nh[co.id].shares*(newP-nh[co.id].currentPrice)).toFixed(2))
        nh[co.id]={...nh[co.id],currentPrice:newP}
      }
    }
    // also update price for non-traded holdings
    if(trade!=='HOLD'&&nh[co.id]) nh[co.id]={...nh[co.id],currentPrice:newP}

    const correct = beatPred===co.actualResult
    const goodTrade=(co.actualResult==='BEAT'&&trade==='BUY')||(co.actualResult==='MISS'&&trade==='SHORT')||(co.actualResult==='MEET'&&trade==='HOLD')
    let pts=0
    if(correct) pts+=20
    if(correct&&goodTrade) pts+=15

    setCash(nc); setHoldings(nh)
    setEarnResults(p=>[...p,{company:co.name,prediction:beatPred??'MEET',actual:co.actualResult,correct,trade,tradePnl:pnl,pts}])
    setTradePred(trade); setScore(s=>s+pts); setCorrectPreds(p=>correct?p+1:p)
    setPhase('earningsresult')
  }

  function earningsNext(){
    setBeatPred(null); setTradePred(null); setEarnStep('predict')
    if(earnRound+1<EARN_COS.length){
      setEarnRound(earnRound+1); setPhase('earnings')
    } else {
      const val=portValue()
      const bench=Math.round(START_CASH*(1+BENCHMARK/100/3*2))
      setPortHistory(p=>[...p,{label:'After Earnings',value:Math.round(val),bench}])
      setPhase('phase2done')
    }
  }

  function startLive(){
    const sp:Record<string,number>={}
    IPO_COS.forEach(co=>{ sp[co.id]=parseFloat((co.ipoPrice*(1+co.ipoResult/100)).toFixed(2)) })
    EARN_COS.forEach(co=>{ sp[co.id]=parseFloat((co.currentPrice*(1+co.priceChange/100)).toFixed(2)) })
    Object.entries(PHASE3_BASE).forEach(([t,{basePrice}])=>{ if(!sp[t]) sp[t]=basePrice })
    const newH:Holdings={}
    Object.entries(holdings).forEach(([t,h])=>{ newH[t]={...h,currentPrice:sp[t]??h.currentPrice} })
    setSP(sp); spRef.current=sp
    setHoldings(newH); holdRef.current=newH
    setLiveTimer(cfg.liveSecs); setShownNews([]); setActiveNews(null)
    liveElapsed.current=0; setPhase('live')
  }

  function buyStock(ticker:string){
    const price=spRef.current[ticker]||PHASE3_BASE[ticker]?.basePrice
    if(!price||cashRef.current<50) return
    const spend=Math.min(100,cashRef.current)
    const shares=parseFloat((spend/price).toFixed(4))
    const cost=parseFloat((shares*price).toFixed(2))
    setCash(c=>{ const nc=parseFloat((c-cost).toFixed(2)); cashRef.current=nc; return nc })
    setHoldings(h=>{
      const ex=h[ticker]
      let nh:Holding
      if(ex){ const tot=ex.shares+shares; nh={shares:tot,avgBuyPrice:(ex.shares*ex.avgBuyPrice+shares*price)/tot,currentPrice:price} }
      else   { nh={shares,avgBuyPrice:price,currentPrice:price} }
      const updated={...h,[ticker]:nh}; holdRef.current=updated; return updated
    })
  }

  function sellStock(ticker:string){
    const h=holdRef.current[ticker]; if(!h) return
    const price=spRef.current[ticker]??h.currentPrice
    const proceeds=parseFloat((h.shares*price).toFixed(2))
    setCash(c=>{ const nc=parseFloat((c+proceeds).toFixed(2)); cashRef.current=nc; return nc })
    setHoldings(h2=>{ const nh={...h2}; delete nh[ticker]; holdRef.current=nh; return nh })
  }

  function resetGame(){
    clearTimers()
    setCash(START_CASH); setHoldings({}); setSP({})
    setIpoRound(0); setIpoAmount(200); setPendingIpo(null); setIpoResults([])
    setEarnRound(0); setEarnStep('predict'); setBeatPred(null); setTradePred(null); setEarnResults([])
    setScore(0); setCorrectPreds(0)
    setPortHistory([{label:'Start',value:START_CASH,bench:START_CASH}])
    setLiveTimer(60); setShownNews([]); setActiveNews(null); setFlashTicker(null)
    setPhase('difficulty')
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const co      = IPO_COS[ipoRound]
  const earnCo  = EARN_COS[earnRound]
  const liveMax = cfg.liveSecs
  const timerPct= predTimer / (phase==='ipo' ? cfg.ipoSecs : cfg.earnSecs)
  const liveRatio=liveTimer/liveMax
  const tcol    = timerPct>0.5?LEVEL_COLOR:timerPct>0.25?'#FF8C00':'#EF4444'
  const lcol    = liveRatio>0.4?LEVEL_COLOR:liveRatio>0.2?'#FF8C00':'#EF4444'
  const finalVal= portHistory[portHistory.length-1]?.value ?? Math.round(pv)
  const finalPct= ((finalVal-START_CASH)/START_CASH)*100

  // ── Sub-components ─────────────────────────────────────────────────────────
  const headerChip = (lvl:string,color:string,Icon:React.ComponentType<{size:number;strokeWidth:number;color:string}>) => (
    <Stack direction="row" sx={{alignItems:'center',gap:1,mb:.5}}>
      <Chip icon={<Icon size={13} strokeWidth={1.5} color={color}/>} label={lvl} size="small"
        sx={{bgcolor:`${color}18`,color,fontWeight:700,fontSize:10,height:22}}/>
    </Stack>
  )

  function PortBar(){
    const color=pv>=START_CASH?LEVEL_COLOR:'#EF4444'
    const diff=pv-START_CASH
    return(
      <Box sx={{mb:1.5}}>
        <Stack direction="row" sx={{justifyContent:'space-between',mb:.3}}>
          <Stack direction="row" sx={{gap:.75,alignItems:'center'}}>
            <IconWallet size={14} strokeWidth={1.5} color={color}/>
            <Typography sx={{fontSize:11,fontWeight:700,letterSpacing:'.5px',color:'text.secondary'}}>PORTFOLIO</Typography>
          </Stack>
          <Typography sx={{fontSize:12,fontWeight:700,color}}>
            €{Math.round(pv).toLocaleString()}
            {diff!==0&&<span style={{fontSize:11,marginLeft:4}}>({diff>=0?'+':''}{pct.toFixed(1)}%)</span>}
          </Typography>
        </Stack>
        <Box sx={{height:8,bgcolor:'rgba(0,0,0,.08)',borderRadius:4,overflow:'hidden'}}>
          <Box sx={{height:'100%',width:`${Math.min(100,(pv/1500)*100)}%`,bgcolor:color,borderRadius:4,transition:'width .3s'}}/>
        </Box>
        <Stack direction="row" sx={{justifyContent:'space-between',mt:.3}}>
          <Typography sx={{fontSize:10,color:'text.secondary'}}>Cash: €{Math.round(cash).toLocaleString()}</Typography>
          <Typography sx={{fontSize:10,color:pct>=BENCHMARK?LEVEL_COLOR:'text.secondary'}}>
            Benchmark: +{BENCHMARK}% · You: {pct>=0?'+':''}{pct.toFixed(1)}%
          </Typography>
        </Stack>
      </Box>
    )
  }

  function TimerRing({pct:p,color,secs,label}:{pct:number;color:string;secs:number;label:string}){
    const r=22,c=2*Math.PI*r
    return(
      <Stack sx={{alignItems:'center',mb:1.5}}>
        <Typography sx={{fontSize:10,fontWeight:700,letterSpacing:'.8px',color:'text.secondary',mb:.5}}>{label}</Typography>
        <Box sx={{position:'relative',width:56,height:56,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width={56} height={56} style={{position:'absolute',transform:'rotate(-90deg)'}}>
            <circle cx={28} cy={28} r={r} fill="none" stroke="#f0f0f0" strokeWidth={4}/>
            <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
              strokeDasharray={c} strokeDashoffset={c*(1-p)} strokeLinecap="round"
              style={{transition:'stroke-dashoffset .9s linear,stroke .3s'}}/>
          </svg>
          <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,color,zIndex:1}}>{secs}</Typography>
        </Box>
      </Stack>
    )
  }

  // ── DIFFICULTY SELECTOR ───────────────────────────────────────────────────
  if (phase==='difficulty') return(
    <Box sx={{fontFamily:'var(--font-body)'}}>
      {headerChip('Mini-Game',LEVEL_COLOR,IconChartLine)}
      <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,lineHeight:1.2}}>Stock Market Tycoon</Typography>
      <Typography sx={{fontSize:12,color:'text.secondary',mb:2.5}}>Choose your difficulty before you start</Typography>
      <Stack sx={{gap:1.5,mb:3}}>
        {(['EASY','MEDIUM','HARD'] as Diff[]).map(d=>{
          const sel=diff===d
          const color=d==='EASY'?LEVEL_COLOR:d==='MEDIUM'?'#FF8C00':'#EF4444'
          const info=DIFF_CFG[d]
          return(
            <Box key={d} onClick={()=>setDiff(d)}
              sx={{bgcolor:sel?`${color}12`:'white',border:`2px solid ${sel?color:'#e0e0e0'}`,borderRadius:'12px',p:2,cursor:'pointer',transition:'all .15s'}}>
              <Stack direction="row" sx={{justifyContent:'space-between',alignItems:'center',mb:.5}}>
                <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:15,color:sel?color:'text.primary'}}>{d}</Typography>
                {sel&&<Chip label="Selected" size="small" sx={{bgcolor:`${color}18`,color,fontWeight:700,fontSize:10,height:20}}/>}
              </Stack>
              <Typography sx={{fontSize:12.5,color:'text.secondary',lineHeight:1.5}}>
                {d==='EASY'&&'Full company profiles · Analyst ratings · Hints · More time'}
                {d==='MEDIUM'&&'Company profiles shown · No ratings or hints · Standard time'}
                {d==='HARD'&&'Name and sector only · No hints or ratings · Fast timers'}
              </Typography>
              <Stack direction="row" sx={{gap:2,mt:.75}}>
                <Typography sx={{fontSize:11,color:'text.secondary'}}>IPO: {info.ipoSecs}s</Typography>
                <Typography sx={{fontSize:11,color:'text.secondary'}}>Earnings: {info.earnSecs}s</Typography>
                <Typography sx={{fontSize:11,color:'text.secondary'}}>Live: {info.liveSecs}s</Typography>
              </Stack>
            </Box>
          )
        })}
      </Stack>
      <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5}/>}
        onClick={()=>setPhase('howtoplay')}
        sx={{bgcolor:LEVEL_COLOR,borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#246d8a'}}}>
        Continue →
      </Button>
    </Box>
  )

  // ── HOW TO PLAY ────────────────────────────────────────────────────────────
  if (phase==='howtoplay') return(
    <Box sx={{fontFamily:'var(--font-body)'}}>
      {headerChip('Mini-Game',LEVEL_COLOR,IconChartLine)}
      <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18}}>Stock Market Tycoon</Typography>
      <Typography sx={{fontSize:12,color:'text.secondary',mb:2}}>3 phases of real market action</Typography>
      <Box sx={{bgcolor:'var(--teal-50)',border:'1px solid var(--teal-100)',borderRadius:'14px',p:2.5,mb:2}}>
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:15,mb:2}}>How to Play</Typography>
        {[
          {Icon:IconRocket,      color:'#1D9E75', phase:'Phase 1 — IPO Hunter',     body:'2 companies going public. Read their profile and decide how much of your €1,000 to invest at IPO price.'},
          {Icon:IconChartBar,    color:'#FF8C00', phase:'Phase 2 — Earnings Day',   body:'3 companies report earnings. Predict whether they BEAT or MISS expectations, then BUY, SHORT, or HOLD.'},
          {Icon:IconChartLine,   color:'#7B5FD4', phase:'Phase 3 — Live Trading',   body:'Breaking news hits. React fast — buy and sell your positions in real time before the timer runs out.'},
        ].map(s=>(
          <Stack key={s.phase} direction="row" sx={{gap:1.5,mb:2,alignItems:'flex-start'}}>
            <Box sx={{width:36,height:36,borderRadius:'10px',bgcolor:s.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <s.Icon size={20} strokeWidth={1.5} color="white"/>
            </Box>
            <Box>
              <Typography sx={{fontWeight:700,fontSize:13,mb:.3}}>{s.phase}</Typography>
              <Typography sx={{fontSize:12.5,color:'text.secondary',lineHeight:1.6}}>{s.body}</Typography>
            </Box>
          </Stack>
        ))}
        <Box sx={{bgcolor:'white',border:`1.5px solid ${LEVEL_COLOR}`,borderRadius:'10px',p:1.5,mb:2}}>
          <Typography sx={{fontSize:12.5,lineHeight:1.7}}>Your portfolio carries through all 3 phases. Every decision matters from start to finish!</Typography>
        </Box>
        <Typography sx={{fontSize:12,color:'text.secondary',mb:2}}>
          Start: €1,000 · Difficulty: <strong style={{color:diff==='EASY'?LEVEL_COLOR:diff==='MEDIUM'?'#FF8C00':'#EF4444'}}>{diff}</strong> · Beat the CAC 40 benchmark (+{BENCHMARK}%) to win!
        </Typography>
        <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5}/>}
          onClick={()=>setPhase('ipo')}
          sx={{bgcolor:LEVEL_COLOR,borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#246d8a'}}}>
          Start Trading
        </Button>
      </Box>
    </Box>
  )

  // ── PHASE 1 — IPO ──────────────────────────────────────────────────────────
  if (phase==='ipo') {
    const maxInvest=Math.floor(cash/co.ipoPrice)*co.ipoPrice
    const shares=ipoAmount>0?Math.floor(ipoAmount/co.ipoPrice):0
    const riskColor=co.risk==='HIGH'?'#EF4444':co.risk==='MEDIUM-HIGH'?'#FF8C00':'#1D9E75'
    const ratingColor=co.analystRating==='BUY'?'#1D9E75':co.analystRating==='HOLD'?'#FF8C00':'#EF4444'
    return(
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip('Phase 1 · IPO Hunter','#1D9E75',IconRocket)}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18}}>Stock Market Tycoon</Typography>
        <PortBar/>
        <Stack direction="row" sx={{justifyContent:'space-between',alignItems:'center',mb:1}}>
          <Typography sx={{fontSize:12,color:'text.secondary'}}>IPO {ipoRound+1} of 2</Typography>
          <Typography sx={{fontSize:12,color:'text.secondary'}}>Score: {score}</Typography>
        </Stack>
        <TimerRing pct={timerPct} color={tcol} secs={predTimer} label="DECIDE NOW"/>

        {/* Company card */}
        <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderLeft:`4px solid ${co.color}`,borderRadius:'12px',p:2,mb:2}}>
          <Stack direction="row" sx={{gap:1.5,alignItems:'center',mb:1.5}}>
            <Box sx={{width:44,height:44,borderRadius:'12px',bgcolor:co.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <co.Icon size={22} strokeWidth={1.5} color="white"/>
            </Box>
            <Box>
              <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16}}>{co.name}</Typography>
              <Typography sx={{fontSize:11,color:'text.secondary'}}>{co.ticker} · {co.sector}</Typography>
            </Box>
            <Chip label={`IPO €${co.ipoPrice}`} size="small" sx={{ml:'auto',bgcolor:'#FFF8E1',color:'#C08B00',fontWeight:700,fontSize:11}}/>
          </Stack>
          {diff!=='HARD'&&(
            <Typography sx={{fontSize:13,color:'text.secondary',lineHeight:1.6,mb:1.5,fontStyle:'italic'}}>"{co.description}"</Typography>
          )}
          {diff!=='HARD'&&(
            <Stack direction="row" sx={{gap:2,flexWrap:'wrap',mb:1.5}}>
              {[{l:'Revenue',v:co.revenue},{l:'Growth',v:co.growth},{l:'Founded',v:co.founded},{l:'Employees',v:co.employees}].map(i=>(
                <Box key={i.l} sx={{minWidth:80}}>
                  <Typography sx={{fontSize:9.5,color:'text.secondary',fontWeight:700,letterSpacing:'.4px'}}>{i.l.toUpperCase()}</Typography>
                  <Typography sx={{fontSize:12.5,fontWeight:700}}>{i.v}</Typography>
                </Box>
              ))}
            </Stack>
          )}
          {diff==='EASY'&&(
            <>
              <Divider sx={{my:1}}/>
              <Stack direction="row" sx={{gap:2,mb:1.5}}>
                <Box><Typography sx={{fontSize:10,color:'text.secondary'}}>ANALYST RATING</Typography>
                  <Typography sx={{fontSize:13,fontWeight:800,color:ratingColor}}>{co.analystRating}</Typography></Box>
                <Box><Typography sx={{fontSize:10,color:'text.secondary'}}>TARGET</Typography>
                  <Typography sx={{fontSize:13,fontWeight:700}}>{co.analystTarget}</Typography></Box>
                <Box><Typography sx={{fontSize:10,color:'text.secondary'}}>RISK</Typography>
                  <Typography sx={{fontSize:13,fontWeight:700,color:riskColor}}>{co.risk}</Typography></Box>
              </Stack>
              <Stack sx={{gap:.5,mb:.5}}>
                {co.pros.slice(0,2).map(p=>(
                  <Stack key={p} direction="row" sx={{gap:.75,alignItems:'center'}}>
                    <IconCircleCheck size={13} strokeWidth={1.5} color="#1D9E75"/>
                    <Typography sx={{fontSize:12}}>{p}</Typography>
                  </Stack>
                ))}
                {co.cons.slice(0,2).map(c=>(
                  <Stack key={c} direction="row" sx={{gap:.75,alignItems:'center'}}>
                    <IconCircleX size={13} strokeWidth={1.5} color="#EF4444"/>
                    <Typography sx={{fontSize:12}}>{c}</Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
          {diff==='HARD'&&(
            <Typography sx={{fontSize:13,fontWeight:600}}>{co.sector} · {co.country}</Typography>
          )}
        </Box>

        {/* Slider */}
        <Typography sx={{fontSize:12,fontWeight:700,color:'text.secondary',letterSpacing:'.5px',mb:.5}}>HOW MUCH WILL YOU INVEST?</Typography>
        <Box sx={{px:1,mb:1}}>
          <Slider value={ipoAmount} min={0} max={Math.min(maxInvest,cash)} step={co.ipoPrice}
            onChange={(_,v)=>setIpoAmount(v as number)}
            sx={{'& .MuiSlider-thumb':{bgcolor:LEVEL_COLOR},'& .MuiSlider-track':{bgcolor:LEVEL_COLOR},'& .MuiSlider-rail':{bgcolor:'#e0e0e0'}}}/>
        </Box>
        <Box sx={{bgcolor:'var(--teal-50)',border:'1px solid var(--teal-100)',borderRadius:'10px',p:1.5,mb:2}}>
          {ipoAmount>0?(
            <>
              <Typography sx={{fontSize:13,fontWeight:700}}>Investing €{ipoAmount.toFixed(0)} at €{co.ipoPrice}/share</Typography>
              <Typography sx={{fontSize:12,color:'text.secondary'}}>= {shares} shares · €{(cash-ipoAmount).toFixed(0)} cash remaining</Typography>
            </>
          ):(
            <Typography sx={{fontSize:13,fontWeight:700,color:'text.secondary'}}>Skipping this IPO</Typography>
          )}
        </Box>
        {diff==='EASY'&&<Box sx={{bgcolor:'#FFF8E1',border:'1px solid #FFCC80',borderRadius:'8px',p:1.25,mb:2}}>
          <Typography sx={{fontSize:12,color:'#C08B00',lineHeight:1.6}}>{co.hint}</Typography>
        </Box>}
        <Stack direction="row" sx={{gap:1}}>
          <Button variant="outlined" onClick={()=>{advRef.current=true;doIpoDecide(0)}}
            sx={{flex:1,borderRadius:'10px',textTransform:'none',fontWeight:700,borderColor:'#ccc',color:'text.secondary','&:hover':{bgcolor:'#f9f9f9'}}}>
            Skip IPO
          </Button>
          <Button variant="contained" disabled={ipoAmount===0} onClick={()=>{advRef.current=true;doIpoDecide(ipoAmount)}}
            endIcon={<IconArrowRight size={16} strokeWidth={1.5}/>}
            sx={{flex:2,bgcolor:LEVEL_COLOR,borderRadius:'10px',textTransform:'none',fontWeight:700,'&:hover':{bgcolor:'#246d8a'},'&.Mui-disabled':{opacity:.4}}}>
            Invest €{ipoAmount.toFixed(0)}
          </Button>
        </Stack>
      </Box>
    )
  }

  // ── IPO RESULT ─────────────────────────────────────────────────────────────
  if (phase==='iporesult'&&pendingIpo) {
    const c2 = IPO_COS[ipoRound]
    const up = c2.ipoResult>0
    const bg = up?'var(--teal-50)':'#FFF5F5'
    const border = up?'#1D9E75':'#EF4444'
    return(
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip('Phase 1 · IPO Result','#1D9E75',IconRocket)}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,mb:2}}>Stock Market Tycoon</Typography>
        <Box sx={{bgcolor:bg,border:`2px solid ${border}`,borderRadius:'12px',p:2,mb:2,
          animation:'slideIn .4s ease','@keyframes slideIn':{from:{transform:'translateY(-12px)',opacity:0},to:{transform:'translateY(0)',opacity:1}}}}>
          <Stack direction="row" sx={{gap:1,alignItems:'center',mb:1.5}}>
            {up?<IconTrendingUp size={20} strokeWidth={1.5} color="#1D9E75"/>:<IconTrendingDown size={20} strokeWidth={1.5} color="#EF4444"/>}
            <Typography sx={{fontWeight:800,fontSize:15,color:border}}>IPO RESULT: {c2.name.toUpperCase()}</Typography>
          </Stack>
          <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,color:border,mb:.5}}>
            {c2.ipoResult>0?'+':''}{c2.ipoResult}% first day
          </Typography>
          <Typography sx={{fontSize:13,color:'text.secondary',mb:1.5}}>
            €{c2.ipoPrice} IPO → €{pendingIpo.closePrice.toFixed(2)} close
          </Typography>
          {pendingIpo.shares>0?(
            <>
              <Stack direction="row" sx={{justifyContent:'space-between',mb:.5}}>
                <Typography sx={{fontSize:13,color:'text.secondary'}}>Your investment</Typography>
                <Typography sx={{fontSize:13,fontWeight:700}}>€{pendingIpo.invested.toFixed(0)}</Typography>
              </Stack>
              <Stack direction="row" sx={{justifyContent:'space-between'}}>
                <Typography sx={{fontSize:13,color:'text.secondary'}}>Now worth</Typography>
                <Typography sx={{fontSize:13,fontWeight:800,color:border}}>
                  €{(pendingIpo.shares*pendingIpo.closePrice).toFixed(0)}
                  <span style={{fontSize:11,marginLeft:4}}>({pendingIpo.pnl>=0?'+':''}€{pendingIpo.pnl.toFixed(0)})</span>
                </Typography>
              </Stack>
            </>
          ):(
            <Typography sx={{fontSize:13,color:'text.secondary',fontStyle:'italic'}}>You skipped this IPO.</Typography>
          )}
        </Box>
        <Box sx={{bgcolor:'#F3F0FF',border:'1px solid #E2DAFF',borderRadius:'10px',p:1.5,mb:2}}>
          <Stack direction="row" sx={{gap:1,alignItems:'flex-start'}}>
            <IconRobot size={18} strokeWidth={1.5} color="#7B5FD4" style={{flexShrink:0,marginTop:2}}/>
            <Typography sx={{fontSize:12.5,color:'#4B3A8C',lineHeight:1.6,fontStyle:'italic'}}>{c2.explanation}</Typography>
          </Stack>
        </Box>
        <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5}/>}
          onClick={ipoNext}
          sx={{bgcolor:LEVEL_COLOR,borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#246d8a'}}}>
          {ipoRound+1<IPO_COS.length?`Next IPO →`:'Phase 1 Results →'}
        </Button>
      </Box>
    )
  }

  // ── PHASE 1 DONE ───────────────────────────────────────────────────────────
  if (phase==='phase1done') return(
    <Box sx={{fontFamily:'var(--font-body)'}}>
      {headerChip('Phase 1 Complete','#1D9E75',IconRocket)}
      <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,mb:2}}>Stock Market Tycoon</Typography>
      <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2.5,mb:2}}>
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16,mb:1.5}}>Phase 1 — IPO Hunter</Typography>
        {ipoResults.map(r=>(
          <Stack key={r.company} direction="row" sx={{justifyContent:'space-between',alignItems:'center',mb:.75}}>
            <Typography sx={{fontSize:13,color:'text.secondary'}}>{r.company}</Typography>
            <Typography sx={{fontSize:13,fontWeight:700,color:r.skipped?'text.secondary':r.pnl>=0?'#1D9E75':'#EF4444'}}>
              {r.skipped?'Skipped':`${r.pnl>=0?'+':''}€${r.pnl.toFixed(0)}`}
            </Typography>
          </Stack>
        ))}
        <Divider sx={{my:1}}/>
        <Stack direction="row" sx={{justifyContent:'space-between'}}>
          <Typography sx={{fontSize:13,fontWeight:700}}>Portfolio after Phase 1</Typography>
          <Typography sx={{fontSize:13,fontWeight:800,color:pv>=START_CASH?'#1D9E75':'#EF4444'}}>€{Math.round(pv).toLocaleString()}</Typography>
        </Stack>
        {Object.keys(holdings).length>0&&(
          <Box sx={{mt:1.5}}>
            <Typography sx={{fontSize:11,color:'text.secondary',fontWeight:700,letterSpacing:'.5px',mb:.75}}>HOLDINGS CARRIED FORWARD</Typography>
            {Object.entries(holdings).map(([t,h])=>(
              <Stack key={t} direction="row" sx={{justifyContent:'space-between',mb:.5}}>
                <Typography sx={{fontSize:12}}>{t} — {h.shares.toFixed(2)} shares</Typography>
                <Typography sx={{fontSize:12,fontWeight:600}}>€{(h.shares*h.currentPrice).toFixed(0)}</Typography>
              </Stack>
            ))}
          </Box>
        )}
      </Box>
      <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5}/>}
        onClick={()=>{setPhase('earnings')}}
        sx={{bgcolor:'#FF8C00',borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#d97400'}}}>
        On to Earnings Day →
      </Button>
    </Box>
  )

  // ── PHASE 2 — EARNINGS ─────────────────────────────────────────────────────
  if (phase==='earnings') {
    const ec=EARN_COS[earnRound]
    const held=holdings[ec.id]
    const heldVal=held?held.shares*held.currentPrice:0
    const pnlUnreal=held?held.shares*(held.currentPrice-held.avgBuyPrice):0
    return(
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip('Phase 2 · Earnings Day','#FF8C00',IconChartBar)}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18}}>Stock Market Tycoon</Typography>
        <PortBar/>
        <Stack direction="row" sx={{justifyContent:'space-between',mb:1}}>
          <Typography sx={{fontSize:12,color:'text.secondary'}}>Report {earnRound+1} of 3</Typography>
          <Typography sx={{fontSize:12,color:'text.secondary'}}>Score: {score}</Typography>
        </Stack>

        {earnStep==='predict'&&<TimerRing pct={timerPct} color={tcol} secs={predTimer} label="PREDICT NOW"/>}

        {/* Company info */}
        <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderLeft:`4px solid ${ec.color}`,borderRadius:'12px',p:2,mb:2}}>
          <Stack direction="row" sx={{alignItems:'center',gap:1.5,mb:1}}>
            <Box sx={{width:40,height:40,borderRadius:'10px',bgcolor:ec.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <ec.Icon size={20} strokeWidth={1.5} color="white"/>
            </Box>
            <Box>
              <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:15}}>{ec.name}</Typography>
              <Typography sx={{fontSize:11,color:'text.secondary'}}>{ec.ticker} · €{ec.currentPrice}</Typography>
            </Box>
          </Stack>
          <Box sx={{bgcolor:'#FFF8E1',border:'1px solid #FFCC80',borderRadius:'8px',p:1.25,mb:1}}>
            <Typography sx={{fontSize:11,fontWeight:700,color:'#C08B00',mb:.25}}>ANALYST EXPECTS</Typography>
            <Typography sx={{fontSize:14,fontWeight:700}}>{ec.analystExpectation}</Typography>
          </Box>
          {held&&(
            <Typography sx={{fontSize:12,color:'text.secondary'}}>
              You hold {held.shares.toFixed(2)} shares · €{heldVal.toFixed(0)} ({pnlUnreal>=0?'+':''}€{pnlUnreal.toFixed(0)} P&L)
            </Typography>
          )}
        </Box>

        {/* Step A — predict */}
        {earnStep==='predict'&&(
          <>
            <Typography sx={{fontSize:12,fontWeight:700,color:'text.secondary',letterSpacing:'.5px',mb:1}}>WILL {ec.name.toUpperCase()} BEAT, MEET, OR MISS?</Typography>
            <Stack direction="row" sx={{gap:1,mb:2}}>
              {(['BEAT','MEET','MISS'] as const).map(p=>{
                const c2=p==='BEAT'?'#1D9E75':p==='MEET'?'#FF8C00':'#EF4444'
                const Icon=p==='BEAT'?IconTrophy:p==='MEET'?IconPlayerPause:IconTrendingDown
                return(
                  <Button key={p} variant={beatPred===p?'contained':'outlined'} onClick={()=>handleBeatPred(p)}
                    sx={{flex:1,flexDirection:'column',gap:.4,py:1.25,borderRadius:'10px',textTransform:'none',
                      bgcolor:beatPred===p?c2:'white',borderColor:c2,color:beatPred===p?'white':c2,
                      '&:hover':{bgcolor:`${c2}18`,borderColor:c2}}}>
                    <Icon size={18} strokeWidth={1.5}/>
                    <Typography sx={{fontSize:11,fontWeight:700,lineHeight:1}}>{p}</Typography>
                    <Typography sx={{fontSize:9,opacity:.8}}>Expectations</Typography>
                  </Button>
                )
              })}
            </Stack>
          </>
        )}

        {/* Step B — trade */}
        {earnStep==='trade'&&(
          <>
            {beatPred&&diff==='EASY'&&(
              <Box sx={{bgcolor:beatPred==='MISS'?'#FFF5F5':'var(--teal-50)',border:`1px solid ${beatPred==='MISS'?'#EF444444':'var(--teal-100)'}`,borderRadius:'8px',p:1.25,mb:1.5}}>
                <Typography sx={{fontSize:12,color:beatPred==='MISS'?'#DC2626':'#1D9E75',lineHeight:1.6}}>
                  {beatPred==='BEAT'&&'If they beat, price likely rises — consider buying before the announcement.'}
                  {beatPred==='MISS'&&'If they miss, price likely falls — consider shorting or holding back.'}
                  {beatPred==='MEET'&&'In-line results usually mean small price movement either way.'}
                </Typography>
              </Box>
            )}
            <Typography sx={{fontSize:12,fontWeight:700,color:'text.secondary',letterSpacing:'.5px',mb:1}}>YOUR FINAL MOVE BEFORE THE ANNOUNCEMENT</Typography>
            <Stack direction="row" sx={{gap:1,mb:2}}>
              {(['BUY','HOLD','SHORT'] as const).map(t=>{
                const c2=t==='BUY'?'#1D9E75':t==='HOLD'?'#888':'#EF4444'
                const Icon=t==='BUY'?IconChevronUp:t==='HOLD'?IconPlayerPause:IconTrendingDown
                return(
                  <Button key={t} variant={tradePred===t?'contained':'outlined'} onClick={()=>handleEarningsTrade(t)}
                    sx={{flex:1,flexDirection:'column',gap:.4,py:1.25,borderRadius:'10px',textTransform:'none',
                      bgcolor:tradePred===t?c2:'white',borderColor:c2,color:tradePred===t?'white':c2,
                      '&:hover':{bgcolor:`${c2}18`,borderColor:c2}}}>
                    <Icon size={18} strokeWidth={1.5}/>
                    <Typography sx={{fontSize:11,fontWeight:700,lineHeight:1}}>{t}</Typography>
                    <Typography sx={{fontSize:9,opacity:.8}}>{t==='BUY'?'€100':''}  {t==='SHORT'?'Bet on fall':''}</Typography>
                  </Button>
                )
              })}
            </Stack>
          </>
        )}
      </Box>
    )
  }

  // ── EARNINGS RESULT ────────────────────────────────────────────────────────
  if (phase==='earningsresult') {
    const ec=EARN_COS[earnRound]
    const last=earnResults[earnResults.length-1]
    const up=ec.priceChange>0
    const bg=up?'var(--teal-50)':'#FFF5F5'
    const border=up?'#1D9E75':'#EF4444'
    const newP=(ec.currentPrice*(1+ec.priceChange/100)).toFixed(2)
    return(
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip('Phase 2 · Earnings Result','#FF8C00',IconChartBar)}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,mb:2}}>Stock Market Tycoon</Typography>
        <Box sx={{bgcolor:bg,border:`2px solid ${border}`,borderRadius:'12px',p:2,mb:2,
          animation:'slideIn .4s ease','@keyframes slideIn':{from:{transform:'translateY(-12px)',opacity:0},to:{transform:'translateY(0)',opacity:1}}}}>
          <Stack direction="row" sx={{gap:1,alignItems:'center',mb:1}}>
            {ec.actualResult==='BEAT'?<IconTrophy size={20} strokeWidth={1.5} color="#1D9E75"/>:
             ec.actualResult==='MISS'?<IconTrendingDown size={20} strokeWidth={1.5} color="#EF4444"/>:
             <IconPlayerPause size={20} strokeWidth={1.5} color="#FF8C00"/>}
            <Typography sx={{fontWeight:800,fontSize:15,color:border}}>EARNINGS: {ec.name.toUpperCase()} {ec.actualResult}S!</Typography>
          </Stack>
          <Typography sx={{fontSize:12.5,color:'text.secondary',mb:.75}}>Expected: {ec.analystExpectation}</Typography>
          <Typography sx={{fontSize:13,fontWeight:700,mb:1}}>Actual: {ec.actualRevenue}</Typography>
          <Typography sx={{fontSize:20,fontWeight:800,color:border,mb:.25}}>{ec.priceChange>0?'+':''}{ec.priceChange}%</Typography>
          <Typography sx={{fontSize:12,color:'text.secondary'}}>€{ec.currentPrice} → €{newP}</Typography>
        </Box>
        {last&&(
          <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'12px',p:2,mb:2}}>
            <Stack direction="row" sx={{alignItems:'center',gap:1,mb:.75}}>
              {last.correct?<IconCircleCheck size={18} strokeWidth={1.5} color="#1D9E75"/>:<IconCircleX size={18} strokeWidth={1.5} color="#EF4444"/>}
              <Typography sx={{fontSize:13,fontWeight:700,color:last.correct?'#1D9E75':'#EF4444'}}>
                Prediction: {last.prediction} {last.correct?'✓ Correct!':'✗ Wrong'}
              </Typography>
              {last.pts>0&&<Chip label={`+${last.pts} pts`} size="small" sx={{ml:'auto',bgcolor:'#FFF8E1',color:'#C08B00',fontWeight:700,fontSize:11}}/>}
            </Stack>
            <Stack direction="row" sx={{justifyContent:'space-between',mb:.5}}>
              <Typography sx={{fontSize:13,color:'text.secondary'}}>Your trade: {last.trade}</Typography>
              <Typography sx={{fontSize:13,fontWeight:700,color:last.tradePnl>=0?'#1D9E75':'#EF4444'}}>
                {last.tradePnl>=0?'+':''}€{last.tradePnl.toFixed(0)}
              </Typography>
            </Stack>
          </Box>
        )}
        <Box sx={{bgcolor:'#F3F0FF',border:'1px solid #E2DAFF',borderRadius:'10px',p:1.5,mb:2}}>
          <Stack direction="row" sx={{gap:1,alignItems:'flex-start'}}>
            <IconRobot size={18} strokeWidth={1.5} color="#7B5FD4" style={{flexShrink:0,marginTop:2}}/>
            <Typography sx={{fontSize:12.5,color:'#4B3A8C',lineHeight:1.6,fontStyle:'italic'}}>{ec.explanation}</Typography>
          </Stack>
        </Box>
        <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5}/>}
          onClick={earningsNext}
          sx={{bgcolor:'#FF8C00',borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#d97400'}}}>
          {earnRound+1<EARN_COS.length?`Next Report →`:'Phase 2 Results →'}
        </Button>
      </Box>
    )
  }

  // ── PHASE 2 DONE ───────────────────────────────────────────────────────────
  if (phase==='phase2done') return(
    <Box sx={{fontFamily:'var(--font-body)'}}>
      {headerChip('Phase 2 Complete','#FF8C00',IconChartBar)}
      <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,mb:2}}>Stock Market Tycoon</Typography>
      <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2.5,mb:2}}>
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16,mb:1.5}}>Phase 2 — Earnings Day</Typography>
        <Stack direction="row" sx={{justifyContent:'space-between',mb:1.5}}>
          <Typography sx={{fontSize:13}}>Correct predictions</Typography>
          <Typography sx={{fontSize:13,fontWeight:700,color:correctPreds>=2?'#1D9E75':'text.secondary'}}>{correctPreds}/3</Typography>
        </Stack>
        {earnResults.map(r=>(
          <Stack key={r.company} direction="row" sx={{justifyContent:'space-between',mb:.75,alignItems:'center'}}>
            <Stack direction="row" sx={{gap:.5,alignItems:'center'}}>
              {r.correct?<IconCircleCheck size={13} strokeWidth={1.5} color="#1D9E75"/>:<IconCircleX size={13} strokeWidth={1.5} color="#EF4444"/>}
              <Typography sx={{fontSize:13,color:'text.secondary'}}>{r.company}</Typography>
            </Stack>
            <Typography sx={{fontSize:13,fontWeight:700,color:r.tradePnl>=0?'#1D9E75':'#EF4444'}}>
              {r.tradePnl>=0?'+':''}€{r.tradePnl.toFixed(0)}
            </Typography>
          </Stack>
        ))}
        <Divider sx={{my:1}}/>
        <Stack direction="row" sx={{justifyContent:'space-between'}}>
          <Typography sx={{fontSize:13,fontWeight:700}}>Portfolio after Phase 2</Typography>
          <Typography sx={{fontSize:13,fontWeight:800,color:pv>=START_CASH?'#1D9E75':'#EF4444'}}>€{Math.round(pv).toLocaleString()}</Typography>
        </Stack>
        <Stack direction="row" sx={{justifyContent:'space-between',mt:.5}}>
          <Typography sx={{fontSize:12,color:'text.secondary'}}>vs CAC 40 benchmark</Typography>
          <Typography sx={{fontSize:12,fontWeight:600,color:pct>=BENCHMARK?'#1D9E75':'#EF4444'}}>
            {pct>=BENCHMARK?'Ahead':'Behind'} by {Math.abs(pct-BENCHMARK).toFixed(1)}%
          </Typography>
        </Stack>
      </Box>
      <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5}/>}
        onClick={startLive}
        sx={{bgcolor:'#7B5FD4',borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#6448b8'}}}>
        Prepare for Live Trading →
      </Button>
    </Box>
  )

  // ── PHASE 3 — LIVE TRADING ─────────────────────────────────────────────────
  if (phase==='live') {
    const allTickers=[
      ...Object.keys(holdings),
      ...NEWS_EVENTS.filter(e=>shownNews.includes(e.id)&&e.affectedTicker!=='ALL'&&e.affectedTicker!=='ALL_EU')
        .map(e=>resolveT(e.affectedTicker))
    ].filter((t,i,a)=>a.indexOf(t)===i)

    const watchlist=allTickers.filter(t=>!holdings[t]&&stockPrices[t])

    const firedEvs=NEWS_EVENTS.filter(e=>shownNews.includes(e.id))
    const upFired=firedEvs.filter(e=>e.direction==='UP').length
    const downFired=firedEvs.filter(e=>e.direction==='DOWN').length
    const sentiment=upFired-downFired>=2?'BULLISH':downFired-upFired>=2?'BEARISH':'MIXED'
    const sentCol=sentiment==='BULLISH'?'#1D9E75':sentiment==='BEARISH'?'#EF4444':'#C08B00'
    const recentNews=[...shownNews].reverse().filter(id=>id!==activeNews?.id).slice(0,3)
      .map(id=>NEWS_EVENTS.find(e=>e.id===id)).filter((e):e is NewsEvent=>!!e)

    return(
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip('Phase 3 · Live Trading','#7B5FD4',IconChartLine)}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18}}>Stock Market Tycoon</Typography>

        {/* Top bar */}
        <Stack direction="row" sx={{alignItems:'center',gap:1.5,mb:1}}>
          <Box sx={{position:'relative',width:50,height:50,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width={50} height={50} style={{position:'absolute',transform:'rotate(-90deg)'}}>
              <circle cx={25} cy={25} r={21} fill="none" stroke="#f0f0f0" strokeWidth={4}/>
              <circle cx={25} cy={25} r={21} fill="none" stroke={lcol} strokeWidth={4}
                strokeDasharray={2*Math.PI*21} strokeDashoffset={2*Math.PI*21*(1-liveRatio)}
                strokeLinecap="round" style={{transition:'stroke-dashoffset 1s linear,stroke .3s'}}/>
            </svg>
            <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:15,color:lcol}}>{liveTimer}</Typography>
          </Box>
          <Box sx={{flex:1}}>
            <Typography sx={{fontSize:12,fontWeight:700,color:'text.secondary'}}>LIVE TRADING</Typography>
            <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16,color:pv>=START_CASH?'#1D9E75':'#EF4444'}}>
              €{Math.round(pv).toLocaleString()}
              <span style={{fontSize:12,marginLeft:6,color:pct>=BENCHMARK?'#1D9E75':'#EF4444'}}>{pct>=0?'+':''}{pct.toFixed(1)}%</span>
            </Typography>
            <Typography sx={{fontSize:11,color:'text.secondary'}}>Cash: €{Math.round(cash).toLocaleString()}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" sx={{gap:1,mb:1.5}}>
          <Chip label={`${shownNews.length} / ${NEWS_EVENTS.length} news`} size="small"
            sx={{bgcolor:'rgba(123,95,212,.1)',color:'#7B5FD4',fontWeight:700,fontSize:10,height:20}}/>
          {shownNews.length>0&&(
            <Chip label={`Market: ${sentiment}`} size="small"
              sx={{bgcolor:`${sentCol}18`,color:sentCol,fontWeight:700,fontSize:10,height:20}}/>
          )}
        </Stack>

        {/* Breaking news banner */}
        {activeNews&&(
          <Box sx={{bgcolor:activeNews.direction==='UP'?'var(--teal-50)':'#FFF5F5',
            border:`2px solid ${activeNews.direction==='UP'?'#1D9E75':'#EF4444'}`,
            borderRadius:'10px',p:1.5,mb:1.5,
            animation:'slideRight .4s ease','@keyframes slideRight':{from:{transform:'translateX(20px)',opacity:0},to:{transform:'translateX(0)',opacity:1}}}}>
            <Stack direction="row" sx={{gap:.75,alignItems:'center',mb:.5}}>
              <Chip label="BREAKING" size="small" sx={{bgcolor:activeNews.direction==='UP'?'#1D9E75':'#EF4444',color:'white',fontWeight:800,fontSize:9,height:18}}/>
              <Typography sx={{fontSize:11,fontWeight:700,color:activeNews.direction==='UP'?'#1D9E75':'#EF4444'}}>
                {activeNews.affectedName} {activeNews.direction==='UP'?'+':''}{activeNews.priceImpact}%
              </Typography>
            </Stack>
            <Typography sx={{fontSize:12.5,lineHeight:1.5}}>{activeNews.headline}</Typography>
          </Box>
        )}

        {/* Recent news history */}
        {recentNews.length>0&&(
          <Box sx={{mb:1.5,px:.5}}>
            <Typography sx={{fontSize:10,fontWeight:700,color:'text.secondary',letterSpacing:'.5px',mb:.5}}>RECENT NEWS</Typography>
            {recentNews.map(ev=>(
              <Stack key={ev.id} direction="row" sx={{gap:.75,alignItems:'center',mb:.35}}>
                <Box sx={{width:6,height:6,borderRadius:'50%',bgcolor:ev.direction==='UP'?'#1D9E75':'#EF4444',flexShrink:0}}/>
                <Typography sx={{fontSize:11,color:'text.secondary',lineHeight:1.4}}>
                  <span style={{fontWeight:700,color:ev.direction==='UP'?'#1D9E75':'#EF4444'}}>
                    {ev.affectedName} {ev.direction==='UP'?'+':''}{ev.priceImpact}%
                  </span>
                  {' — '}{ev.headline.split(' — ')[1]||ev.headline.slice(0,45)}
                </Typography>
              </Stack>
            ))}
          </Box>
        )}

        {/* Holdings */}
        {Object.keys(holdings).length>0&&(
          <Box sx={{mb:2}}>
            <Typography sx={{fontSize:11,fontWeight:700,color:'text.secondary',letterSpacing:'.5px',mb:.75}}>YOUR POSITIONS</Typography>
            {Object.entries(holdings).map(([t,h])=>{
              const price=stockPrices[t]??h.currentPrice
              const val=h.shares*price
              const pnl=h.shares*(price-h.avgBuyPrice)
              const isFlash=flashTicker?.t===t||flashTicker?.t==='ALL'||(flashTicker?.t==='ALL_EU'&&EU_TICKERS.has(t))
              const flashDir=flashTicker?.d
              return(
                <Box key={t} sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'12px',p:1.75,mb:1,
                  animation:isFlash?`${flashDir==='up'?'flashGreen':'flashRed'} .6s ease`:'none',
                  '@keyframes flashGreen':{'0%,100%':{bgcolor:'white'},'50%':{bgcolor:'#E8F5E9'}},
                  '@keyframes flashRed':{'0%,100%':{bgcolor:'white'},'50%':{bgcolor:'#FFF5F5'}}}}>
                  <Stack direction="row" sx={{justifyContent:'space-between',mb:.75}}>
                    <Typography sx={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14}}>{t}</Typography>
                    <Typography sx={{fontSize:14,fontWeight:800,color:pnl>=0?'#1D9E75':'#EF4444'}}>
                      €{val.toFixed(0)} <span style={{fontSize:11}}>({pnl>=0?'+':''}€{pnl.toFixed(0)})</span>
                    </Typography>
                  </Stack>
                  <Typography sx={{fontSize:13,color:'text.secondary',mb:1}}>
                    {h.shares.toFixed(2)} shares · €{price.toFixed(2)}/share
                  </Typography>
                  <Stack direction="row" sx={{gap:1}}>
                    <Button size="small" variant="outlined" onClick={()=>sellStock(t)}
                      sx={{flex:1,borderRadius:'8px',textTransform:'none',fontWeight:700,fontSize:12,py:.5,borderColor:'#EF4444',color:'#EF4444','&:hover':{bgcolor:'#FFF5F5',borderColor:'#EF4444'}}}>
                      Sell All
                    </Button>
                    <Button size="small" variant="outlined" disabled={cash<50} onClick={()=>buyStock(t)}
                      sx={{flex:1,borderRadius:'8px',textTransform:'none',fontWeight:700,fontSize:12,py:.5,borderColor:'#1D9E75',color:'#1D9E75','&:hover':{bgcolor:'var(--teal-50)',borderColor:'#1D9E75'},'&.Mui-disabled':{opacity:.4}}}>
                      Buy €100
                    </Button>
                  </Stack>
                </Box>
              )
            })}
          </Box>
        )}

        {/* Watchlist — stocks hit by news but not held */}
        {watchlist.length>0&&(
          <Box sx={{mb:2}}>
            <Typography sx={{fontSize:11,fontWeight:700,color:'text.secondary',letterSpacing:'.5px',mb:.75}}>WATCHLIST (AFFECTED BY NEWS)</Typography>
            {watchlist.map(t=>{
              const price=stockPrices[t]
              if(!price) return null
              const ev=NEWS_EVENTS.find(e=>resolveT(e.affectedTicker)===t)
              return(
                <Stack key={t} direction="row" sx={{alignItems:'center',gap:1,bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'10px',p:1.25,mb:1}}>
                  <Box sx={{flex:1}}>
                    <Typography sx={{fontSize:13,fontWeight:700}}>{getStockName(t)}</Typography>
                    <Typography sx={{fontSize:11,color:ev?.direction==='UP'?'#1D9E75':'#EF4444'}}>
                      {ev?.direction==='UP'?'+':''}{ev?.priceImpact}% today · €{price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button size="small" variant="contained" disabled={cash<50} onClick={()=>buyStock(t)}
                    sx={{borderRadius:'8px',textTransform:'none',fontWeight:700,fontSize:12,bgcolor:'#1D9E75','&:hover':{bgcolor:'#178a64'},'&.Mui-disabled':{opacity:.4}}}>
                    Buy €100
                  </Button>
                </Stack>
              )
            })}
          </Box>
        )}

        {Object.keys(holdings).length===0&&watchlist.length===0&&(
          <Box sx={{bgcolor:'var(--teal-50)',border:'1px solid var(--teal-100)',borderRadius:'10px',p:2,textAlign:'center',mb:2}}>
            <Typography sx={{fontSize:13,color:'var(--teal-600)'}}>Waiting for news events… React fast when headlines appear!</Typography>
          </Box>
        )}
      </Box>
    )
  }

  // ── FINAL RESULTS ──────────────────────────────────────────────────────────
  if (phase==='final') {
    const fv=portHistory[portHistory.length-1]?.value??Math.round(pv)
    const fpct=((fv-START_CASH)/START_CASH)*100
    const beat=fpct>=BENCHMARK
    const lottie=fv>=START_CASH*1.15?TrophyWinner:fv>=START_CASH*1.05?Champion:Thinking
    const xpAmt=diff==='HARD'?30:20

    const chartD=portHistory.map((p,i)=>({
      ...p,
      bench:Math.round(START_CASH*(1+BENCHMARK/100*(i/(portHistory.length-1||1))))
    }))

    function perfMsg(){
      if(beat&&score>200) return "Stock market genius! You beat professional fund managers who spend their careers trying to beat the index. Only 20% of active managers achieve this consistently."
      if(beat) return "You beat the CAC 40! Your IPO picks, earnings predictions, and live trading decisions all came together. The market rewarded your research."
      if(fpct>0) return "Positive return but the market beat you this time. This is why low-cost index ETFs are popular — beating the market is harder than it looks."
      return "The market humbled you! Even professional traders lose money sometimes. Key lesson: diversify, never invest what you can't afford to lose, and always research before buying."
    }

    return(
      <Box sx={{fontFamily:'var(--font-body)'}}>
        {headerChip('Stock Market Tycoon',LEVEL_COLOR,IconChartLine)}
        <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,mb:2}}>Final Results</Typography>

        <Box sx={{display:'flex',justifyContent:'center',mb:1}}>
          <LottieAnimation animationData={lottie} width={160} height={160} loop={false}/>
        </Box>

        <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2.5,mb:2}}>
          <Stack direction="row" sx={{alignItems:'center',gap:1,mb:2}}>
            <IconTrophy size={20} strokeWidth={1.5} color={beat?'#C08B00':'text.secondary'}/>
            <Typography sx={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16}}>Total Score: {score} pts</Typography>
            <Chip label={diff} size="small" sx={{ml:'auto',bgcolor:diff==='EASY'?'#E8F5E9':diff==='MEDIUM'?'#FFF8E1':'#FFF5F5',color:diff==='EASY'?'#1D9E75':diff==='MEDIUM'?'#C08B00':'#EF4444',fontWeight:700,fontSize:10}}/>
          </Stack>
          {[
            {l:'Starting portfolio', v:`€${START_CASH.toLocaleString()}`, c:'text.secondary'},
            {l:'Final portfolio',    v:`€${fv.toLocaleString()}`,         c:fpct>=0?'#1D9E75':'#EF4444'},
            {l:'Total return',       v:`${fpct>=0?'+':''}${fpct.toFixed(1)}%`, c:fpct>=0?'#1D9E75':'#EF4444'},
          ].map(r=>(
            <Stack key={r.l} direction="row" sx={{justifyContent:'space-between',mb:.75}}>
              <Typography sx={{fontSize:13,color:'text.secondary'}}>{r.l}</Typography>
              <Typography sx={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</Typography>
            </Stack>
          ))}
          <Divider sx={{my:1}}/>
          <Stack direction="row" sx={{justifyContent:'space-between',mb:.75}}>
            <Typography sx={{fontSize:13,color:'text.secondary'}}>CAC 40 benchmark</Typography>
            <Typography sx={{fontSize:13,fontWeight:700,color:'#C08B00'}}>+{BENCHMARK.toFixed(1)}%</Typography>
          </Stack>
          <Stack direction="row" sx={{justifyContent:'space-between',mb:.75}}>
            <Typography sx={{fontSize:13,color:'text.secondary'}}>You {beat?'beat':'missed'} the market by</Typography>
            <Typography sx={{fontSize:13,fontWeight:700,color:beat?'#1D9E75':'#EF4444'}}>
              {beat?'+':'-'}{Math.abs(fpct-BENCHMARK).toFixed(1)}%
            </Typography>
          </Stack>
          <Divider sx={{my:1}}/>
          <Stack direction="row" sx={{justifyContent:'space-between',mb:.5}}>
            <Typography sx={{fontSize:13,color:'text.secondary'}}>Correct predictions</Typography>
            <Typography sx={{fontSize:13,fontWeight:700}}>{correctPreds}/5</Typography>
          </Stack>
        </Box>

        {/* Chart */}
        <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2,mb:2}}>
          <Typography sx={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,mb:1.5}}>Portfolio vs CAC 40 Benchmark</Typography>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={chartD} margin={{top:4,right:8,left:-16,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="label" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:9}} domain={['auto','auto']} tickFormatter={(v:number)=>`€${v}`}/>
              <Tooltip formatter={(v:unknown)=>`€${Number(v).toLocaleString()}`}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <ReferenceLine y={START_CASH} stroke="#ccc" strokeDasharray="3 3"/>
              <Line type="monotone" dataKey="value" name="Your Portfolio" stroke={LEVEL_COLOR} strokeWidth={2.5} dot={{r:4,fill:LEVEL_COLOR}} activeDot={{r:6}}/>
              <Line type="monotone" dataKey="bench" name="CAC 40 (+5%)" stroke="#C08B00" strokeWidth={2} strokeDasharray="5 3" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Phase breakdown */}
        <Box sx={{bgcolor:'white',border:'1px solid var(--border,#E0E0E0)',borderRadius:'14px',p:2,mb:2}}>
          <Typography sx={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,mb:1.5}}>Phase Breakdown</Typography>
          {ipoResults.map((r,i)=>(
            <Stack key={i} direction="row" sx={{justifyContent:'space-between',py:.6,borderBottom:'1px solid #f0f0f0'}}>
              <Typography sx={{fontSize:12,color:'text.secondary'}}>IPO: {r.company}</Typography>
              <Typography sx={{fontSize:12,fontWeight:700,color:r.skipped?'text.secondary':r.pnl>=0?'#1D9E75':'#EF4444'}}>
                {r.skipped?'Skipped':`${r.pnl>=0?'+':''}€${r.pnl.toFixed(0)}`}
              </Typography>
            </Stack>
          ))}
          {earnResults.map((r,i)=>(
            <Stack key={i} direction="row" sx={{justifyContent:'space-between',alignItems:'center',py:.6,borderBottom:'1px solid #f0f0f0'}}>
              <Stack direction="row" sx={{gap:.5,alignItems:'center'}}>
                {r.correct?<IconCircleCheck size={12} strokeWidth={1.5} color="#1D9E75"/>:<IconCircleX size={12} strokeWidth={1.5} color="#EF4444"/>}
                <Typography sx={{fontSize:12,color:'text.secondary'}}>Earnings: {r.company}</Typography>
              </Stack>
              <Typography sx={{fontSize:12,fontWeight:700,color:r.tradePnl>=0?'#1D9E75':'#EF4444'}}>
                {r.tradePnl>=0?'+':''}€{r.tradePnl.toFixed(0)}
              </Typography>
            </Stack>
          ))}
        </Box>

        {/* Performance message */}
        <Box sx={{bgcolor:'var(--teal-50)',border:'1px solid var(--teal-100)',borderRadius:'10px',p:1.5,mb:2}}>
          <Typography sx={{fontSize:12.5,lineHeight:1.6,color:'var(--teal-600)'}}>{perfMsg()}</Typography>
        </Box>

        {/* Key insight */}
        <Box sx={{bgcolor:'#FFF8F0',border:'1px solid #FED7AA',borderRadius:'10px',p:1.5,mb:2.5}}>
          <Typography sx={{fontSize:11,fontWeight:700,color:'#C2460A',letterSpacing:'.6px',mb:.5}}>KEY INSIGHT</Typography>
          <Typography sx={{fontSize:12.5,lineHeight:1.6,color:'text.secondary'}}>
            Real stock traders analyze company financials, read earnings reports, and react to news every single day.
            What you just experienced in minutes happens across millions of trades per second in real markets.
          </Typography>
        </Box>

        <Stack sx={{gap:1}}>
          {!isCompleted?(
            <Button variant="contained" fullWidth onClick={onComplete}
              sx={{bgcolor:LEVEL_COLOR,borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25,'&:hover':{bgcolor:'#246d8a'}}}>
              I'm a stock market tycoon! +{xpAmt} XP
            </Button>
          ):(
            <Typography sx={{textAlign:'center',fontSize:13,color:LEVEL_COLOR,fontWeight:600,py:.5}}>+20 XP already earned</Typography>
          )}
          <Button variant="outlined" fullWidth onClick={resetGame}
            sx={{borderRadius:'10px',textTransform:'none',fontWeight:700,fontSize:14,py:1.25}}>
            Play Again
          </Button>
        </Stack>
      </Box>
    )
  }

  return null
}
