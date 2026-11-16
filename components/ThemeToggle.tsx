'use client'

import { useSyncExternalStore } from 'react'

// The theme lives on <html data-theme>, set before hydration by the init script in app/layout.tsx
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const getSnapshot = () => document.documentElement.getAttribute('data-theme') === 'dark'
const getServerSnapshot = () => false

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggle() {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.setAttribute('data-bs-theme', next)
    try { localStorage.setItem('theme', next) } catch { /* private browsing */ }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-link nav-link p-0 ms-2"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{ fontSize: '1.1rem', lineHeight: 1, color: 'inherit' }}
    >
      {isDark ? '☀' : '☾'}
    </button>
  )
}
