'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { getEntriesByMonth } from '@/lib/api'
import type { Entry } from '@/types/entry'
import Link from 'next/link'

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const month = format(currentDate, 'yyyy-MM')

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', month],
    queryFn: () => getEntriesByMonth(month)
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const entriesByDate = entries.reduce((acc: Record<string, Entry[]>, entry: Entry) => {
    if (!acc[entry.date]) acc[entry.date] = []
    acc[entry.date].push(entry)
    return acc
  }, {})

  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const subjectColors: Record<string, string> = {
    daisy: 'bg-purple-50 text-purple-700',
    rob: 'bg-blue-50 text-blue-700',
    meredith: 'bg-green-50 text-green-700',
    house: 'bg-amber-50 text-amber-700'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">{format(currentDate, 'MMMM yyyy')}</h1>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">←</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Today</button>
          <button onClick={nextMonth} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm text-gray-400 py-2">{day}</div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-7 border-l border-t border-gray-100">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayEntries = entriesByDate[dateStr] ?? []
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <Link
                key={dateStr}
                href={`/day/${dateStr}`}
                className={`min-h-24 p-2 border-r border-b border-gray-100 hover:bg-gray-50 transition-colors ${!isCurrentMonth ? 'opacity-30' : ''}`}
              >
                <div className={`text-sm w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayEntries.slice(0, 3).map((entry: Entry) => (
                    <div key={entry.id} className={`text-xs rounded px-1 py-0.5 truncate ${subjectColors[entry.subject] ?? 'bg-gray-50 text-gray-600'}`}>
                      {entry.subject}: {entry.event}
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <div className="text-xs text-gray-400">+{dayEntries.length - 3} more</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}