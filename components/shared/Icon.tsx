'use client'

// Bilim Icon компоненті — дизайн файлындағы барлық иконкалар
// Дереккөз: app-course/project/components.jsx → Icon

interface IconProps {
  name: string
  size?: number
  stroke?: number
  className?: string
  style?: React.CSSProperties
}

const PATHS: Record<string, React.ReactNode> = {
  search:     <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  menu:       <><path d="M3 6h18M3 12h18M3 18h18"/></>,
  close:      <><path d="M18 6 6 18M6 6l12 12"/></>,
  chevron:    <path d="m9 6 6 6-6 6"/>,
  chevronDown:<path d="m6 9 6 6 6-6"/>,
  chevronUp:  <path d="m6 15 6-6 6 6"/>,
  chevronLeft:<path d="m15 6-6 6 6 6"/>,
  star:       <path d="M12 2 14.6 8.6 22 9.5l-5.5 4.8L18 22l-6-3.4L6 22l1.5-7.7L2 9.5l7.4-.9z" fill="currentColor" stroke="none"/>,
  starOutline:<path d="M12 2 14.6 8.6 22 9.5l-5.5 4.8L18 22l-6-3.4L6 22l1.5-7.7L2 9.5l7.4-.9z"/>,
  play:       <path d="M5 3.5v17l14-8.5z" fill="currentColor" stroke="none"/>,
  playCircle: <><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/></>,
  pause:      <><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/></>,
  cart:       <><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.7 12.3a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L21 8H6"/></>,
  heart:      <path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23 8.5 21.5 12c-2.5 4.5-9.5 9-9.5 9z"/>,
  user:       <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
  book:       <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z M4 4v12 M20 16H8a2 2 0 0 0 0 4h12"/>,
  grid:       <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  filter:     <path d="M3 5h18l-7 9v6l-4-2v-4z"/>,
  clock:      <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  award:      <><circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/></>,
  check:      <path d="m4 12 5 5L20 6"/>,
  bell:       <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
  download:   <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
  settings:   <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
  plus:       <path d="M12 5v14M5 12h14"/>,
  edit:       <path d="M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>,
  trash:      <><path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
  chart:      <path d="M3 3v18h18 M7 14l4-4 4 4 5-6"/>,
  users:      <><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/><circle cx="17" cy="6" r="3"/><path d="M22 18c0-2.8-2.2-5-5-5"/></>,
  bookmark:   <path d="M5 3h14v18l-7-4-7 4z"/>,
  globe:      <><circle cx="12" cy="12" r="9"/><path d="M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></>,
  lock:       <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
  dollar:     <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>,
  target:     <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
  upload:     <><path d="M12 21V9 M7 14l5-5 5 5 M5 21h14"/></>,
  video:      <><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></>,
  fullscreen: <path d="M3 9V3h6 M21 9V3h-6 M3 15v6h6 M21 15v6h-6"/>,
  volume:     <><polygon points="3 9 7 9 12 4 12 20 7 15 3 15" fill="currentColor" stroke="none"/><path d="M16 8a5 5 0 0 1 0 8 M19 5a9 9 0 0 1 0 14"/></>,
  sparkle:    <path d="M12 3v4 M12 17v4 M3 12h4 M17 12h4 M5.5 5.5l3 3 M15.5 15.5l3 3 M18.5 5.5l-3 3 M8.5 15.5l-3 3"/>,
  code:       <path d="m8 6-6 6 6 6 M16 6l6 6-6 6 M14 4l-4 16"/>,
  palette:    <><circle cx="12" cy="12" r="9"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/><path d="M12 21a3 3 0 0 1 0-6c2 0 2-1 2-2"/></>,
  briefcase:  <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  language:   <path d="M3 5h12 M9 3v2c0 4-2 8-6 10 M5 9c0 4 4 7 9 8 M14 21l5-12 5 12 M17 17h4"/>,
  arrow:      <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>,</>,
  shield:     <path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/>,
  eye:        <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  list:       <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>,
  sun:        <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon:       <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
  document:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/></>,
  mail:       <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></>,
  refresh:    <path d="M3 12a9 9 0 0 1 15-6.7L21 8 M21 12a9 9 0 0 1-15 6.7L3 16"/>,
}

export default function Icon({ name, size = 16, stroke = 1.75, className, style }: IconProps) {
  const path = PATHS[name]
  if (!path) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {path}
    </svg>
  )
}
