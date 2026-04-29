'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    _ytReady: boolean
    _ytCbs: (() => void)[]
  }
}

// YouTube IFrame API-ді бір рет жүктейді
function ensureYTApi(): Promise<void> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') return
    if (window._ytReady) { resolve(); return }
    if (!window._ytCbs) window._ytCbs = []
    window._ytCbs.push(resolve)
    if (document.getElementById('yt-iframe-api')) return
    window.onYouTubeIframeAPIReady = () => {
      window._ytReady = true
      ;(window._ytCbs ?? []).forEach(fn => fn())
    }
    const s = document.createElement('script')
    s.id = 'yt-iframe-api'
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  })
}

function fmtTime(sec: number) {
  const s = Math.floor(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Иконкалар
const Ico = {
  Play: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
  Pause: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
  ),
  VolHigh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  ),
  VolMute: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ),
  Expand: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  ),
  Compress: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
      <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
  ),
  Spin: () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="animate-spin" style={{ opacity: 0.5 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
    </svg>
  ),
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const btnStyle: React.CSSProperties = {
  color: '#fff',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 6,
  borderRadius: 4,
  flexShrink: 0,
}

interface Props {
  lessonId: string
  autoPlay?: boolean
  onEnded?: () => void
  onTimeUpdate?: (time: number) => void
}

export default function YouTubeSecurePlayer({ lessonId, autoPlay, onEnded, onTimeUpdate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const hideRef = useRef<ReturnType<typeof setTimeout>>()
  // ref арқылы callback-тарды fresh ұстаймыз
  const onEndedRef = useRef(onEnded)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate }, [onTimeUpdate])

  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [speed, setSpeed] = useState(1)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [showSpeeds, setShowSpeeds] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const [buffering, setBuffering] = useState(false)

  // Fullscreen өзгерісін бақылау
  useEffect(() => {
    const fn = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  // Прогресс таймері
  useEffect(() => {
    clearInterval(timerRef.current)
    if (!ready) return
    timerRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return
      const t = playerRef.current.getCurrentTime() || 0
      const d = playerRef.current.getDuration() || 0
      setCurrent(t)
      if (d > 0) setDuration(d)
      onTimeUpdateRef.current?.(t)
    }, 500)
    return () => clearInterval(timerRef.current)
  }, [ready])

  // Controls auto-hide
  const resetHide = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideRef.current)
    hideRef.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  // Плеер инициализациясы (сабақ ауысқан сайын)
  useEffect(() => {
    let alive = true
    setReady(false)
    setError(null)
    setCurrent(0)
    setDuration(0)
    setPlaying(false)
    setBuffering(false)
    setSpeed(1)

    async function init() {
      // 1. Сервердан video ID алу (auth тексеріледі)
      let videoId: string
      try {
        const r = await fetch(`/api/student/lesson-video/${lessonId}`)
        if (!r.ok) {
          if (alive) setError('Видео қолжетімсіз')
          return
        }
        const { vid } = await r.json()
        videoId = atob(vid)
      } catch {
        if (alive) setError('Желі қатесі')
        return
      }
      if (!alive) return

      // 2. YouTube IFrame API жүктеу
      await ensureYTApi()
      if (!alive) return

      // 3. Контейнерге жаңа iframe орнату
      try { playerRef.current?.destroy() } catch {}
      const wrap = wrapRef.current
      if (!wrap || !alive) return
      wrap.innerHTML = ''
      const el = document.createElement('div')
      el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'
      wrap.appendChild(el)

      playerRef.current = new window.YT.Player(el, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0,        // YouTube controls жасырылады
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,       // YouTube пернетақтасы өшірілген
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          cc_load_policy: 0,
        },
        events: {
          onReady(e: any) {
            if (!alive) return
            e.target.setVolume(80)
            setDuration(e.target.getDuration() || 0)
            setReady(true)
            if (autoPlay) e.target.playVideo()
          },
          onStateChange(e: any) {
            if (!alive) return
            // 0=аяқталды 1=ойнап тұр 2=тоқтады 3=буферленуде
            setPlaying(e.data === 1)
            setBuffering(e.data === 3)
            if (e.data === 1) {
              setDuration(playerRef.current?.getDuration() || 0)
              resetHide()
            }
            if (e.data === 0) onEndedRef.current?.()
          },
          onError() {
            if (alive) setError('Видео жүктелмеді')
          },
        },
      })
    }

    init()

    return () => {
      alive = false
      clearInterval(timerRef.current)
      clearTimeout(hideRef.current)
      try { playerRef.current?.destroy() } catch {}
      playerRef.current = null
      if (wrapRef.current) wrapRef.current.innerHTML = ''
    }
  }, [lessonId])

  // Controls handlers
  function togglePlay() {
    if (!playerRef.current) return
    if (playing) { playerRef.current.pauseVideo(); setPlaying(false) }
    else { playerRef.current.playVideo(); setPlaying(true) }
    resetHide()
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value)
    playerRef.current?.seekTo(t, true)
    setCurrent(t)
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value)
    setVolume(v)
    if (v === 0) {
      playerRef.current?.mute()
      setMuted(true)
    } else {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(v)
      setMuted(false)
    }
  }

  function toggleMute() {
    if (muted) {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(volume || 80)
      setMuted(false)
    } else {
      playerRef.current?.mute()
      setMuted(true)
    }
  }

  function setSpeedVal(sp: number) {
    playerRef.current?.setPlaybackRate(sp)
    setSpeed(sp)
    setShowSpeeds(false)
  }

  function toggleFs() {
    const el = wrapRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }

  const controlsVisible = showControls || !playing

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        background: '#0a0a0a',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      onMouseMove={resetHide}
      onMouseEnter={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
      onContextMenu={e => e.preventDefault()}
    >
      {/* YouTube iframe мұнда JS арқылы қосылады (React рендермейді) */}

      {/* Барлық click-ті ұстайтын overlay */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 5 }}
        onClick={ready ? togglePlay : undefined}
      />

      {/* Жүктелуде */}
      {!ready && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: '#fff' }}>
          <Ico.Spin />
        </div>
      )}

      {/* Буферлену индикаторы */}
      {ready && buffering && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none', color: '#fff' }}>
          <Ico.Spin />
        </div>
      )}

      {/* Қате */}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{error}</span>
        </div>
      )}

      {/* Кастомды Controls панелі */}
      {ready && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
            padding: '52px 14px 10px',
            transition: 'opacity 0.25s ease',
            opacity: controlsVisible ? 1 : 0,
            pointerEvents: controlsVisible ? 'auto' : 'none',
          }}
          onClick={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
        >
          {/* Прогресс жолағы */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={current}
            onChange={handleSeek}
            style={{ width: '100%', marginBottom: 10, cursor: 'pointer', accentColor: '#F59E0B' }}
          />

          {/* Батырмалар қатары */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff' }}>
            {/* Ойнату/Тоқтату */}
            <button onClick={togglePlay} style={btnStyle}>
              {playing ? <Ico.Pause /> : <Ico.Play />}
            </button>

            {/* Дыбыс */}
            <button onClick={toggleMute} style={btnStyle}>
              {muted || volume === 0 ? <Ico.VolMute /> : <Ico.VolHigh />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              style={{ width: 68, cursor: 'pointer', accentColor: '#F59E0B' }}
            />

            {/* Уақыт */}
            <span style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.75)',
              fontVariantNumeric: 'tabular-nums',
              flex: 1,
              whiteSpace: 'nowrap',
            }}>
              {fmtTime(current)} / {fmtTime(duration)}
            </span>

            {/* Жылдамдық */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSpeeds(v => !v)}
                style={{
                  ...btnStyle,
                  padding: '3px 9px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 5,
                }}
              >
                {speed}×
              </button>
              {showSpeeds && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  right: 0,
                  background: 'rgba(12,12,12,0.96)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minWidth: 80,
                }}>
                  {SPEEDS.map(sp => (
                    <button
                      key={sp}
                      onClick={() => setSpeedVal(sp)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '7px 0',
                        color: sp === speed ? '#F59E0B' : '#fff',
                        background: sp === speed ? 'rgba(245,158,11,0.12)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        textAlign: 'center',
                        fontWeight: sp === speed ? 700 : 400,
                      }}
                    >
                      {sp}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Толық экран */}
            <button onClick={toggleFs} style={btnStyle}>
              {isFs ? <Ico.Compress /> : <Ico.Expand />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
