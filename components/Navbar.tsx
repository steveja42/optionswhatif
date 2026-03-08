'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="App-header">
      <nav className="navbar navbar-expand-sm navbar-light bg-light">
        <Link href="/" className="navbar-brand">
          <Image src="/favicon.ico" width={30} height={30} className="d-inline-block align-top" alt="" />
          {' '}OptionsWhatIf
        </Link>
        <div className="navbar-nav">
          <Link
            href="/about"
            className={`nav-link${pathname === '/about' ? ' navselected' : ''}`}
          >
            About
          </Link>
          <Link
            href="/aboutaddon"
            className={`nav-link${pathname === '/aboutaddon' ? ' navselected' : ''}`}
          >
            Sheets Add-On
          </Link>
          <Link
            href="/feedback"
            className={`nav-link${pathname === '/feedback' ? ' navselected' : ''}`}
          >
            Give Feedback
          </Link>
        </div>
      </nav>
    </header>
  )
}
