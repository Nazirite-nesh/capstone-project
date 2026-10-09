import { useEffect, useState } from 'react'
import {
  assignManager,
  getAllUsers,
  updateUserRole,
  type UserItem,
} from '../../api/services'
import { Btn, Card, Page, Table, Td, inputCls } from '../../components/ui'

export default function Users() {
  const [usersList, setUsersList] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<'employee' | 'manager' | 'admin'>('employee')
  const [editManagerId, setEditManagerId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsersList(data)
    } catch (err: any) {
      setError('Unable to load users list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const startEdit = (u: UserItem) => {
    setEditingUserId(u._id || u.id || '')
    setEditRole(u.role)
    setEditManagerId(
      typeof u.manager === 'object' && u.manager?._id ? u.manager._id : typeof u.manager === 'string' ? u.manager : ''
    )
  }

  const handleSaveUser = async (userId: string) => {
    try {
      setSaving(true)
      await updateUserRole(userId, editRole)
      if (editManagerId) {
        await assignManager(userId, editManagerId)
      }
      setEditingUserId(null)
      await fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user.')
    } finally {
      setSaving(false)
    }
  }

  const managers = usersList.filter((u) => u.role === 'manager' || u.role === 'admin')

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Page title="Users">
      <Card>
        <div className="mb-3.5 flex flex-wrap justify-between gap-2.5">
          <input
            aria-label="Search users"
            className={`${inputCls} max-w-65`}
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="py-4 text-sm text-muted">Loading users...</p>
        ) : error ? (
          <p className="py-4 text-sm text-no">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="py-4 text-sm text-muted">No users found.</p>
        ) : (
          <Table head={['Name', 'Email', 'Role', 'Manager', 'Actions']}>
            {filteredUsers.map((u) => {
              const uId = u._id || u.id || ''
              const isEditing = editingUserId === uId
              const managerName =
                typeof u.manager === 'object' && u.manager?.name
                  ? u.manager.name
                  : 'None'

              return (
                <tr key={uId}>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    {isEditing ? (
                      <select
                        className={`${inputCls} py-1 text-xs`}
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(e.target.value as 'employee' | 'manager' | 'admin')
                        }
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="capitalize">{u.role}</span>
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <select
                        className={`${inputCls} py-1 text-xs`}
                        value={editManagerId}
                        onChange={(e) => setEditManagerId(e.target.value)}
                      >
                        <option value="">Select Manager</option>
                        {managers.map((m) => (
                          <option key={m._id || m.id} value={m._id || m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    ) : (
                      managerName
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <Btn
                          variant="ok"
                          disabled={saving}
                          onClick={() => handleSaveUser(uId)}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Btn>
                        <Btn variant="ghost" onClick={() => setEditingUserId(null)}>
                          Cancel
                        </Btn>
                      </div>
                    ) : (
                      <Btn variant="ghost" onClick={() => startEdit(u)}>
                        Edit Role/Manager
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