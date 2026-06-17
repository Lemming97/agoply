import LottieRaw from 'lottie-react'

// Vite pre-bundles the UMD build, wrapping the whole module object as the
// default export. Unwrap the actual component here for CJS/ESM interop.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Lottie = ((LottieRaw as any).default ?? LottieRaw) as typeof LottieRaw

interface Props {
  animationData: object
  height?: number
  width?: number | string
  loop?: boolean
  autoplay?: boolean
  style?: React.CSSProperties
  onComplete?: () => void
}

export default function LottieAnimation({
  animationData,
  height = 140,
  width = 140,
  loop = true,
  autoplay = true,
  style,
  onComplete,
}: Props) {
  return (
    <div style={{ height, width, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ height: '100%', width: '100%' }}
        onComplete={onComplete}
      />
    </div>
  )
}
