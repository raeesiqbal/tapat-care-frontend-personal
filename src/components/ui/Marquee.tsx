'use client'

import React, { useEffect, useRef, useState } from 'react'

export interface MarqueeProps {
  children: React.ReactNode
  as?: 'div' | 'ul'
  speed?: number // px per second
  repeats?: number // desired multiplier of base children count
  hoverPause?: boolean
  containerClassName?: string
  trackClassName?: string
  gapDefault?: number // fallback when CSS gap is not computable
  ariaLabel?: string
}

export function Marquee({
  children,
  as = 'div',
  speed = 80,
  repeats = 3,
  hoverPause = true,
  containerClassName,
  trackClassName,
  gapDefault = 16,
  ariaLabel,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | HTMLUListElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const lastRef = useRef<number | null>(null)
  const baseChildrenRef = useRef<HTMLElement[] | null>(null)
  const baseCountRef = useRef<number>(0)
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // visibility
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    let isPaused = false

    const onEnter = () => { if (hoverPause) isPaused = true }
    const onLeave = () => { if (hoverPause) { isPaused = false; lastRef.current = null } }
    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)

    const getGap = () => {
      const style = window.getComputedStyle(track)
      const gap = parseFloat(style.gap || '0')
      return Number.isFinite(gap) && gap >= 0 ? gap : gapDefault
    }

    const ensureRepeats = () => {
      // Capture the original children exactly once
      if (!baseChildrenRef.current) {
        baseChildrenRef.current = Array.from(track.children) as HTMLElement[]
        baseCountRef.current = baseChildrenRef.current.length
      }

      const baseChildren = baseChildrenRef.current!
      const baseCount = baseCountRef.current || 1
      const gap = getGap()

      const getTrackWidth = () => {
        let total = 0
        const len = track.children.length
        for (let i = 0; i < len; i++) {
          const child = track.children[i] as HTMLElement
          total += child.offsetWidth
          if (i < len - 1) total += gap
        }
        return total
      }

      // Ensure at least baseCount * repeats items
      const minCountTarget = baseCount * Math.max(1, repeats)
      while (track.children.length < minCountTarget) {
        const nextIndex = track.children.length % baseCount
        const cloneSource = baseChildren[nextIndex]
        const clone = cloneSource.cloneNode(true) as HTMLElement
        track.appendChild(clone)
      }

      // Additionally ensure the track visually fills the viewport with buffer
      const minWidthTarget = container.clientWidth * 2 // buffer ensures no visible gap
      let currentWidth = getTrackWidth()
      // Safety cap to prevent runaway cloning
      const hardMaxCount = baseCount * Math.max(1, repeats) * 8
      while (currentWidth < minWidthTarget && track.children.length < hardMaxCount) {
        const nextIndex = track.children.length % baseCount
        const cloneSource = baseChildren[nextIndex]
        const clone = cloneSource.cloneNode(true) as HTMLElement
        track.appendChild(clone)
        currentWidth += cloneSource.offsetWidth + gap
      }
    }

    ensureRepeats()

    const step = (time: number) => {
      if (lastRef.current == null) lastRef.current = time
      const delta = time - lastRef.current
      lastRef.current = time

      if (!isPaused && isVisible && !prefersReducedMotion) {
        const move = (speed * delta) / 1000
        offsetRef.current += move
        track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`

        const first = track.children[0] as HTMLElement | undefined
        if (first) {
          // Use accumulated offset rather than expensive bounding rects
          const threshold = first.offsetWidth + getGap()
          if (offsetRef.current >= threshold) {
            track.appendChild(first)
            offsetRef.current -= threshold
            track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
          }
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    const onResize = () => {
      // Reset animation state and re-ensure width coverage for new viewport
      offsetRef.current = 0
      track.style.transform = 'translate3d(0,0,0)'
      lastRef.current = null
      ensureRepeats()
    }
    window.addEventListener('resize', onResize)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [speed, isVisible, prefersReducedMotion, hoverPause, repeats, gapDefault])

  const ContainerTag = 'div'
  const TrackTag = as === 'ul' ? 'ul' : 'div'

  return (
    <ContainerTag ref={containerRef} className={containerClassName} aria-label={ariaLabel}>
      <TrackTag ref={trackRef as any} className={trackClassName} style={{ willChange: 'transform' }}>
        {children}
      </TrackTag>
    </ContainerTag>
  )
}