import type { Level, MarketAsset, LeaderboardEntry, Platform } from '../types'
import PiggyBankLoop from '../assets/animations/Piggy_bank_loop.json'
import DrawkitCharts from '../assets/animations/drawkit_charts_and_graphs.json'
import BlockchainCurrency from '../assets/animations/blockchain_currency.json'
import CurrencyExchange from '../assets/animations/Currency_Exchange.json'
import Gold from '../assets/animations/gold.json'
import Charts from '../assets/animations/charts.json'
import Money from '../assets/animations/Money.json'
import ArtificialIntelligence from '../assets/animations/artificial_intelligence.json'

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Bonds',
    subtitle: 'Fixed Income Basics',
    icon: '🏛️',
    desc: 'How bonds work, yield, duration & risk',
    unlocks: 'bonds in Simulator',
    animation: PiggyBankLoop,
    glossary: [
      { term: 'Bond',          definition: 'A loan made to a government or company in exchange for periodic interest payments and return of principal at maturity.' },
      { term: 'Coupon',        definition: 'The periodic interest payment made to bondholders, expressed as a percentage of the bond\'s face value.' },
      { term: 'Yield',         definition: 'The annual return on a bond as a percentage of its current market price.' },
      { term: 'Maturity',      definition: 'The date on which the bond issuer repays the principal to the bondholder.' },
      { term: 'Duration',      definition: 'A measure of a bond\'s sensitivity to changes in interest rates — higher duration means more price volatility.' },
      { term: 'Credit Rating', definition: 'An assessment of the bond issuer\'s ability to repay — AAA is the safest, D indicates default.' },
      { term: 'Principal',     definition: 'The original amount of money invested in a bond, returned to the investor at maturity.' },
    ],
    subLessons: [
      {
        id: 'bonds-1',
        title: 'What Is a Bond?',
        content: [
          { type: 'text', value: 'A **bond** is a loan you give to a government or corporation. In return, they promise to pay you regular interest (called the **coupon**) and repay your original investment (the **principal**) on a set date known as the **maturity** date.' },
          { type: 'text', value: 'Governments issue bonds to fund public spending — roads, schools, hospitals. Companies issue them to raise capital for expansion. When you buy a bond, you become a creditor, not an owner.' },
          { type: 'callout', label: 'Types of Bond Issuers', items: [
            '**Government bonds** — issued by national governments (e.g. French OATs, US Treasuries). Very low default risk',
            '**Corporate bonds** — issued by companies. Higher yield but higher risk than government bonds',
            '**Municipal bonds** — issued by cities or regions for local infrastructure projects',
          ]},
          { type: 'important', value: 'Unlike stocks, bondholders are legal creditors. Companies must pay coupons before paying any dividends to shareholders — making bonds a legally senior claim on the company\'s cash.' },
        ],
      },
      {
        id: 'bonds-2',
        title: 'Bond Yields & Pricing',
        content: [
          { type: 'text', value: 'The **yield** of a bond is its annual return expressed as a percentage of its current price. When you buy a bond at its face value of €1,000 with a €40 annual coupon, your yield is 4%. But bond prices change constantly in the market — and that changes the yield.' },
          { type: 'text', value: 'Here\'s the crucial relationship: **bond prices and yields move in opposite directions**. If a bond\'s price rises from €1,000 to €1,100, the same €40 coupon is now only a 3.6% yield. The coupon is fixed — but the yield floats with the price.' },
          { type: 'callout', label: 'The Inverse Relationship', items: [
            '📈 **Interest rates rise** → new bonds offer higher coupons → old bonds less attractive → old bond prices fall → yields rise',
            '📉 **Interest rates fall** → new bonds offer lower coupons → old bonds more attractive → old bond prices rise → yields fall',
          ]},
          { type: 'important', value: 'When the European Central Bank raises rates, existing bond prices fall immediately. This is the most important concept in fixed income — and the reason bond portfolios lose value during rate-hike cycles.' },
        ],
      },
      {
        id: 'bonds-3',
        title: 'Credit Risk & Duration',
        content: [
          { type: 'text', value: 'Not all bonds are equally safe. **Credit ratings** assess the likelihood that an issuer will repay. Rating agencies like Moody\'s, S&P, and Fitch assign grades from AAA (ultra-safe) down to D (in default). Bonds rated BB or below are called "high yield" or junk bonds — they pay more because they\'re riskier.' },
          { type: 'text', value: '**Duration** measures how sensitive a bond\'s price is to interest rate changes. A bond with a duration of 10 years will lose approximately 10% of its value if rates rise by 1%. Longer-dated bonds have higher duration — and higher interest rate risk.' },
          { type: 'callout', label: 'Credit Rating Scale', items: [
            '**AAA / AA** — Investment grade, very low risk (e.g. Germany, US Treasury)',
            '**A / BBB** — Investment grade, moderate risk (e.g. France, major corporations)',
            '**BB and below** — High yield ("junk"), significant default risk',
            '**D** — Currently in default — issuer has missed payments',
          ]},
          { type: 'important', value: 'Higher yield always signals higher risk. A bond yielding 10% isn\'t a free lunch — it means the market believes there\'s a real chance the issuer may not repay. Always check the credit rating before chasing yield.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'When the European Central Bank raises interest rates, what happens to existing bond prices?',
        options: ['Bond prices rise', 'Bond prices fall', 'Bond prices stay the same', 'Only new bonds are affected'],
        correct: 1,
        explanation: 'Bond prices and interest rates move in opposite directions. When new bonds offer higher rates, existing bonds become less attractive, so their prices drop.',
      },
      {
        question: "What does the 'coupon rate' on a bond represent?",
        options: ["The bond's maturity date", 'The annual interest rate paid to bondholders', "The credit rating of the bond issuer", "The bond's market price"],
        correct: 1,
        explanation: "The coupon rate is the fixed annual interest payment expressed as a percentage of the bond's face value — separate from what the bond currently trades for.",
      },
      {
        question: 'A bond has a face value of €1,000 and pays an annual coupon of €40. What is the coupon rate?',
        options: ['2.5%', '4%', '6%', '10%'],
        correct: 1,
        explanation: 'Coupon rate = Annual payment ÷ Face value = €40 ÷ €1,000 = 4%.',
      },
    ],
  },
  {
    id: 2,
    name: 'Stocks',
    subtitle: 'Equity Markets',
    icon: '📈',
    desc: 'Shares, dividends, P/E ratios & market cap',
    unlocks: 'stocks in Simulator',
    animation: DrawkitCharts,
    glossary: [
      { term: 'Stock',       definition: 'A share representing partial ownership of a company and its future earnings.' },
      { term: 'Dividend',    definition: 'A portion of company profits distributed to shareholders, typically paid quarterly.' },
      { term: 'P/E Ratio',   definition: 'Price divided by annual earnings per share — a measure of how expensive a stock is relative to its earnings.' },
      { term: 'Market Cap',  definition: 'The total market value of a company, calculated as share price × total shares outstanding.' },
      { term: 'EPS',         definition: 'Earnings Per Share — a company\'s net profit divided by its number of outstanding shares.' },
      { term: 'Bull Market', definition: 'A sustained period of rising stock prices, typically defined as a 20%+ gain from recent lows.' },
      { term: 'Bear Market', definition: 'A sustained period of declining stock prices, typically defined as a 20%+ drop from recent highs.' },
      { term: 'Shareholder', definition: 'A person or entity that owns shares in a company, entitling them to a portion of its profits and assets.' },
    ],
    subLessons: [
      {
        id: 'stocks-1',
        title: 'What Is a Stock?',
        content: [
          { type: 'text', value: 'A **stock** (also called a share or equity) represents partial ownership of a company. When you buy one Apple share, you own a tiny fraction of Apple — its products, patents, factories, and future profits.' },
          { type: 'text', value: 'Companies issue stocks to raise capital. Instead of borrowing (like with bonds), they sell ownership stakes. The first time a company sells shares publicly is called an **IPO** (Initial Public Offering). After that, shares trade freely on stock exchanges like Euronext Paris or the New York Stock Exchange.' },
          { type: 'callout', label: 'Stock vs Bond', items: [
            '**Stock** → you own a piece of the company. Returns are variable and unlimited',
            '**Bond** → you lend money to the company. Returns are fixed and legally obligated',
            'Stocks are higher risk but historically deliver higher long-term returns',
          ]},
          { type: 'important', value: 'Stocks do not guarantee any return. If the company performs poorly, your shares lose value. If it goes bankrupt, shareholders are last in line — after creditors and bondholders. Higher reward comes with higher risk.' },
        ],
      },
      {
        id: 'stocks-2',
        title: 'Valuing a Stock',
        content: [
          { type: 'text', value: 'How do you know if a stock is cheap or expensive? The most common measure is the **P/E Ratio** (Price-to-Earnings). It divides the stock price by the company\'s annual **EPS** (Earnings Per Share).' },
          { type: 'text', value: 'A P/E of 20 means investors are paying €20 for every €1 of annual profit. A very high P/E (like 50+) means the market expects strong future growth. A low P/E might mean the company is undervalued — or struggling.' },
          { type: 'callout', label: 'Key Valuation Metrics', items: [
            '**P/E Ratio** = Share price ÷ EPS. Higher = market expects more growth',
            '**Market Cap** = Share price × Total shares outstanding. Measures company size',
            '**EPS** = Net profit ÷ Shares outstanding. More EPS = more profitable per share',
            '**Dividend Yield** = Annual dividend ÷ Share price. Income return on the stock',
          ]},
          { type: 'important', value: 'No single metric tells the whole story. A low P/E stock might be cheap for good reason (declining business). Always combine multiple indicators and compare to sector peers before drawing conclusions.' },
        ],
      },
      {
        id: 'stocks-3',
        title: 'Dividends & Market Cycles',
        content: [
          { type: 'text', value: 'Some companies distribute a portion of their profits to shareholders as **dividends** — typically paid quarterly. A stock paying €2/year with a price of €40 has a **dividend yield** of 5%. Dividends provide income even when stock prices aren\'t rising.' },
          { type: 'text', value: 'Stock markets move in cycles. A **bull market** is a sustained rise of 20%+ from recent lows, fuelled by economic growth and investor optimism. A **bear market** is a 20%+ decline, often driven by recession fears, rising rates, or crises.' },
          { type: 'callout', label: 'Market Cycle Phases', items: [
            '**Recovery** — Prices bottoming, pessimism still high, early buyers enter',
            '**Expansion** — Economy growing, earnings rising, markets climbing',
            '**Peak** — Optimism at max, valuations stretched, growth slowing',
            '**Contraction** — Sentiment turns, selling accelerates, bear market begins',
          ]},
          { type: 'important', value: 'The biggest investing mistake is panic-selling during bear markets. History shows that every bear market has eventually been followed by a new bull market. Long-term investors who stay invested through downturns capture the recovery.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'A stock is priced at €60. Its annual earnings per share is €4. What is the P/E ratio?',
        options: ['4', '10', '15', '24'],
        correct: 2,
        explanation: 'P/E = Price ÷ EPS = 60 ÷ 4 = 15. This means investors pay €15 for every €1 of annual earnings — a reasonable valuation for a stable company.',
      },
      {
        question: 'What does a dividend represent?',
        options: ['A loan to the company', 'A share of company profits paid to investors', "The stock's annual price change", "The company's total market value"],
        correct: 1,
        explanation: "Dividends are periodic cash payments from a company's profits to its shareholders — a way to earn income even if the stock price doesn't move.",
      },
      {
        question: "What does 'market cap' mean?",
        options: ['The maximum price a stock can reach', 'The total value of all shares outstanding', "The company's annual revenue", 'The number of shares available to buy'],
        correct: 1,
        explanation: 'Market cap = share price × total shares outstanding. It represents the total market value of a company.',
      },
    ],
  },
  {
    id: 3,
    name: 'Crypto',
    subtitle: 'Digital Assets',
    icon: '₿',
    desc: 'Blockchain, volatility & the crypto market',
    unlocks: 'crypto in Simulator',
    animation: BlockchainCurrency,
    glossary: [
      { term: 'Blockchain',  definition: 'A decentralized digital ledger that records all transactions across a network of computers, making them transparent and tamper-resistant.' },
      { term: 'Bitcoin',     definition: 'The first and largest cryptocurrency by market cap, with a fixed supply of 21 million coins.' },
      { term: 'Wallet',      definition: 'Software that stores your cryptocurrency private keys, allowing you to send and receive digital assets.' },
      { term: 'Volatility',  definition: 'The degree of price fluctuation in an asset — crypto is known for extreme volatility, often swinging 10–20% in a single day.' },
      { term: 'DeFi',        definition: 'Decentralized Finance — financial services such as lending and trading built on blockchain networks without traditional intermediaries.' },
      { term: 'Mining',      definition: 'The process of validating transactions on a blockchain by solving complex mathematical problems, earning new coins as a reward.' },
      { term: 'Altcoin',     definition: 'Any cryptocurrency other than Bitcoin — includes Ethereum, Solana, and thousands of others.' },
    ],
    subLessons: [
      {
        id: 'crypto-1',
        title: 'What Is Cryptocurrency?',
        content: [
          { type: 'text', value: '**Cryptocurrencies** are digital currencies that exist only online. Unlike euros or dollars, no government issues or controls them. They run on **blockchain** networks — decentralized systems where thousands of computers worldwide verify and record every transaction simultaneously.' },
          { type: 'text', value: '**Bitcoin** was the first cryptocurrency, created in 2009 by a pseudonymous developer called Satoshi Nakamoto. It was designed to be a peer-to-peer digital cash system that no single entity could control, inflate, or censor.' },
          { type: 'callout', label: 'Key Properties of Crypto', items: [
            '**Decentralized** — no central bank or government controls it',
            '**Transparent** — all transactions are visible on the public blockchain',
            '**Borderless** — send to anyone in the world in minutes',
            '**Scarce** — Bitcoin has a hard cap of 21 million coins, ever',
          ]},
          { type: 'important', value: 'Crypto is not backed by any government, physical asset, or legal obligation. Its value comes entirely from supply, demand, utility, and market confidence. It can go to zero — or 10x. Understand this before investing.' },
        ],
      },
      {
        id: 'crypto-2',
        title: 'How Crypto Works',
        content: [
          { type: 'text', value: 'A **blockchain** is a chain of data "blocks," each containing a batch of verified transactions. Once a block is added, it\'s permanently recorded and nearly impossible to alter — because changing it would require redoing all subsequent blocks across thousands of computers at once.' },
          { type: 'text', value: '**Mining** is the process of adding new blocks to the Bitcoin blockchain. Miners compete to solve complex mathematical puzzles. The winner adds the next block and earns newly created Bitcoin as a reward. This is how new Bitcoin enters circulation — and why it uses so much energy.' },
          { type: 'callout', label: 'Your Crypto Wallet', items: [
            '**Private key** — Your secret password. Whoever has this controls your crypto. Never share it',
            '**Public key** — Your "address." Share this to receive payments, like an email address',
            '**Hot wallet** — Connected to internet (convenient but hackable)',
            '**Cold wallet** — Offline hardware device (secure for large holdings)',
          ]},
          { type: 'important', value: '"Not your keys, not your coins." If your crypto is on an exchange and the exchange is hacked or goes bankrupt, you could lose everything. For significant holdings, always use a personal wallet where you control the private key.' },
        ],
      },
      {
        id: 'crypto-3',
        title: 'Crypto Risk & Opportunity',
        content: [
          { type: 'text', value: 'Crypto is famous for extreme **volatility**. Bitcoin dropped 80% in 2018, 65% in 2022. Altcoins can fall 95%+ in a bear market. This volatility cuts both ways — Bitcoin also rose 10,000%+ over the 2010s. High risk, high potential reward.' },
          { type: 'text', value: 'Beyond Bitcoin, **Ethereum** is the largest altcoin — a programmable blockchain that powers **DeFi** (Decentralized Finance) apps, NFTs, and smart contracts. DeFi lets users lend, borrow, and trade without banks, using code-based "smart contracts" that execute automatically.' },
          { type: 'callout', label: 'Managing Crypto Risk', items: [
            'Never invest more than you can afford to lose completely',
            'Keep crypto to a small percentage of your total portfolio (typically 5–10%)',
            'Dollar-cost average — invest fixed amounts regularly to smooth out volatility',
            'Avoid obscure altcoins with no clear use case or transparent team',
          ]},
          { type: 'important', value: 'Crypto is worth learning about because blockchain technology is genuinely innovative. But approach it as a high-risk, speculative asset — not a savings account or guaranteed investment.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'What gives Bitcoin its scarcity and store-of-value properties?',
        options: ['It is backed by gold reserves', 'There is a fixed maximum supply of 21 million BTC', 'Governments control its supply', 'Mining companies set the limit each year'],
        correct: 1,
        explanation: "Bitcoin's supply is hard-capped at 21 million coins by its code. This fixed supply — combined with growing demand — is the core argument for its store-of-value properties.",
      },
      {
        question: 'What is a blockchain?',
        options: ['A type of cryptocurrency', 'A decentralized ledger that records all transactions', 'A digital wallet for storing crypto', 'A government-regulated exchange'],
        correct: 1,
        explanation: 'A blockchain is a distributed, decentralized ledger that records every transaction across a network of computers — making it transparent and tamper-resistant.',
      },
      {
        question: 'Which statement about Ethereum is correct?',
        options: ['It has a fixed supply like Bitcoin', 'It is primarily used for smart contracts and DeFi', 'It was created before Bitcoin', 'It is backed by the US government'],
        correct: 1,
        explanation: 'Ethereum is a programmable blockchain platform that enables smart contracts and decentralized applications (DeFi, NFTs, etc.) — fundamentally different from Bitcoin.',
      },
    ],
  },
  {
    id: 4,
    name: 'Forex',
    subtitle: 'Currency Markets',
    icon: '💱',
    desc: 'Exchange rates, pairs & macro drivers',
    unlocks: 'FX pairs in Simulator',
    animation: CurrencyExchange,
    glossary: [
      { term: 'Exchange Rate',   definition: 'The price of one currency expressed in terms of another — e.g. EUR/USD = 1.08 means 1 euro buys 1.08 US dollars.' },
      { term: 'Currency Pair',   definition: 'The quotation of two currencies — the base currency and the quote currency. EUR/USD is the most traded pair in the world.' },
      { term: 'Pip',             definition: 'Percentage in point — the smallest standard price movement in forex, typically 0.0001 for most currency pairs.' },
      { term: 'Spread',          definition: 'The difference between the buy (ask) and sell (bid) price of a currency pair — the broker\'s built-in fee.' },
      { term: 'Leverage',        definition: 'Borrowing to amplify the size of a trade. 10:1 leverage means €1,000 controls €10,000. Magnifies both gains and losses.' },
      { term: 'Base Currency',   definition: 'The first currency in a pair (e.g. EUR in EUR/USD). The exchange rate shows how much of the quote currency one unit of the base is worth.' },
      { term: 'Quote Currency',  definition: 'The second currency in a pair (e.g. USD in EUR/USD). Shows the price of the base currency.' },
    ],
    subLessons: [
      {
        id: 'forex-1',
        title: 'Currency Pairs Explained',
        content: [
          { type: 'text', value: 'The **forex market** (foreign exchange) is the largest financial market in the world, with over $7.5 trillion traded every single day — dwarfing stocks, bonds, and crypto combined. It operates 24 hours a day, 5 days a week, across global banking centres.' },
          { type: 'text', value: 'Currencies are always traded in **pairs**. EUR/USD = 1.08 means that 1 euro (the **base currency**) buys 1.08 US dollars (the **quote currency**). If EUR/USD rises to 1.12, the euro has strengthened against the dollar.' },
          { type: 'callout', label: 'Types of Currency Pairs', items: [
            '**Major pairs** — EUR/USD, GBP/USD, USD/JPY. Highest volume, lowest spreads',
            '**Minor pairs** — EUR/GBP, AUD/NZD. Less liquid than majors but still traded widely',
            '**Exotic pairs** — USD/TRY (Turkish lira), EUR/ZAR (South African rand). Higher spreads, higher risk',
          ]},
          { type: 'important', value: 'When you travel abroad and exchange euros for dollars, you are participating in the forex market. Every international transaction — trade, tourism, investment — moves through FX.' },
        ],
      },
      {
        id: 'forex-2',
        title: 'What Moves Exchange Rates?',
        content: [
          { type: 'text', value: 'Exchange rates are driven by the relative economic health and monetary policy of two countries. The most powerful driver is **interest rate differentials** — when a country raises rates, its currency attracts more capital, increasing demand and pushing the currency higher.' },
          { type: 'text', value: 'Other major drivers include **inflation** (higher inflation erodes purchasing power, weakening a currency), **GDP growth** (strong growth attracts investment), and **political stability** (uncertainty causes capital flight and currency weakness).' },
          { type: 'callout', label: 'Key Exchange Rate Drivers', items: [
            '**Central bank policy** — Rate hikes strengthen a currency; cuts weaken it',
            '**Inflation differentials** — Lower inflation = stronger currency over time',
            '**Trade balance** — Export-heavy countries see demand for their currency',
            '**Risk sentiment** — In crises, money flows to "safe havens" (USD, JPY, CHF)',
          ]},
          { type: 'important', value: 'Central bank decisions are the single biggest mover of currency prices. When the ECB or US Federal Reserve makes an unexpected rate decision, EUR/USD can move 1–2% in seconds — equivalent to weeks of normal price movement.' },
        ],
      },
      {
        id: 'forex-3',
        title: 'Forex Risk Management',
        content: [
          { type: 'text', value: 'In forex trading, the **spread** is the difference between the buy and sell price — this is how brokers earn money. For EUR/USD, a typical spread is 0.5–2 pips. Exotic pairs have much wider spreads, meaning higher costs per trade.' },
          { type: 'text', value: '**Leverage** is what makes forex both powerful and dangerous. A broker offering 30:1 leverage means €1,000 controls a €30,000 position. A 1% move in your favour doubles your money. A 1% move against you wipes out €300 — 30% of your capital.' },
          { type: 'callout', label: 'Risk Management Tools', items: [
            '**Stop-loss** — Automatically closes your trade if the loss reaches a set level',
            '**Take-profit** — Closes the trade when a profit target is hit',
            '**Position sizing** — Never risk more than 1–2% of your account on a single trade',
            '**Demo account** — Practice with virtual money before risking real capital',
          ]},
          { type: 'important', value: 'Retail forex traders lose money at alarming rates — studies show 70–80% of retail accounts are unprofitable. Leverage amplifies losses as much as gains. Only trade forex with money you can afford to lose, and always use stop-losses.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'If EUR/USD = 1.08, what does this mean?',
        options: ['1 USD buys 1.08 euros', '1 euro buys 1.08 US dollars', '1.08% is the interest rate difference', 'The euro is 8% stronger than the dollar'],
        correct: 1,
        explanation: 'In EUR/USD, EUR is the base currency and USD is the quote currency. EUR/USD = 1.08 means 1 euro buys 1.08 US dollars.',
      },
      {
        question: 'What is a "pip" in forex trading?',
        options: ['A type of currency pair', 'The smallest standard price movement (0.0001)', 'A trading platform fee', 'A commission charged by brokers'],
        correct: 1,
        explanation: 'A pip (percentage in point) is the smallest standardized unit of price movement in forex. For most pairs it equals 0.0001. A move from 1.0800 to 1.0801 is 1 pip.',
      },
      {
        question: 'Which factor most directly drives exchange rates?',
        options: ['Stock market performance', 'Interest rate differentials between countries', 'Corporate earnings reports', 'Commodity supply levels'],
        correct: 1,
        explanation: 'Interest rate differentials are the primary driver of exchange rates. A country offering higher rates attracts more capital inflows, increasing demand for its currency and pushing its value higher.',
      },
    ],
  },
  {
    id: 5,
    name: 'Commodities',
    subtitle: 'Real Assets',
    icon: '🛢️',
    desc: 'Gold, oil, agriculture & futures',
    unlocks: 'commodities in Simulator',
    animation: Gold,
    glossary: [
      { term: 'Commodity',   definition: 'A raw material or primary agricultural product that can be bought and sold — oil, gold, wheat, copper.' },
      { term: 'Futures',     definition: 'A contract to buy or sell a commodity at a set price on a future date — used by both producers and speculators.' },
      { term: 'Spot Price',  definition: 'The current market price at which a commodity can be bought or sold for immediate delivery.' },
      { term: 'Contango',    definition: 'A situation where futures prices are higher than the spot price, typically because of storage costs and time value.' },
      { term: 'Gold',        definition: 'A precious metal used as a store of value and safe-haven asset — often rises during economic uncertainty or inflation.' },
      { term: 'Hedge',       definition: 'An investment made to reduce the risk of adverse price movements in an asset you already own.' },
    ],
    subLessons: [
      {
        id: 'commodities-1',
        title: 'Types of Commodities',
        content: [
          { type: 'text', value: '**Commodities** are physical goods that are largely interchangeable regardless of who produces them. A barrel of Brent crude from Norway is equivalent to one from the UK — they trade at the same price. This "fungibility" allows commodities to be traded on global exchanges.' },
          { type: 'text', value: 'Commodities split into two broad categories. **Hard commodities** are natural resources extracted through mining or drilling — gold, oil, copper, natural gas. **Soft commodities** are agricultural products grown or farmed — wheat, corn, coffee, soybeans, sugar.' },
          { type: 'callout', label: 'Major Commodity Categories', items: [
            '**Energy** — Oil (Brent, WTI), natural gas, coal. Highly geopolitically sensitive',
            '**Metals** — Gold, silver (stores of value); copper, aluminium (industrial use)',
            '**Agriculture** — Wheat, corn, soybeans, coffee, sugar. Weather-sensitive',
            '**Livestock** — Cattle, hogs. Less traded by retail investors',
          ]},
          { type: 'important', value: 'Gold occupies a unique role as a "safe haven." When stock markets crash or inflation rises, investors historically flock to gold — which is why it often moves inversely to equities and holds value over very long periods.' },
        ],
      },
      {
        id: 'commodities-2',
        title: 'What Drives Commodity Prices?',
        content: [
          { type: 'text', value: 'Commodity prices are driven by fundamental **supply and demand**. When supply drops (drought reducing harvests, OPEC cutting oil production) and demand stays constant, prices rise. When supply surges or demand falls, prices collapse.' },
          { type: 'text', value: 'Geopolitics plays a huge role in energy markets. Wars or sanctions in oil-producing regions can spike crude prices within hours. For agriculture, a single weather report — drought in Brazil, flooding in the US corn belt — can move soft commodity prices by 5–10% in a day.' },
          { type: 'callout', label: 'Key Price Drivers', items: [
            '**Supply shocks** — OPEC cuts, mine strikes, sanctions, crop failures',
            '**Demand shifts** — China\'s industrial growth drives metals; cold winters boost gas',
            '**USD strength** — Most commodities priced in dollars, so a strong USD makes them pricier for foreign buyers and often pushes prices down',
            '**Inflation** — Commodities are real assets and often rise with inflation',
          ]},
          { type: 'important', value: 'Nearly all global commodities — oil, gold, copper, wheat — are priced in US dollars. This creates a direct link between the dollar\'s strength and commodity prices. When the dollar strengthens, commodity prices often fall, and vice versa.' },
        ],
      },
      {
        id: 'commodities-3',
        title: 'How to Invest in Commodities',
        content: [
          { type: 'text', value: 'The most direct way to own a commodity is buying the physical asset — but that\'s impractical for most investors (imagine storing barrels of oil). Instead, retail investors typically access commodities through **futures contracts**, **commodity ETFs**, or **mining stocks**.' },
          { type: 'text', value: 'A **futures contract** is an agreement to buy or sell a specific amount of a commodity at a set price on a future date. Futures let producers hedge against price falls and speculators bet on direction — but they\'re complex and can expire worthless.' },
          { type: 'callout', label: 'Commodity Investment Methods', items: [
            '**Physical gold** — Coins, bars. Safe but requires secure storage',
            '**Commodity ETFs** — Track gold, oil, or a basket of commodities. Easiest for retail investors',
            '**Futures contracts** — Highly leveraged, complex, for experienced traders only',
            '**Mining/energy stocks** — Invest in companies that produce commodities; adds equity risk',
          ]},
          { type: 'important', value: 'Commodity ETFs that use futures contracts roll positions forward as contracts expire — this "roll cost" in contango markets means ETFs can underperform the spot commodity price significantly over time. Gold ETFs backed by physical metal avoid this problem.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'Why are most commodities globally priced in US dollars?',
        options: ['The US produces the most commodities', 'The USD is the world\'s primary reserve currency', 'US law requires it', 'It is the most stable currency globally'],
        correct: 1,
        explanation: 'The US dollar is the world\'s primary reserve currency — most central banks hold USD reserves, and international trade (especially oil and metals) is denominated in USD. This creates a direct link between dollar strength and commodity prices.',
      },
      {
        question: 'What is a futures contract?',
        options: ['A guarantee to buy an asset at its future market price', 'An agreement to buy or sell an asset at a set price on a future date', 'A bond that matures in the future', 'A type of stock dividend paid in the future'],
        correct: 1,
        explanation: 'A futures contract is a legally binding agreement to buy or sell a specific commodity at a predetermined price at a specific future date. Used by producers to hedge risk and speculators to bet on price direction.',
      },
      {
        question: 'When oil supply falls and demand stays constant, what happens?',
        options: ['Oil price falls', 'Oil price stays the same', 'Oil price rises', 'OPEC automatically adjusts production'],
        correct: 2,
        explanation: 'Basic supply and demand: when supply decreases while demand is constant, prices rise. Oil is especially sensitive because there\'s no quick substitute and extraction takes years to scale up.',
      },
    ],
  },
  {
    id: 6,
    name: 'ETFs',
    subtitle: 'Passive Funds',
    icon: '📊',
    desc: 'Index funds, expense ratios & passive investing',
    unlocks: 'ETFs in Simulator',
    animation: Charts,
    glossary: [
      { term: 'ETF',              definition: 'Exchange-Traded Fund — a basket of assets (stocks, bonds, commodities) that trades on a stock exchange like a single share.' },
      { term: 'Index',            definition: 'A benchmark measuring a group of assets — the S&P 500 tracks the 500 largest US companies; the MSCI World tracks 1,500+ global firms.' },
      { term: 'Expense Ratio',    definition: 'The annual management fee of a fund, expressed as a percentage of assets under management (e.g. 0.2% per year).' },
      { term: 'Diversification',  definition: 'Spreading investment across many different assets to reduce the impact of any single investment performing poorly.' },
      { term: 'Passive Investing', definition: 'An investment strategy that tracks a market index rather than trying to outperform it — typically lower cost and often better long-term returns.' },
      { term: 'Tracking Error',   definition: 'The difference between an ETF\'s return and the return of the index it tracks — lower is better.' },
    ],
    subLessons: [
      {
        id: 'etfs-1',
        title: 'What Is an ETF?',
        content: [
          { type: 'text', value: 'An **ETF** (Exchange-Traded Fund) is a basket of assets — stocks, bonds, commodities — packaged into a single investment that trades on a stock exchange just like a share. When you buy one unit of the MSCI World ETF, you instantly own tiny slices of 1,500+ companies across 23 countries.' },
          { type: 'text', value: 'ETFs were invented in 1993 and have revolutionized investing for ordinary people. Before ETFs, building a diversified global portfolio required buying hundreds of individual securities and paying steep commissions on each. Now you can do it in one click for fractions of a percent per year.' },
          { type: 'callout', label: 'Types of ETFs', items: [
            '**Equity ETFs** — Track stock indices (S&P 500, MSCI World, Eurostoxx 50)',
            '**Bond ETFs** — Track government or corporate bond indices',
            '**Sector ETFs** — Focus on one sector: technology, healthcare, energy',
            '**Commodity ETFs** — Track gold, oil, or a basket of commodities',
          ]},
          { type: 'important', value: 'ETFs combine the diversification of a mutual fund with the liquidity of a stock. They can be bought and sold throughout the trading day at market price — unlike mutual funds which only price at end of day.' },
        ],
      },
      {
        id: 'etfs-2',
        title: 'Index Funds vs Active Funds',
        content: [
          { type: 'text', value: 'An **index** is a basket of securities representing a market — the S&P 500 is the 500 largest US companies, equally weighted by market cap. A **passive** fund simply replicates that index, buying the same stocks in the same proportions. No stock-picking, no guesswork.' },
          { type: 'text', value: '**Active management** means a fund manager handpicks stocks trying to beat the index. It sounds appealing — but research consistently shows that roughly 80–90% of active funds underperform their benchmark index over a 10-year period, especially after fees.' },
          { type: 'callout', label: 'Expense Ratio Matters', items: [
            'MSCI World passive ETF: **~0.20% per year**',
            'Active global equity fund: **~1.5% per year**',
            'On €10,000 over 20 years (7% annual return), that difference costs you **~€5,000 more** in fees with the active fund',
          ]},
          { type: 'important', value: 'The majority of professional active fund managers fail to beat simple index funds over the long run. Warren Buffett himself has publicly said most investors would be better off buying a low-cost S&P 500 index fund than picking stocks or paying active managers.' },
        ],
      },
      {
        id: 'etfs-3',
        title: 'Building a Portfolio with ETFs',
        content: [
          { type: 'text', value: 'One of the most effective investing strategies is **dollar-cost averaging** — investing a fixed amount at regular intervals (monthly) regardless of market conditions. This removes the temptation to time the market and automatically buys more shares when prices are low.' },
          { type: 'text', value: 'A simple "core-satellite" portfolio uses a broad global ETF as the core (80–90% of assets) providing wide diversification, then adds smaller "satellite" positions for specific exposures — a sector ETF, an emerging markets ETF, or a bond ETF for stability.' },
          { type: 'callout', label: 'Sample ETF Portfolio', items: [
            '**70%** — MSCI World ETF (1,500+ global companies)',
            '**10%** — Emerging Markets ETF (China, India, Brazil exposure)',
            '**10%** — European Government Bond ETF (stability)',
            '**10%** — Gold ETF (inflation hedge and safe haven)',
          ]},
          { type: 'important', value: 'Time in the market beats timing the market. An investor who bought a global ETF and never touched it for 30 years almost always outperforms someone who tried to trade around market cycles. Simplicity and consistency are the most powerful tools in investing.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'What does "expense ratio" mean for an ETF?',
        options: ["The ETF's annual return", 'The annual management fee as a % of your investment', 'The spread between buy and sell price', 'The tax rate on ETF gains'],
        correct: 1,
        explanation: "The expense ratio is the annual fee charged by the ETF provider to manage the fund, expressed as a percentage of your investment. A 0.2% expense ratio means you pay €2 per year for every €1,000 invested.",
      },
      {
        question: 'Which best describes "passive investing"?',
        options: ['Investing without any research', 'Tracking a market index without actively selecting stocks', 'Investing only in safe, low-return assets', 'Holding cash during market downturns'],
        correct: 1,
        explanation: 'Passive investing means tracking a market index (like the S&P 500 or MSCI World) rather than trying to beat it by selecting individual stocks. It typically has lower fees and often outperforms active management over long periods.',
      },
      {
        question: 'Why is diversification through an ETF valuable?',
        options: ['It guarantees positive returns every year', 'It spreads risk so one company\'s failure doesn\'t devastate your portfolio', 'It eliminates all investment risk', 'It allows you to earn dividends from every company'],
        correct: 1,
        explanation: 'Diversification means spreading your investment across many assets. One ETF tracking the MSCI World gives exposure to 1,500+ companies across 23 countries — so even if one company collapses, it barely affects your overall return.',
      },
    ],
  },
  {
    id: 7,
    name: 'Mutual Funds',
    subtitle: 'Managed Portfolios',
    icon: '🏦',
    desc: 'Active management, NAV & fund selection',
    unlocks: 'mutual funds in Simulator',
    animation: Money,
    glossary: [
      { term: 'Mutual Fund',    definition: 'A pooled investment vehicle where many investors contribute money and a professional manager invests it on their behalf.' },
      { term: 'NAV',            definition: 'Net Asset Value — the total value of a fund\'s assets minus liabilities, divided by the number of shares outstanding. Calculated once daily.' },
      { term: 'Fund Manager',   definition: 'A professional investment manager responsible for selecting securities and managing the fund\'s portfolio to achieve its stated objectives.' },
      { term: 'Expense Ratio',  definition: 'The annual cost of running a fund, expressed as a percentage of assets — includes management fees, administrative costs, and distribution fees.' },
      { term: 'Load Fund',      definition: 'A mutual fund that charges a sales commission when you buy (front-end load) or sell (back-end load) shares.' },
      { term: 'Alpha',          definition: 'A measure of a fund manager\'s ability to generate returns above the benchmark index — positive alpha means outperformance.' },
      { term: 'Benchmark',      definition: 'An index used to compare a fund\'s performance — a European equity fund might be benchmarked against the Eurostoxx 50.' },
    ],
    subLessons: [
      {
        id: 'mutual-funds-1',
        title: 'What Is a Mutual Fund?',
        content: [
          { type: 'text', value: 'A **mutual fund** is a pooled investment vehicle. Thousands of investors contribute money into a shared pot, and a professional **fund manager** invests it on their behalf — buying a diversified portfolio of stocks, bonds, or other assets according to the fund\'s stated strategy.' },
          { type: 'text', value: 'Unlike ETFs (which trade continuously on stock exchanges), mutual funds price once per day at their **NAV** (Net Asset Value). NAV is calculated as: (Total assets − Liabilities) ÷ Total shares outstanding. You buy and sell at the day\'s closing NAV.' },
          { type: 'callout', label: 'Types of Mutual Funds', items: [
            '**Equity funds** — Invest primarily in stocks; aim for capital growth',
            '**Bond funds** — Invest in government or corporate bonds; aim for income',
            '**Balanced funds** — Mix of stocks and bonds for moderate risk/reward',
            '**Money market funds** — Very short-term, low-risk investments; nearly cash-equivalent',
          ]},
          { type: 'important', value: 'Mutual funds are one of the most common investment vehicles globally — many pension funds and retirement accounts are invested in them. Understanding how they\'re priced and what fees they charge is essential to evaluating any fund.' },
        ],
      },
      {
        id: 'mutual-funds-2',
        title: 'Active Management',
        content: [
          { type: 'text', value: 'An **active fund manager** analyses companies, economic trends, and market signals to pick specific securities they believe will outperform. Their goal is to generate **alpha** — returns above the benchmark index. If the MSCI World returns 8% and the fund returns 10%, the manager generated 2% alpha.' },
          { type: 'text', value: 'Active management sounds compelling, but the data tells a humbling story. Multiple long-term studies (SPIVA, S&P) consistently show that 70–85% of actively managed funds underperform their benchmark over 10 years. After fees, it\'s even harder to beat the market consistently.' },
          { type: 'callout', label: 'Active vs Passive', items: [
            '**Active fund manager** — tries to beat the market, charges 1–2% per year',
            '**Passive ETF** — tracks the market, charges 0.1–0.3% per year',
            '**The math** — You need to outperform by more than the fee difference just to break even',
            '**Star manager risk** — Many "star" managers outperform briefly, then revert to average',
          ]},
          { type: 'important', value: 'Past performance does not predict future results — one of the most important rules in investing. A fund that beat its index for 5 years is not statistically more likely to beat it in year 6. Always evaluate the strategy and fees, not just historical returns.' },
        ],
      },
      {
        id: 'mutual-funds-3',
        title: 'Choosing a Mutual Fund',
        content: [
          { type: 'text', value: 'When selecting a mutual fund, look beyond raw performance numbers. Start with the **expense ratio** — the total annual cost of owning the fund. This includes management fees, administrative costs, and sometimes distribution fees. Small differences compound dramatically over decades.' },
          { type: 'text', value: 'Check whether the fund is a **load** or **no-load** fund. A front-end load means you pay a commission (2–5% of your investment) when buying. A back-end load charges when selling. No-load funds have no such commissions. Most modern funds sold directly through platforms are no-load.' },
          { type: 'callout', label: 'What to Check Before Investing', items: [
            '**Expense ratio** — Total annual cost. Aim for under 1% for active, under 0.3% for passive',
            '**Fund strategy** — Does the stated strategy match what you actually want?',
            '**Track record** — At least 5–10 years of performance vs benchmark',
            '**Fund size** — Very small funds may close; very large funds may struggle to be nimble',
          ]},
          { type: 'important', value: 'Always read the fund\'s Key Investor Information Document (KIID) — it\'s required by EU law and summarises the fund\'s objectives, risk level, past performance, and total costs in a standardised, comparable format. It\'s the one document that actually helps you compare funds fairly.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'What is NAV (Net Asset Value)?',
        options: ["A fund manager's annual bonus", "The total value of a fund's assets minus liabilities, divided by shares outstanding", "The fund's annual performance return", 'The minimum investment amount required'],
        correct: 1,
        explanation: 'NAV (Net Asset Value) is calculated daily as: (Total assets − Liabilities) ÷ Total shares. Unlike ETFs, mutual fund shares are always bought and sold at the closing NAV price — not at a real-time market price.',
      },
      {
        question: 'What does an active fund manager aim to do?',
        options: ['Charge the lowest possible fees', 'Select specific investments to outperform the benchmark index', 'Only invest in bonds', 'Hold more cash than other funds'],
        correct: 1,
        explanation: 'Active fund managers research and select specific investments aiming to outperform a benchmark index (generating "alpha"). However, studies show most active managers fail to beat their index after fees — which is why many investors prefer low-cost passive funds.',
      },
      {
        question: 'A "load fund" charges a fee when:',
        options: ['The fund performs well', 'You buy or sell shares in the fund (sales commission)', 'Dividends are paid out', 'The fund manager is replaced'],
        correct: 1,
        explanation: 'A load fund charges a sales commission when you buy (front-end load) or sell (back-end load) your shares. No-load funds do not charge these commissions — making no-load funds generally preferable for cost-conscious investors.',
      },
    ],
  },
  {
    id: 8,
    name: 'Topicality',
    subtitle: 'AI Live News',
    icon: '✦',
    desc: 'Real market events turned into adaptive lessons',
    unlocks: 'full market access',
    animation: ArtificialIntelligence,
    isAI: true,
    glossary: [
      { term: 'Sentiment Analysis',    definition: 'Using AI and natural language processing to measure whether news and social media express positive or negative views on an asset or market.' },
      { term: 'Algorithmic Trading',   definition: 'Using computer programs to execute trades automatically based on predefined rules or AI models — without human intervention.' },
      { term: 'Market Signal',         definition: 'An indicator — from price data, economic reports, or news — that suggests a potential trade or shift in market direction.' },
      { term: 'News Catalyst',         definition: 'A news event that triggers a significant price movement — earnings surprises, central bank decisions, or geopolitical shocks.' },
      { term: 'High-Frequency Trading', definition: 'Using powerful computers to execute thousands of trades per second, exploiting tiny price differences across markets.' },
      { term: 'Quantitative Analysis', definition: 'Using mathematical models and statistical methods to analyse markets and make investment decisions.' },
    ],
    subLessons: [
      {
        id: 'topicality-1',
        title: 'Markets & the News',
        content: [
          { type: 'text', value: 'Financial markets are constantly absorbing new information. Every economic data release, every central bank statement, every earnings report — all of it moves prices. Understanding how news becomes price action is one of the most valuable skills an investor can develop.' },
          { type: 'text', value: 'Markets are forward-looking — prices reflect not what is happening, but what investors expect to happen. This is why a company can report record profits and its stock still falls. If analysts expected even better results, the "good" news is actually disappointing relative to expectations.' },
          { type: 'callout', label: 'Types of Market-Moving News', items: [
            '**Central bank decisions** — Interest rate changes instantly move currencies, bonds, and stocks',
            '**Earnings reports** — Quarterly profits vs analyst estimates drive individual stocks ±10%',
            '**Economic data** — GDP, inflation (CPI), employment figures signal economic health',
            '**Geopolitics** — Wars, elections, sanctions can move entire sectors overnight',
          ]},
          { type: 'important', value: '"Buy the rumour, sell the news" is a market maxim for a reason. Prices often move in anticipation of an event, then reverse when the event actually happens. What matters is the gap between expectation and reality — not the news itself.' },
        ],
      },
      {
        id: 'topicality-2',
        title: 'AI & Algorithmic Trading',
        content: [
          { type: 'text', value: 'Modern financial markets are dominated by algorithms. **Algorithmic trading** uses computer programs to execute trades automatically based on predefined rules — when a certain price is reached, when a technical pattern appears, or when a news event is detected. About 70% of US equity trading volume is now algorithmic.' },
          { type: 'text', value: '**High-frequency trading (HFT)** takes this further — firms use servers co-located next to exchange computers to execute thousands of trades per second, exploiting price differences of fractions of a cent that exist for milliseconds. HFT firms make tiny profits per trade but do it at massive scale.' },
          { type: 'callout', label: 'How AI Is Used in Finance', items: [
            '**Sentiment analysis** — NLP models scan news and social media to gauge market mood in real-time',
            '**Price prediction** — Machine learning models find patterns in historical price data',
            '**Risk management** — AI monitors portfolios for unusual exposures and concentration risks',
            '**Fraud detection** — Real-time anomaly detection in payment networks',
          ]},
          { type: 'important', value: 'AI models in trading can amplify market volatility during crises. When many algorithms are trained on similar data and market conditions shift suddenly (like March 2020), they may all trigger sell signals simultaneously — accelerating crashes. AI is powerful but not infallible.' },
        ],
      },
      {
        id: 'topicality-3',
        title: 'Investing in a Changing World',
        content: [
          { type: 'text', value: 'Markets change. New asset classes emerge (crypto in the 2010s), old sectors decline (coal, print media), regulations shift, and technology disrupts every industry. The investor who thrives long-term is one who stays curious, keeps learning, and adapts their mental models as the world changes.' },
          { type: 'text', value: 'Staying informed doesn\'t mean reacting to every headline. It means building a strong foundation of financial knowledge — understanding how different assets behave, what drives valuations, how macro forces connect — so you can evaluate any new development rationally, not emotionally.' },
          { type: 'callout', label: 'Building Your Investment Edge', items: [
            '**Read widely** — Annual reports, central bank statements, quality financial journalism',
            '**Think probabilistically** — Markets are about outcomes and their likelihoods, not certainties',
            '**Track your decisions** — Keep an investment journal to learn from your own mistakes',
            '**Stay humble** — The best investors acknowledge uncertainty rather than pretending to predict it',
          ]},
          { type: 'important', value: 'Financial markets are one of the most competitive environments on Earth. Thousands of brilliant, full-time professionals are analysing the same data you are. Your edge as a retail investor is patience, low costs, and emotional discipline — not being smarter than Wall Street.' },
        ],
      },
    ],
    quiz: [
      {
        question: 'What is "sentiment analysis" in financial markets?',
        options: ['Analysing quarterly earnings reports', 'Using AI to assess whether news and social media are positive or negative on assets', 'Measuring GDP growth data', 'Tracking central bank meeting minutes'],
        correct: 1,
        explanation: 'Sentiment analysis uses AI and natural language processing to measure whether news articles, social media posts, and analyst reports express positive (bullish) or negative (bearish) sentiment — giving traders a real-time read on market mood.',
      },
      {
        question: 'When a central bank raises interest rates unexpectedly, what typically happens to high-growth tech stocks?',
        options: ['They rise because of higher yields', 'They fall because future earnings are discounted at a higher rate', 'They are unaffected by rate changes', 'They rise as investors move from bonds to stocks'],
        correct: 1,
        explanation: 'High-growth tech stocks are valued on expected future earnings. When interest rates rise, those future earnings are "discounted" at a higher rate — making them worth less today. This is why tech stocks are especially sensitive to unexpected rate hike surprises.',
      },
      {
        question: 'What is high-frequency trading (HFT)?',
        options: ['Trading that happens once a day at market close', 'Using computers to execute thousands of trades per second based on algorithms', 'A strategy for retail investors to trade more often', 'Trading commodities at peak demand times'],
        correct: 1,
        explanation: 'HFT uses powerful computers and algorithms to execute thousands of trades per second, exploiting tiny price discrepancies across markets. HFT firms make very small profits per trade but trade at enormous volume — and can amplify market volatility during crises.',
      },
    ],
  },
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
    steps: [
      'Download the Revolut app and create an account with your phone number.',
      'Complete identity verification (passport or ID card — usually instant).',
      'Go to "Invest" in the bottom nav, tap "Stocks" or "ETFs" to browse.',
      'Start with as little as €1 — tap any asset and hit "Buy" to make your first trade.',
    ],
    article: {
      title: 'How to buy stocks on Revolut',
      source: 'Revolut',
      url: 'https://www.revolut.com/fr-FR/stock-trading/',
    },
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
    steps: [
      'Go to etoro.com and click "Join Now" — registration takes under 5 minutes.',
      'Upload your ID and complete the identity verification questionnaire.',
      'Deposit a minimum of €50 via bank transfer or card, then search for your first asset.',
      'Search for a beginner-friendly ETF (e.g. iShares MSCI World), click "Trade", and set your amount.',
    ],
    article: {
      title: 'How to open an account and make your first trade',
      source: 'eToro',
      url: 'https://www.etoro.com/stocks/trading-and-investing-in-stocks/',
    },
  },
  {
    id: 'bnp',
    name: 'BNP Paribas',
    color: '#00965E',
    min: '€100',
    time: '2–3 days',
    assets: ['Stocks', 'Bonds', 'Mutual Funds', 'ETFs'],
    perk: 'Regulated French bank · Phone support',
    beginner: true,
    rating: 3.9,
    steps: [
      'Visit your nearest BNP branch or go to mabanque.bnpparibas.fr to open a compte-titres.',
      'Provide your ID, proof of address, and tax number (NIF) — approval takes 2–3 business days.',
      'Once approved, log in to your online banking and navigate to "Bourse & Investissements".',
      'Search for a fund or stock, review the fee schedule (€1.95–€9.95 per order), and place your first order.',
    ],
    article: {
      title: 'Pourquoi et comment investir en bourse',
      source: 'BNP Paribas',
      url: 'https://mabanque.bnpparibas/fr/bourse/nos-offres-et-services-bourse/pourquoi-et-comment-investir-en-bourse',
    },
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
    steps: [
      'Download the Trade Republic app — available on iOS and Android.',
      'Enter your phone number, verify your identity with your ID card — takes about 10 minutes.',
      'Add funds via bank transfer (min €10) — IBAN provided in the app.',
      'Search for an ETF (e.g. MSCI World), tap "Buy", set your amount — flat €1 fee per trade.',
    ],
    article: {
      title: 'Start investing with Trade Republic',
      source: 'Trade Republic',
      url: 'https://traderepublic.com/en-fr',
    },
  },
]
