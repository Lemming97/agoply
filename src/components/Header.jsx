import styles from './Header.module.css'

const TABS = [
  { id: 'education',  label: 'LEARN',    icon: '🎓' },
  { id: 'simulation', label: 'SIMULATE', icon: '📊' },
  { id: 'realworld',  label: 'INVEST',   icon: '🌍' },
]

export default function Header({ tab, setTab, xp, streak }) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>🌊</div>
          <div>
            <div className={styles.appName}>AGOPLY</div>
            <div className={styles.tagline}>Experience real-time investing through learning & play</div>
          </div>
        </div>
        <div className={styles.badges}>
          <span className={styles.streak}>🔥 {streak}</span>
          <span className={styles.xp}>⚡ {xp} XP</span>
        </div>
      </div>
      <nav className={styles.nav}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.navBtn} ${tab === t.id ? styles.active : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className={styles.navIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
