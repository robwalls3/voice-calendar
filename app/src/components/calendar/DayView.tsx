'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { getEntriesByMonth, deleteEntry } from '@/lib/api'
import type { Entry } from '@/types/entry'
import Link from 'next/link'

const subjectColors: Record<string, string> = {
  daisy: 'bg-purple-100 text-purple-800',
  rob: 'bg-blue-100 text-blue-800',
  meredith: 'bg-green-100 text-green-800',
  house: 'bg-amber-100 text-amber-800',
}

export default function DayView({ date }: { date: string }) {
  const month = date.slice(0, 7)
  const queryClient = useQueryClient()

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', month],
    queryFn: () => getEntriesByMonth(month),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entries', month],
      })
    },
  })

  const dayEntries = entries.filter((e: Entry) => e.date === date)
  const parsed = parseISO(date)

  function handleDelete(id: number) {
    if (!confirm('Delete this entry?')) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <h1 className="text-2xl font-medium">
          {format(parsed, 'EEEE, MMMM d yyyy')}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : dayEntries.length === 0 ? (
        <div className="text-gray-400 py-12 text-center">
          No entries this day
        </div>
      ) : (
        <div className="space-y-3">
          {dayEntries
            .sort((a: Entry, b: Entry) =>
              (a.time ?? '').localeCompare(b.time ?? '')
            )
            .map((entry: Entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        subjectColors[entry.subject] ??
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {entry.subject}
                    </span>

                    <p className="mt-2 font-medium">{entry.event}</p>

                    {entry.time && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        {entry.time}
                      </p>
                    )}

                    {entry.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}