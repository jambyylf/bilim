'use client'

import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (val: string) => void
  options: Option[]
  placeholder?: string
}

export default function CustomSelect({ value, onChange, options, placeholder = '—' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inp"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          userSelect: 'none',
        }}
      >
        <span style={{ color: selected ? 'var(--b-text)' : 'var(--b-text-4)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{
            color: 'var(--b-text-3)',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--b-bg)',
            border: '1px solid var(--b-line)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          {/* Бос таңдау */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 14px',
              fontSize: 14,
              background: value === '' ? 'var(--b-primary)' : 'transparent',
              color: value === '' ? '#fff' : 'var(--b-text-3)',
              border: 'none',
              cursor: 'pointer',
              display: 'block',
            }}
          >
            {placeholder}
          </button>

          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                fontSize: 14,
                background: value === opt.value ? 'var(--b-primary)' : 'transparent',
                color: value === opt.value ? '#fff' : 'var(--b-text)',
                border: 'none',
                cursor: 'pointer',
                display: 'block',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => {
                if (value !== opt.value)
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--b-bg-soft)'
              }}
              onMouseLeave={e => {
                if (value !== opt.value)
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
