import { useEffect, useState } from 'react'
import { getTeamLeaveRequests, type LeaveRequestItem } from '../../api/services'
import { Btn, Card, Page } from '../../components/ui'

export function Reports() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true)
        const data = await getTeamLeaveRequests({ limit: 100 })
        setRequests(data.requests || [])
      } catch (err) {
        console.error('Failed to load report data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReportData()
  }, [])

  // Aggregate days taken by leave type
  const typeDaysMap: Record<string, number> = {}
  requests.forEach((r) => {
    if (r.status === 'approved') {
      const typeName = typeof r.leaveType === 'object' ? r.leaveType.name : 'Other'
      typeDaysMap[typeName] = (typeDaysMap[typeName] || 0) + (r.days || 0)
    }
  })

  const reportItems = Object.entries(typeDaysMap).map(([name, days]) => ({ name, days }))
  const maxDays = Math.max(...reportItems.map((d) => d.days), 1)

  const exportCSV = () => {
    const headers = 'Employee,Leave Type,Start Date,End Date,Days,Status,Reason\n'
    const rows = requests
      .map((r) => {
        const empName = typeof r.employee === 'object' ? r.employee.name : ''
        const typeName = typeof r.leaveType === 'object' ? r.leaveType.name : ''
        return `"${empName}","${typeName}","${r.startDate}","${r.endDate}",${r.days},"${r.status}","${r.reason || ''}"`
      })
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'leave_report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Page title="Reports">
      <Card title="Days taken by leave type (Approved)">
        {loading ? (
          <p className="py-4 text-sm text-muted">Loading report data...</p>
        ) : reportItems.length === 0 ? (
          <p className="py-4 text-sm text-muted">No approved leave data available yet.</p>
        ) : (
          reportItems.map((d) => (
            <div key={d.name} className="mb-2 flex items-center gap-2 text-sm">
              <span className="w-32 text-muted truncate">{d.name}</span>
              <div className="h-3.5 flex-1 overflow-hidden rounded bg-line">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(d.days / maxDays) * 100}%` }}
                />
              </div>
              <span className="font-semibold">{d.days} day(s)</span>
            </div>
          ))
        )}

        <div className="mt-4">
          <Btn variant="ghost" onClick={exportCSV} disabled={requests.length === 0}>
            Export CSV
          </Btn>
        </div>
      </Card>
    </Page>
  )
}