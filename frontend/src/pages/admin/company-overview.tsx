import { useEffect, useState } from 'react'
import {
  getAllUsers,
  getLeaveTypes,
  getTeamLeaveRequests,
} from '../../api/services'
import { Card, Page, Stat, Stats, Table, Td } from '../../components/ui'
import { holidays } from '../../lib/data'

export default function CompanyOverview() {
  const [employeeCount, setEmployeeCount] = useState<number>(0)
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0)
  const [leaveTypesCount, setLeaveTypesCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true)
        const [users, requests, leaveTypes] = await Promise.all([
          getAllUsers().catch(() => []),
          getTeamLeaveRequests({ status: 'pending' }).catch(() => ({ requests: [] })),
          getLeaveTypes().catch(() => []),
        ])

        setEmployeeCount(users.length)
        setPendingRequestsCount(requests.requests ? requests.requests.length : 0)
        setLeaveTypesCount(leaveTypes.length)
      } catch (err) {
        console.error('Failed to load company overview:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [])

  return (
    <Page title="Company overview">
      {loading ? (
        <Card>
          <p className="py-4 text-sm text-muted">Loading overview data...</p>
        </Card>
      ) : (
        <>
          <Stats>
            <Stat value={String(employeeCount)} label="Total Employees" />
            <Stat value={String(pendingRequestsCount)} label="Pending Requests" />
            <Stat value={String(leaveTypesCount)} label="Active Leave Types" />
          </Stats>

          <Card title="Upcoming public holidays">
            <Table head={['Date', 'Holiday']}>
              {holidays.map((h) => (
                <tr key={h.date}>
                  <Td>{h.date}</Td>
                  <Td>{h.name}</Td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}
    </Page>
  )
}