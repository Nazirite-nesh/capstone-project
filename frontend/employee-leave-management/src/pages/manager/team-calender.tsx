import { useEffect, useState } from 'react'
import { getTeamLeaveRequests, type LeaveRequestItem } from '../../api/services'
import { Card, Page } from '../../components/ui'

export default function TeamCalendar() {
  const [approvedRequests, setApprovedRequests] = useState<LeaveRequestItem[]>([])
  const [loading, setLoading] = useState(true)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' })

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true)
        const data = await getTeamLeaveRequests({ status: 'approved', limit: 100 })
        setApprovedRequests(data.requests || [])
      } catch (err: any) {
        console.error('Error fetching calendar data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCalendarData()
  }, [])

  // Calculate days in current month that have team leave
  const awayDays = new Set<number>()
  approvedRequests.forEach((req) => {
    const start = new Date(req.startDate)
    const end = new Date(req.endDate)
    const cur = new Date(start)

    while (cur <= end) {
      if (cur.getMonth() === currentMonth && cur.getFullYear() === currentYear) {
        awayDays.add(cur.getDate())
      }
      cur.setDate(cur.getDate() + 1)
    }
  })

  // Calendar setup for the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  // Adjust so Monday is 0
  const blankDays = (firstDayOfMonth + 6) % 7
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  return (
    <Page title="Team calendar">
      <Card title={`${monthName} ${currentYear}`}>
        {loading ? (
          <p className="py-4 text-sm text-muted">Loading calendar...</p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-[13px]">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <span key={d} className="py-2 font-semibold text-muted">
                  {d}
                </span>
              ))}
              {Array.from({ length: blankDays }, (_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isAway = awayDays.has(day)
                const isToday = day === currentDate.getDate()

                return (
                  <span
                    key={day}
                    className={`rounded-md py-2 text-sm font-medium ${
                      isToday
                        ? 'bg-pendBg font-bold text-pend ring-1 ring-pend'
                        : isAway
                        ? 'bg-accentSoft font-bold text-accent'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
            <p className="mt-4 text-sm text-muted">
              Blue highlight: Team member on approved leave. Amber highlight: Today.
            </p>
          </>
        )}
      </Card>
    </Page>
  )
}