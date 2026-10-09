import { useEffect, useState } from 'react'
import {
  cancelLeaveRequest,
  getMyLeaveRequests,
  type LeaveRequestItem,
} from '../../api/services'
import { Badge, Btn, Card, Page, Table, Td, inputCls } from '../../components/ui'
import { formatDateRange } from '../../lib/dateUtils'

export default function History() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [requests, setRequests] = useState<LeaveRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const paramStatus = statusFilter === 'All' ? undefined : statusFilter.toLowerCase()
      const data = await getMyLeaveRequests({ status: paramStatus, limit: 50 })
      setRequests(data.requests || [])
    } catch (err: any) {
      setError('Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [statusFilter])

  const handleCancel = async (id: string) => {
    try {
      setCancelingId(id)
      await cancelLeaveRequest(id)
      await fetchHistory()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unable to cancel leave request')
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <Page title="My history">
      <Card>
        <div className="mb-3.5 flex items-center gap-3">
          <select
            aria-label="Filter by status"
            className={`${inputCls} w-auto`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="py-4 text-sm text-muted">Loading history...</p>
        ) : error ? (
          <p className="py-4 text-sm text-no">{error}</p>
        ) : requests.length === 0 ? (
          <p className="py-4 text-sm text-muted">No leave requests found.</p>
        ) : (
          <Table head={['Type', 'Dates', 'Days', 'Status', 'Manager Comment', '']}>
            {requests.map((r) => {
              const typeName = typeof r.leaveType === 'object' ? r.leaveType.name : 'Leave'
              return (
                <tr key={r._id}>
                  <Td>{typeName}</Td>
                  <Td>{formatDateRange(r.startDate, r.endDate)}</Td>
                  <Td>{r.days}</Td>
                  <Td>
                    <Badge label={r.status} />
                  </Td>
                  <Td>{r.managerComment || '-'}</Td>
                  <Td>
                    {r.status === 'pending' && (
                      <Btn
                        variant="ghost"
                        disabled={cancelingId === r._id}
                        onClick={() => handleCancel(r._id)}
                      >
                        {cancelingId === r._id ? 'Canceling...' : 'Cancel'}
                      </Btn>
                    )}
                  </Td>
                </tr>
              )
            })}
          </Table>
        )}
      </Card>
    </Page>
  )
}
