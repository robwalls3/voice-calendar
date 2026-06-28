'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO, addWeeks, subWeeks } from 'date-fns'
import { getEntriesByMonth } from '@/lib/api'
import type { Entry } from '@/types/entry'
import Link from 'next/link'

const subjectColors: Record<string, string> = {
  daisy: 'bg-purple-100 text-purple-800',
  rob: 'bg-blue-100 text-blue-800',
  meredith: 'bg-green-100 text-green-800',
  house: 'bg-amber-100 text-amber-800'
}

export default function WeeklyView() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const month = format(currentDate, 'yyyy-MM')

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', month],
    queryFn: () => getEntriesByMonth(month),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  })

  const entriesByDate = entries.reduce((acc: Record<string, Entry[]>, entry: Entry) => {
    if (!acc[entry.date]) acc[entry.date] = []
    acc[entry.date].push(entry)
    return acc
  }, {})

  const weekEntries = entries.filter((e: Entry) => {
    const d = parseISO(e.date)
    return d >= weekStart && d <= weekEnd
  })

  const subjectCounts = weekEntries.reduce((acc: Record<string, number>, e: Entry) => {
    acc[e.subject] = (acc[e.subject] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600">← Back</Link>
          <h1 className="text-2xl font-medium">
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(d => subWeeks(d, 1))} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">←</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">This week</button>
          <button onClick={() => setCurrentDate(d => addWeeks(d, 1))} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">→</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {Object.entries(subjectCounts).map(([subject, count]) => (
          <div key={subject} className={`p-3 rounded-lg ${subjectColors[subject] ?? 'bg-gray-100 text-gray-600'}`}>
            <p className="text-xs font-medium capitalize">{subject}</p>
            <p className="text-2xl font-medium mt-1">{count}</p>
            <p className="text-xs mt-0.5">entries this week</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayEntries = entriesByDate[dateStr] ?? []

            return (
              <div key={dateStr} className={`rounded-lg border p-4 ${isToday(day) ? 'border-blue-200 bg-blue-50' : 'border-gray-100'}`}>
                <Link href={`/day/${dateStr}`} className="flex items-center justify-between mb-3 hover:opacity-70">
                  <h2 className={`font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                    {format(day, 'EEEE, MMM d')}
                  </h2>
                  <span className="text-xs text-gray-400">{dayEntries.length} entries</span>
                </Link>
                {dayEntries.length === 0 ? (
                  <p className="text-sm text-gray-300">No entries</p>
                ) : (
                  <div className="space-y-2">
                    {dayEntries
                      .sort((a: Entry, b: Entry) => (a.time ?? '').localeCompare(b.time ?? ''))
                      .map((entry: Entry) => (
                        <div key={entry.id} className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${subjectColors[entry.subject] ?? 'bg-gray-100 text-gray-600'}`}>
                            {entry.subject}
                          </span>
                          <span className="text-sm">{entry.event}</span>
                          {entry.time && (
                            <span className="text-xs text-gray-400 ml-auto shrink-0">{entry.time}</span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}