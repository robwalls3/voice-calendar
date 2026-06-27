import DayView from '@/components/calendar/DayView'

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  return (
    <main className="min-h-screen p-8">
      <DayView date={date} />
    </main>
  )
}