'use client'

import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  headingTag?: 'h2' | 'h3' | 'h4'
  headingClassName?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({
  title,
  headingTag: Tag = 'h2',
  headingClassName = 'h4 mb-0',
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = title.replace(/\s+/g, '-').toLowerCase()

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Tag className={headingClassName}>{title}</Tag>
        <button
          className="btn btn-link p-0 text-decoration-none text-muted"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={id}
          title={open ? 'Collapse' : 'Expand'}
          style={{ lineHeight: 1 }}
        >
          <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block', fontSize: '0.7em' }}>
            ▶
          </span>
        </button>
      </div>
      {open && <div id={id}>{children}</div>}
    </div>
  )
}
