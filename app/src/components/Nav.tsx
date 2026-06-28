'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const links = [
  { href: '/', label: 'Month' },
  { href: '/weekly', label: 'Week' },
  { href: '/analysis', label: 'Analysis' },
]

export default function Nav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  if (status === 'loading') return null
  if (!session) return null

  return (
    <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <span className="font-medium text-gray-800">
        📅 Voice Calendar
      </span>

      <div className="flex items-center gap-6">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              pathname === link.href
                ? 'text-blue-600 font-medium'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/entries/new"
          className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          + Add Entry
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}