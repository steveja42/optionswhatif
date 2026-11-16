'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/aboutaddon', label: 'Sheets Add-On' },
  { href: '/feedback', label: 'Give Feedback' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function handleLogoClick(e: React.MouseEvent) {
    setMenuOpen(false)
    if (e.ctrlKey) {
      e.preventDefault()
      router.push('/owiadmin')
    }
  }

  return (
    <header className="App-header">
      <nav className="navbar navbar-expand-sm bg-body" style={{padding: 0, minHeight: '56px'}}>
        <Link href="/" className="navbar-brand d-flex align-items-center" style={{ margin: 0, padding: 0, height: '56px'}} onClick={handleLogoClick}>
          <Image src="/logo100.png" width={0} height={0} sizes="56px" style={{width: 'auto', height: '100%', marginRight: '8px'}} className="d-inline-block" alt="" />
          OptionsWhatIf
        </Link>

        {/* Theme toggle and (on mobile) the menu button. Sits at the far right at every width. */}
        <div className="ms-auto order-sm-last d-flex align-items-center gap-2 pe-2">
          <ThemeToggle />
          <button
            type="button"
            className="navbar-toggler"
            aria-controls="main-nav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className="navbar-toggler-icon" />
          </button>
        </div>

        {/* Not using Bootstrap's "collapse" class: Tailwind's .collapse (visibility: collapse) clashes with it. */}
        <div id="main-nav" className={`navbar-collapse${menuOpen ? ' show' : ''}`}>
          <div className="navbar-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${pathname === href ? ' navselected' : ''}`}
                aria-current={pathname === href ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
