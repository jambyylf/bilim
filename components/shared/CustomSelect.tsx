'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = options.find(o => o.value === value)

  function openDropdown() {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dropdown = document.getElementById('custom-select-portal')
        if (!dropdown || !dropdown.contains(target)) setOpen(false)
      }
    }
    function handleScroll() {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  const dropdown = open && rect ? createPortal(
    <div
      id="custom-select-portal"
      style={{
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        background: 'var(--b-bg)',
        border: '1px solid var(--b-line)',
        borderRadius: 12,
        maxHeight: 260,
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      }}
    >
      <button
        type="button"
        onClick={() => { onChange(''); setOpen(false) }}
        style={{
          width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 14,
          background: value === '' ? 'var(--b-primary)' : 'transparent',
          color: value === '' ? '#fff' : 'var(--b-text-3)',
          border: 'none', cursor: 'pointer', display: 'block',
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
            width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 14,
            background: value === opt.value ? 'var(--b-primary)' : 'transparent',
            color: value === opt.value ? '#fff' : 'var(--b-text)',
            border: 'none', cursor: 'pointer', display: 'block', transition: 'background 0.12s',
          }}
          onMouseEnter={e => {
            if (value !== opt.value) (e.currentTarget as HTMLButtonElement).style.background = 'var(--b-bg-soft)'
          }}
          onMouseLeave={e => {
            if (value !== opt.value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>,
    document.body
  ) : null

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDropdown}
        className="inp"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left', userSelect: 'none',
        }}
      >
        <span style={{ color: selected ? 'var(--b-text)' : 'var(--b-text-4)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{
            color: 'var(--b-text-3)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {dropdown}
    </div>
  )
}
