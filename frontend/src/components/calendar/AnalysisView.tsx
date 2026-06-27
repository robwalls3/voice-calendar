'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import { getEntriesByMonth } from '@/lib/api'
import type { Entry } from '@/types/entry'

const subjectColors: Record<string, string> = {
  daisy: 'text-purple-700',
  rob: 'text-blue-700',
  meredith: 'text-green-700',
  house: 'text-amber-700'
}

export default function AnalysisView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const month = format(currentDate, 'yyyy-MM')

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', month],
    queryFn: () => getEntriesByMonth(month)
  })

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  // build unique columns from subject:event combos
  const columns = Array.from(
    new Set(entries.map((e: Entry) => `${e.subject}:${e.event}`))
  ).sort()

  // build pivot table
  const pivot = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayEntries = entries.filter((e: Entry) => e.date === dateStr)
    const counts: Record<string, number> = {}
    for (const col of columns) {
      const [subject, event] = col.split(':')
      counts[col] = dayEntries.filter(
        (e: Entry) => e.subject === subject && e.event === event
      ).length
    }
    return { date: dateStr, counts }
  }).filter(row => Object.values(row.counts).some(v => v > 0))

  function exportCSV() {
    const header = ['date', ...columns].join(',')
    const rows = pivot.map(row =>
      [row.date, ...columns.map(col => row.counts[col] ?? 0)].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">{format(currentDate, 'MMMM yyyy')} — Analysis</h1>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">←</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">This month</button>
          <button onClick={nextMonth} className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">→</button>
          <button
            onClick={exportCSV}
            className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 text-sm font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-gray-400 py-12 text-center">No entries this month</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr>
                <th className="text-left p-2 border border-gray-100 bg-gray-50 sticky left-0 font-medium text-gray-500 min-w-28">
                  Date
                </th>
                {columns.map(col => {
                  const [subject, event] = col.split(':')
                  return (
                    <th key={col} className="p-2 border border-gray-100 bg-gray-50 font-medium min-w-24">
                      <span className={`block text-xs ${subjectColors[subject] ?? 'text-gray-600'}`}>
                        {subject}
                      </span>
                      <span className="text-gray-600 font-normal">{event}</span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {pivot.map(row => (
                <tr key={row.date} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-100 sticky left-0 bg-white text-gray-500 font-medium">
                    {format(parseISO(row.date), 'MMM d')}
                  </td>
                  {columns.map(col => (
                    <td key={col} className="p-2 border border-gray-100 text-center">
                      {row.counts[col] > 0 ? (
                        <span className="font-medium text-gray-800">{row.counts[col]}</span>
                      ) : (
                        <span className="text-gray-200">0</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}