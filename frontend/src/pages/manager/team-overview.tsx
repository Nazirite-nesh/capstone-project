import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  getMyLeaveBalance,
  getTeamLeaveRequests,
  type LeaveBalanceItem,
  type LeaveRequestItem,
} from '../../api/services'
import { Badge, Card, Page, Stat, Stats, Table, Td, btn } from '../../components/ui'
import { formatDateRange } from '../../lib/dateUtils'

export default function TeamOverview() {
  const [teamRequests, setTeamRequests] = useState<LeaveRequestItem[]>([])
  const [myBalances, setMyBalances] = useState<LeaveBalanceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true)
        const [requestsData, balancesData] = await Promise.all([
          getTeamLeaveRequests({ limit: 50 }),
          getMyLeaveBalance(),
        ])
        setTeamRequests(requestsData.requests || [])
        setMyBalances(balancesData)
      } catch (err: any) {
        console.error('Failed to load team overview data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTeamData()
  }, [])

  const pendingCount = teamRequests.filter((r) => r.status === 'pending').length

  const todayStr = new Date().toISOString().split('T')[0]
  const outTodayCount = teamRequests.filter((r) => {
    if (r.status !== 'approved') return false
    const s = r.startDate.split('T')[0]
    const e = r.endDate.split('T')[0]
    return todayStr >= s && todayStr <= e
  }).length

  const annualBalance = myBalances.find(
    (b) => b.leaveType.toLowerCase().includes('annual')
  )?.remaining || 0

  return (
    <Page title="Team overview">
      {loading ? (
        <Card>
          <p className="py-4 text-sm text-muted">Loading team overview...</p>
        </Card>
      ) : (
        <>
          <Stats>
            <Stat value={String(pendingCount)} label="Requests to review" />
            <Stat value={String(outTodayCount)} label="Team members out today" />
            <Stat value={String(teamRequests.length)} label="Total team requests" />
            <Stat value={String(annualBalance)} label="Your annual days left" />
          </Stats>

          <Card title="Team leave requests">
            {teamRequests.length === 0 ? (
              <p className="py-4 text-sm text-muted">No team leave requests found.</p>
            ) : (
              <Table head={['Employee', 'Leave type', 'Dates', 'Days', 'Status']}>
                {teamRequests.map((r) => {
                  const empName = typeof r.employee === 'object' ? r.employee.name : 'Team Member'
                  const typeName = typeof r.leaveType === 'object' ? r.leaveType.name : 'Leave'
                  return (
                    <tr key={r._id}>
                      <Td>{empName}</Td>
                      <Td>{typeName}</Td>
                      <Td>{formatDateRange(r.startDate, r.endDate)}</Td>
                      <Td>{r.days}</Td>
                      <Td>
                        <Badge label={r.status} />
                      </Td>
                    </tr>
                  )
                })}
              </Table>
            )}

            <Link to="/approvals" className={`${btn()} mt-3.5`}>
              Review requests ({pendingCount})
            </Link>
          </Card>
        </>
      )}
    </Page>
  )
}
