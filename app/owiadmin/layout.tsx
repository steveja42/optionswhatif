import type { Metadata } from 'next'

// Keep the admin page out of search results without listing it in robots.txt
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
