import type { Level, MarketAsset, LeaderboardEntry, Platform } from '../types'

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Bonds',
    subtitle: 'Fixed Income Basics',
    icon: '🏛️',
    desc: 'How bonds work, yield, duration & risk',
    unlocks: 'bonds in Simulator',
    lesson: {
      title: 'What is a Bond?',
      content: [
        { type: 'text', value: 'A **bond** is essentially a loan you give to a government or company. In return, they promise to pay you periodic interest (called the **coupon**) and return your principal at **maturity**.' },
        { type: 'text', value: 'Bonds are generally considered **lower risk** than stocks because the income is predictable and contractually obligated. They\'re a cornerstone of diversified portfolios.' },
        { type: 'callout', label: 'Key Terms', items: [
          '**Yield** — Annual return as a % of the bond\'s price',
          '**Duration** — Sensitivity to interest rate changes',
          '**Credit Rating** — Issuer\'s likelihood of repaying (AAA = safest)',
          '**Maturity** — Date the principal is repaid',
        ]},
        { type: 'text', value: '⚠️ **Important**: When interest rates rise, bond prices fall — and vice versa. This inverse relationship is the most critical concept in fixed income.' },
      ],
      quiz: {
        question: 'When the European Central Bank raises interest rates, what happens to existing bond prices?',
        options: ['Bond prices rise', 'Bond prices fall', 'Bond prices stay the same', 'Only new bonds are affected'],
        correct: 1,
        explanation: 'Bond prices and interest rates move in opposite directions. When new bonds offer higher rates, existing bonds become less attractive, so their prices drop.',
      },
    },
  },
  {
    id: 2,
    name: 'Stocks',
    subtitle: 'Equity Markets',
    icon: '📈',
    desc: 'Shares, dividends, P/E ratios & market cap',
    unlocks: 'stocks in Simulator',
    lesson: {
      title: 'What is a Stock?',
      content: [
        { type: 'text', value: 'A **stock** (or share) represents partial ownership of a company. When you buy a stock, you become a **shareholder** — you own a tiny piece of the business and its future profits.' },
        { type: 'text', value: 'Companies issue stocks to raise capital. Investors buy them hoping the company\'s value grows, which makes the stock price rise. Some stocks also pay **dividends** — periodic cash from profits.' },
        { type: 'callout', label: 'Key Metrics', items: [
          '**P/E Ratio** — Price ÷ Earnings per share. Higher = market expects growth',
          '**Market Cap** — Total company value = price × total shares outstanding',
          '**Dividend Yield** — Annual dividend ÷ stock price',
          '**EPS** — Earnings Per Share: net profit divided by shares',
        ]},
        { type: 'text', value: 'Stocks are **higher risk** than bonds but historically offer higher long-term returns. The key is diversification — never put all your money in one company.' },
      ],
      quiz: {
        question: "A stock is priced at €60. Its annual earnings per share is €4. What is the P/E ratio?",
        options: ['4', '10', '15', '24'],
        correct: 2,
        explanation: 'P/E = Price ÷ EPS = 60 ÷ 4 = 15. This means investors pay €15 for every €1 of annual earnings — a reasonable valuation for a stable company.',
      },
    },
  },
  {
    id: 3,
    name: 'Crypto',
    subtitle: 'Digital Assets',
    icon: '₿',
    desc: 'Blockchain, volatility & the crypto market',
    unlocks: 'crypto in Simulator',
    lesson: {
      title: 'What is Cryptocurrency?',
      content: [
        { type: 'text', value: '**Cryptocurrencies** are digital currencies secured by cryptography and running on **blockchain** networks — decentralized ledgers that record every transaction.' },
        { type: 'text', value: 'Unlike stocks, crypto doesn\'t represent ownership of a company, and unlike bonds, there\'s no guaranteed return. Value comes from utility, scarcity, and market demand.' },
        { type: 'callout', label: 'Key Concepts', items: [
          '**Bitcoin (BTC)** — The first and largest crypto by market cap',
          '**Ethereum (ETH)** — Platform for smart contracts and DeFi',
          '**Volatility** — Crypto can swing 10-20% in a single day',
          '**Wallet** — Software that stores your crypto keys',
        ]},
        { type: 'text', value: '⚠️ Crypto is **high risk**. It\'s worth learning about, but should be a small portion of a diversified portfolio — especially for beginners.' },
      ],
      quiz: {
        question: 'What gives Bitcoin its scarcity and store-of-value properties?',
        options: ['It is backed by gold reserves', 'There is a fixed maximum supply of 21 million BTC', 'Governments control its supply', 'Mining companies set the limit each year'],
        correct: 1,
        explanation: 'Bitcoin\'s supply is hard-capped at 21 million coins by its code. This fixed supply — combined with growing demand — is the core argument for its store-of-value properties.',
      },
    },
  },
  { id: 4, name: 'Forex',        subtitle: 'Currency Markets',     icon: '💱', desc: 'Exchange rates, pairs & macro drivers',          unlocks: 'FX pairs in Simulator',    lesson: null },
  { id: 5, name: 'Commodities',  subtitle: 'Real Assets',          icon: '🛢️', desc: 'Gold, oil, agriculture & futures',               unlocks: 'commodities in Simulator', lesson: null },
  { id: 6, name: 'ETFs',         subtitle: 'Passive Funds',        icon: '📊', desc: 'Index funds, expense ratios & passive investing',  unlocks: 'ETFs in Simulator',         lesson: null },
  { id: 7, name: 'Mutual Funds', subtitle: 'Managed Portfolios',   icon: '🏦', desc: 'Active management, NAV & fund selection',         unlocks: 'mutual funds in Simulator', lesson: null },
  { id: 8, name: 'Topicality',   subtitle: 'AI Live News',         icon: '✦',  desc: 'Real market events turned into adaptive lessons',  unlocks: 'full market access',        lesson: null, isAI: true },
]

export const MARKET_ASSETS: MarketAsset[] = [
  { id: 'eurgb',  name: 'EUR Gov Bond 2027', ticker: 'EURGB',  icon: '🏛️', price: 102.40, change: 0.4,   category: 'bond',      requiredLevel: 1 },
  { id: 'fr10y',  name: 'France 10Y Bond',   ticker: 'OAT10',  icon: '🇫🇷', price: 98.70,  change: -0.2,  category: 'bond',      requiredLevel: 1 },
  { id: 'aapl',   name: 'Apple Inc.',        ticker: 'AAPL',   icon: '🍎', price: 215.40, change: 2.3,   category: 'stock',     requiredLevel: 2 },
  { id: 'nvda',   name: 'NVIDIA Corp.',      ticker: 'NVDA',   icon: '🟢', price: 847.20, change: 3.8,   category: 'stock',     requiredLevel: 2 },
  { id: 'mc',     name: 'LVMH',              ticker: 'MC',     icon: '💎', price: 694.50, change: -1.1,  category: 'stock',     requiredLevel: 2 },
  { id: 'btc',    name: 'Bitcoin',           ticker: 'BTC',    icon: '₿',  price: 61200,  change: -1.4,  category: 'crypto',    requiredLevel: 3 },
  { id: 'eth',    name: 'Ethereum',          ticker: 'ETH',    icon: '⬡',  price: 3240,   change: 2.1,   category: 'crypto',    requiredLevel: 3 },
  { id: 'eurusd', name: 'EUR/USD',           ticker: 'EURUSD', icon: '💱', price: 1.0842, change: 0.15,  category: 'forex',     requiredLevel: 4 },
  { id: 'gold',   name: 'Gold',              ticker: 'XAU',    icon: '🥇', price: 2340,   change: 0.8,   category: 'commodity', requiredLevel: 5 },
  { id: 'msci',   name: 'MSCI World ETF',    ticker: 'IWDA',   icon: '🌍', price: 87.30,  change: 1.2,   category: 'etf',       requiredLevel: 6 },
  { id: 'sp500',  name: 'S&P 500 ETF',       ticker: 'VOO',    icon: '🇺🇸', price: 475.20, change: 0.9,   category: 'etf',       requiredLevel: 6 },
]

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sophie M.',  school: 'Sciences Po',    value: 1847, me: false },
  { rank: 2, name: 'Khalid A.',  school: 'HEC Paris',      value: 1731, me: false },
  { rank: 3, name: 'Lucie B.',   school: 'Paris Dauphine', value: 1689, me: false },
  { rank: 4, name: 'YOU',        school: 'My School',      value: 1143, me: true  },
  { rank: 5, name: 'Marco R.',   school: 'ESSEC',          value: 1089, me: false },
  { rank: 6, name: 'Amina T.',   school: 'Sorbonne',       value: 1012, me: false },
  { rank: 7, name: 'Léa V.',     school: 'Paris Saclay',   value:  987, me: false },
]

export const PLATFORMS: Platform[] = [
  {
    id: 'revolut',
    name: 'Revolut',
    color: '#0666EB',
    min: '€1',
    time: '5 min',
    assets: ['Stocks', 'Crypto', 'ETFs'],
    perk: 'No commission on 3 trades/month',
    beginner: true,
    rating: 4.5,
  },
  {
    id: 'etoro',
    name: 'eToro',
    color: '#00C853',
    min: '€50',
    time: '10 min',
    assets: ['Stocks', 'ETFs', 'Crypto', 'FX', 'Commodities'],
    perk: 'Free demo account · Copy trading',
    beginner: true,
    rating: 4.3,
  },
  {
    id: 'bnp',
    name: 'BNP Paribas',
    color: '#00965E',
    min: '€100',
    time: '2–3 days',
    assets: ['Stocks', 'Bonds', 'Mutual Funds', 'ETFs'],
    perk: 'Regulated French bank · Phone support',
    beginner: false,
    rating: 3.9,
  },
  {
    id: 'trade-republic',
    name: 'Trade Republic',
    color: '#FFFFFF',
    min: '€10',
    time: '5 min',
    assets: ['Stocks', 'ETFs', 'Crypto', 'Derivatives'],
    perk: '€1 flat fee per trade · 4% on cash',
    beginner: true,
    rating: 4.6,
  },
]
