// Жұлдыз рейтинг компоненті
import Icon from './Icon'

interface StarsProps {
  value?: number
  size?: number
  showNum?: boolean
  className?: string
}

export default function Stars({ value = 4.7, size = 12, showNum = true, className }: StarsProps) {
  const filled = Math.round(value)

  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <span className="stars">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name={i < filled ? 'star' : 'starOutline'} size={size} />
        ))}
      </span>
      {showNum && (
        <span className="b-sm font-semibold" style={{ color: 'var(--b-text-2)' }}>
          {value.toFixed(1)}
        </span>
      )}
    </span>
  )
}
