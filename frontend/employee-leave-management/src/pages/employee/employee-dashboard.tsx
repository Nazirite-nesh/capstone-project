import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  cancelLeaveRequest,
  getMyLeaveBalance,
  getMyLeaveRequests,
  type LeaveBalanceItem,
  type LeaveRequestItem,
} from '../../api/services'
import { Badge, Btn, Card, Page, Stat, Stats, Table, Td, btn } from '../../components/ui'
import { formatDateRange } from '../../lib/dateUtils'

export default function EmployeeDashboard() {
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([])
  const [requests, setRequests] = useState<LeaveRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [balancesData, requestsData] = await Promise.all([
        getMyLeaveBalance(),
        getMyLeaveRequests({ limit: 10 }),
      ])
      setBalances(balancesData)
      setRequests(requestsData.requests || [])
    } catch (err: any) {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleCancel = async (id: string) => {
    try {
      setCancelingId(id)
      await cancelLeaveRequest(id)
      await loadDashboardData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel request')
    } finally {
      setCancelingId(null)
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  // Find next upcoming leave
  const nextLeave = requests
    .filter((r) => r.status === 'approved' || r.status === 'pending')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

  return (
    <Page title="Dashboard">
      {loading ? (
        <Card>
          <p className="py-4 text-sm text-muted">Loading dashboard data...</p>
        </Card>
      ) : error ? (
        <Card>
          <p className="py-4 text-sm text-no">{error}</p>
        </Card>
      ) : (
        <>
          <Stats>
            {balances.map((b) => (
              <Stat
                key={b.leaveType}
                value={String(b.remaining)}
                label={`${b.leaveType} days left`}
                progress={b.allocated > 0 ? Math.round((b.remaining / b.allocated) * 100) : 0}
              />
            ))}
            <Stat value={String(pendingCount)} label="Request pending" />
          </Stats>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Card title="Recent requests">
              {requests.length === 0 ? (
                <p className="py-4 text-sm text-muted">No leave requests found.</p>
              ) : (
                <Table head={['Type', 'Dates', 'Days', 'Status', '']}>
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

            <Card title="Next leave">
              {nextLeave ? (
                <>
                  <p className="text-[22px] font-bold">
                    {formatDateRange(nextLeave.startDate, nextLeave.endDate)}
                  </p>
                  <p className="mb-4 text-muted">
                    {typeof nextLeave.leaveType === 'object' ? nextLeave.leaveType.name : 'Leave'} · status:{' '}
                    <span className="font-semibold">{nextLeave.status}</span>
                  </p>
                </>
              ) : (
                <p className="mb-4 text-muted">No upcoming leave scheduled.</p>
              )}
              <Link to="/apply" className={btn()}>
                Apply for leave
              </Link>
            </Card>
          </div>
        </>
      )}
    </Page>
  )
}