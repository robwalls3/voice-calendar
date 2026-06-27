'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Month' },
  { href: '/weekly', label: 'Week' },
  { href: '/analysis', label: 'Analysis' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <span className="font-medium text-gray-800">📅 Voice Calendar</span>
      <div className="flex gap-6">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${pathname === link.href ? 'text-blue-600 font-medium' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}