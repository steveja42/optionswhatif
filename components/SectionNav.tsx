'use client'

import { useEffect, useRef, useState } from 'react'

export interface NavSection {
  id: string
  label: string
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Sticky row of section links. The link for the section currently under the bar
 * is highlighted, and it updates as the page scrolls.
 */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Track which section is under the bar.
  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const barBottom = navRef.current?.getBoundingClientRect().bottom ?? 0
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

      let current = sections[0]?.id ?? ''
      if (atBottom && sections.length > 0) {
        // A short last section never reaches the top, so pick it at the bottom of the page.
        current = sections[sections.length - 1].id
      } else {
        for (const { id } of sections) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= barBottom + 1) current = id
        }
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [sections])

  // On narrow screens the bar scrolls sideways. Keep the active link visible.
  useEffect(() => {
    const nav = navRef.current
    const link = linkRefs.current[activeId]
    if (!nav || !link) return
    const list = link.parentElement?.parentElement
    if (!list || list.scrollWidth <= list.clientWidth) return
    const target = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2
    list.scrollTo({ left: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [activeId])

  // Honor a hash on first load (e.g. /#faq), after layout has settled.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id || !sections.some(s => s.id === id)) return
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }, 50)
    return () => window.clearTimeout(timer)
  }, [sections])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
    setActiveId(id)
  }

  return (
    <nav ref={navRef} className="section-nav" aria-label="Page sections">
      <ul className="section-nav-list">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              ref={el => { linkRefs.current[id] = el }}
              href={`#${id}`}
              className={`section-nav-link${activeId === id ? ' active' : ''}`}
              aria-current={activeId === id ? 'true' : undefined}
              onClick={e => handleClick(e, id)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
