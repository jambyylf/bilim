// Bilim Logo компоненті — Қазақ геометриялық мотивтері негізінде
// Стильдендірілген "B" белгісі + шаңырақ сілтемесі (дизайн файлынан)

interface LogoProps {
  color?: string
  textColor?: string
  size?: number
  hideText?: boolean
  className?: string
}

export default function Logo({
  color = '#1E3A8A',
  textColor = '#111827',
  size = 28,
  hideText = false,
  className,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-[9px] ${className ?? ''}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="28" height="28" rx="7" fill={color} />
        <path
          d="M10 9h7.5a4.5 4.5 0 0 1 .5 9 4.5 4.5 0 0 1-.5 9H10z"
          stroke="#fff"
          strokeWidth="1.8"
          fill="none"
        />
        {/* Amber нүкте — Bilim. логотипіндегі акцент */}
        <circle cx="22.5" cy="9.5" r="1.6" fill="#F59E0B" />
      </svg>
      {!hideText && (
        <span
          style={{ color: textColor, fontWeight: 700, fontSize: size * 0.64, letterSpacing: '-0.02em' }}
        >
          Bilim
        </span>
      )}
    </div>
  )
}
