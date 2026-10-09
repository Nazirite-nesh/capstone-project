import { useEffect, useState } from 'react'
import {
  createLeaveType,
  deleteLeaveType,
  getLeaveTypes,
  updateLeaveType,
  type LeaveTypeItem,
} from '../../api/services'
import { Btn, Card, Field, Page, Table, Td, btn, inputCls } from '../../components/ui'

export function Policies() {
  const [types, setTypes] = useState<LeaveTypeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [days, setDays] = useState(20)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      const data = await getLeaveTypes()
      setTypes(data)
    } catch (err: any) {
      setError('Failed to fetch leave policies.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setSubmitting(true)
      await createLeaveType({
        name: name.trim(),
        defaultDaysAllowed: Number(days),
        description,
      })
      setName('')
      setDays(20)
      setDescription('')
      setShowAddForm(false)
      await fetchPolicies()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create leave type.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (t: LeaveTypeItem) => {
    setEditingId(t._id)
    setName(t.name)
    setDays(t.defaultDaysAllowed)
    setDescription(t.description || '')
  }

  const handleUpdate = async (id: string) => {
    try {
      setSubmitting(true)
      await updateLeaveType(id, {
        name: name.trim(),
        defaultDaysAllowed: Number(days),
        description,
      })
      setEditingId(null)
      setName('')
      setDays(20)
      setDescription('')
      await fetchPolicies()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update leave type.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave type?')) return
    try {
      await deleteLeaveType(id)
      await fetchPolicies()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete leave type.')
    }
  }

  return (
    <Page title="Leave policies">
      <Card title="Leave types">
        {loading ? (
          <p className="py-4 text-sm text-muted">Loading leave types...</p>
        ) : error ? (
          <p className="py-4 text-sm text-no">{error}</p>
        ) : (
          <Table head={['Type', 'Default Days per year', 'Description', 'Actions']}>
            {types.map((t) => {
              const isEditing = editingId === t._id
              return (
                <tr key={t._id}>
                  <Td>
                    {isEditing ? (
                      <input
                        className={inputCls}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    ) : (
                      t.name
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <input
                        type="number"
                        className={inputCls}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                      />
                    ) : (
                      t.defaultDaysAllowed
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <input
                        className={inputCls}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    ) : (
                      t.description || '-'
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <Btn variant="ok" disabled={submitting} onClick={() => handleUpdate(t._id)}>
                          Save
                        </Btn>
                        <Btn variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Btn>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <Btn variant="ghost" onClick={() => handleStartEdit(t)}>
                          Edit
                        </Btn>
                        <Btn variant="no" onClick={() => handleDelete(t._id)}>
                          Delete
                        </Btn>
                      </div>
                    )}
                  </Td>
                </tr>
              )
            })}
          </Table>
        )}

        {showAddForm ? (
          <form onSubmit={handleCreate} className="mt-4 grid gap-3.5 rounded-lg border border-line p-4 sm:grid-cols-2">
            <h3 className="text-base font-semibold sm:col-span-2">Add New Leave Type</h3>
            <Field label="Leave Type Name" id="lt-name">
              <input
                id="lt-name"
                required
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Parental Leave"
              />
            </Field>

            <Field label="Days Allowed Per Year" id="lt-days">
              <input
                id="lt-days"
                type="number"
                required
                min={1}
                className={inputCls}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </Field>

            <Field label="Description" id="lt-desc" full>
              <input
                id="lt-desc"
                className={inputCls}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </Field>

            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className={btn()} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Leave Type'}
              </button>
              <Btn variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Btn>
            </div>
          </form>
        ) : (
          <div className="mt-3.5">
            <Btn onClick={() => { setShowAddForm(true); setEditingId(null); setName(''); setDays(20); setDescription(''); }}>
              Add leave type
            </Btn>
          </div>
        )}
      </Card>
    </Page>
  )
}
