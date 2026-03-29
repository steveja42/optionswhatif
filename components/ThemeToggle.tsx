'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(stored === 'dark' || (stored === null && prefersDark))
  }, [])

  function toggle() {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.setAttribute('data-bs-theme', next)
    try { localStorage.setItem('theme', next) } catch { /* private browsing */ }
    setIsDark(next === 'dark')
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
