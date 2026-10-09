import api from './axios'

export interface LeaveBalanceItem {
  leaveTypeId: string
  leaveType: string
  allocated: number
  used: number
  remaining: number
}

export interface LeaveTypeItem {
  _id: string
  name: string
  defaultDaysAllowed: number
  description?: string
}

export interface LeaveRequestItem {
  _id: string
  employee?: string | { _id: string; name: string; email: string }
  leaveType: { _id: string; name: string } | string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  managerComment?: string
  reviewedBy?: string
  createdAt: string
}

export interface Pagination {
  currentPage: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

export interface UserItem {
  _id: string
  id?: string
  name: string
  email: string
  role: 'employee' | 'manager' | 'admin'
  manager?: { _id: string; name: string; email: string } | null
}

// Leave Balance APIs
export const getMyLeaveBalance = async (): Promise<LeaveBalanceItem[]> => {
  const res = await api.get('/leave-balance/me')
  return res.data.data
}

// Leave Type APIs
export const getLeaveTypes = async (): Promise<LeaveTypeItem[]> => {
  const res = await api.get('/leave-types')
  return res.data.data
}

export const createLeaveType = async (payload: {
  name: string
  defaultDaysAllowed: number
  description?: string
}): Promise<LeaveTypeItem> => {
  const res = await api.post('/leave-types', payload)
  return res.data.data
}

export const updateLeaveType = async (
  id: string,
  payload: Partial<{ name: string; defaultDaysAllowed: number; description: string }>
): Promise<LeaveTypeItem> => {
  const res = await api.put(`/leave-types/${id}`, payload)
  return res.data.data
}

export const deleteLeaveType = async (id: string): Promise<void> => {
  await api.delete(`/leave-types/${id}`)
}

// Employee Leave Request APIs
export const getMyLeaveRequests = async (params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{ requests: LeaveRequestItem[]; pagination: Pagination }> => {
  const res = await api.get('/leave-requests/me', { params })
  return res.data.data
}

export const createLeaveRequest = async (payload: {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}): Promise<LeaveRequestItem> => {
  const res = await api.post('/leave-requests', payload)
  return res.data.data
}

export const cancelLeaveRequest = async (id: string): Promise<LeaveRequestItem> => {
  const res = await api.delete(`/leave-requests/${id}`)
  return res.data.data
}

// Manager APIs
export const getTeamLeaveRequests = async (params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{ requests: LeaveRequestItem[]; pagination: Pagination }> => {
  const res = await api.get('/manager/leave-requests', { params })
  return res.data.data
}

export const approveLeaveRequest = async (
  id: string,
  managerComment?: string
): Promise<LeaveRequestItem> => {
  const res = await api.put(`/manager/leave-requests/${id}/approve`, {
    managerComment: managerComment || '',
  })
  return res.data.data
}

export const rejectLeaveRequest = async (
  id: string,
  managerComment?: string
): Promise<LeaveRequestItem> => {
  const res = await api.put(`/manager/leave-requests/${id}/reject`, {
    managerComment: managerComment || '',
  })
  return res.data.data
}

// Admin Users APIs
export const getAllUsers = async (): Promise<UserItem[]> => {
  const res = await api.get('/admin/users')
  return res.data.data
}

export const assignManager = async (
  userId: string,
  managerId: string
): Promise<UserItem> => {
  const res = await api.put(`/admin/users/${userId}/assign-manager`, { managerId })
  return res.data.data
}

export const updateUserRole = async (
  userId: string,
  role: 'employee' | 'manager' | 'admin'
): Promise<UserItem> => {
  const res = await api.put(`/admin/users/${userId}/role`, { role })
  return res.data.data
}