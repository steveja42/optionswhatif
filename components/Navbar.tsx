'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="App-header">
      <nav className="navbar navbar-expand-sm navbar-light bg-light" style={{padding: 0, minHeight: '56px'}}>
        <Link href="/" className="navbar-brand d-flex align-items-center" style={{ margin: 0, height: '56px'}}>
          <Image src="/logo100.png" width={0} height={0} sizes="56px" style={{width: 'auto', height: '100%', marginRight: '8px'}} className="d-inline-block" alt="" />
          OptionsWhatIf
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
