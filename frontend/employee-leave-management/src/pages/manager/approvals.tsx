import { useEffect, useState } from 'react'
import {
  approveLeaveRequest,
  getTeamLeaveRequests,
  rejectLeaveRequest,
  type LeaveRequestItem,
} from '../../api/services'
import { Btn, Card, Page, inputCls } from '../../components/ui'
import { formatDateRange } from '../../lib/dateUtils'

export default function Approvals() {
  const [items, setItems] = useState<LeaveRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, string>>({})

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const data = await getTeamLeaveRequests({ status: 'pending', limit: 50 })
      setItems(data.requests || [])
    } catch (err: any) {
      setNote('Unable to load team leave requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const handleDecision = async (id: string, decision: 'Approved' | 'Rejected') => {
    const item = items.find((i) => i._id === id)
    const empName = typeof item?.employee === 'object' ? item.employee.name : 'Employee'
    const comment = comments[id] || ''

    try {
      setActionId(id)
      if (decision === 'Approved') {
        await approveLeaveRequest(id, comment)
      } else {
        await rejectLeaveRequest(id, comment)
      }
      setItems((prev) => prev.filter((i) => i._id !== id))
      setNote(`${empName}'s request was ${decision.toLowerCase()}.`)
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${decision.toLowerCase()} request.`)
    } finally {
      setActionId(null)
    }
  }

  return (
    <Page title="Approvals">
      <Card title="Waiting for your decision">
        {note && <p role="status" className="mb-3 text-sm text-ok font-semibold">{note}</p>}

        {loading ? (
          <p className="py-4 text-sm text-muted">Loading pending approvals...</p>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-muted">
            No requests waiting. New requests from your team appear here.
          </p>
        ) : (
          items.map((i) => {
            const empName = typeof i.employee === 'object' ? i.employee.name : 'Team Member'
            const typeName = typeof i.leaveType === 'object' ? i.leaveType.name : 'Leave'
            const isProcessing = actionId === i._id

            return (
              <div
                key={i._id}
                className="flex flex-col gap-3 border-b border-line py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <b>{empName}</b> · {typeName}
                  <small className="block text-muted mt-0.5">
                    {formatDateRange(i.startDate, i.endDate)} · {i.days} day(s) · &ldquo;{i.reason}&rdquo;
                  </small>
                  <input
                    type="text"
                    placeholder="Add comment (optional)"
                    className={`${inputCls} mt-2 max-w-md py-1.5 text-xs`}
                    value={comments[i._id] || ''}
                    onChange={(e) =>
                      setComments({ ...comments, [i._id]: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                  <Btn
                    variant="ok"
                    disabled={isProcessing}
                    onClick={() => handleDecision(i._id, 'Approved')}
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </Btn>
                  <Btn
                    variant="no"
                    disabled={isProcessing}
                    onClick={() => handleDecision(i._id, 'Rejected')}
                  >
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </Btn>
                </div>
              </div>
            )
          })
        )}
      </Card>
    </Page>
  )
}