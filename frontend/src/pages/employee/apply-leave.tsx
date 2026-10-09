import { useEffect, useState, type FormEvent } from 'react'
import {
  createLeaveRequest,
  getLeaveTypes,
  getMyLeaveBalance,
  type LeaveBalanceItem,
  type LeaveTypeItem,
} from '../../api/services'
import { Btn, Card, Field, Page, btn, inputCls } from '../../components/ui'

function calculateDaysInclusive(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr)
  const end = new Date(endStr)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export default function ApplyLeave() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeItem[]>([])
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([])
  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  
  const today = new Date().toISOString().split('T')[0]
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [reason, setReason] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [typesData, balancesData] = await Promise.all([
          getLeaveTypes(),
          getMyLeaveBalance(),
        ])
        setLeaveTypes(typesData)
        setBalances(balancesData)
        if (typesData.length > 0) {
          setSelectedTypeId(typesData[0]._id)
        }
      } catch (err: any) {
        setApiError('Failed to load leave types or balances')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const selectedTypeObj = leaveTypes.find((t) => t._id === selectedTypeId)
  const selectedBalanceObj = balances.find(
    (b) => b.leaveType.toLowerCase() === (selectedTypeObj?.name || '').toLowerCase()
  )

  const balanceAvailable = selectedBalanceObj ? selectedBalanceObj.remaining : selectedTypeObj?.defaultDaysAllowed || 0
  const daysRequested = calculateDaysInclusive(start, end)

  let validationError = ''
  if (!start || !end) {
    validationError = 'Please select valid start and end dates.'
  } else if (end < start) {
    validationError = 'End date must be on or after the start date.'
  } else if (daysRequested > balanceAvailable) {
    validationError = `You requested ${daysRequested} days, but only have ${balanceAvailable} days available.`
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (validationError || !selectedTypeId) return

    setSubmitting(true)
    setApiError('')

    try {
      await createLeaveRequest({
        leaveType: selectedTypeId,
        startDate: start,
        endDate: end,
        reason,
      })
      setSent(true)
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || 'Unable to submit leave request. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Page title="Apply for leave">
      <Card>
        {loading ? (
          <p className="py-4 text-sm text-muted">Loading leave types and balances...</p>
        ) : sent ? (
          <div className="py-4">
            <p role="status" className="mb-3 text-ok font-semibold">
              Request submitted successfully! Your manager will be notified.
            </p>
            <Btn onClick={() => { setSent(false); setReason(''); }}>Submit another request</Btn>
          </div>
        ) : (
          <form className="grid gap-3.5 sm:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="Leave type" id="type">
              <select
                id="type"
                className={inputCls}
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
              >
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Balance" id="bal">
              <input
                id="bal"
                className={inputCls}
                value={`${balanceAvailable} days available`}
                disabled
              />
            </Field>

            <Field label="Start date" id="start">
              <input
                id="start"
                type="date"
                className={inputCls}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>

            <Field label="End date" id="end">
              <input
                id="end"
                type="date"
                className={inputCls}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>

            <div className="rounded-[10px] bg-accentSoft p-3.5 text-sm sm:col-span-2">
              {validationError ? (
                <span className="text-no">{validationError}</span>
              ) : (
                <>
                  Days requested:{' '}
                  <b className="text-accent">{daysRequested}</b> day(s). Balance after approval:{' '}
                  <b className="text-accent">{balanceAvailable - daysRequested} day(s)</b>.
                </>
              )}
            </div>

            <Field label="Reason" id="reason" full>
              <textarea
                id="reason"
                rows={3}
                className={inputCls}
                placeholder="Add a short note for your manager"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>

            {apiError && (
              <p role="alert" className="text-sm text-no sm:col-span-2">
                {apiError}
              </p>
            )}

            <div className="flex gap-2.5 sm:col-span-2">
              <button
                type="submit"
                className={`${btn()} disabled:opacity-50`}
                disabled={!!validationError || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </Page>
  )
}
