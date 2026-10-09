export type Role = 'employee' | 'manager' | 'admin'
export type Status = 'Pending' | 'Approved' | 'Rejected'

export interface LeaveRequest {
  id: number
  type: string
  dates: string
  days: number
  status: Status
}

export const roleLabel: Record<Role, string> = { employee: 'Employee', manager: 'Manager', admin: 'Admin (HR)' }

export const homePath: Record<Role, string> = { employee: '/dashboard', manager: '/team', admin: '/admin' }

export const menu: Record<Role, { path: string; label: string }[]> = {
  employee: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/apply', label: 'Apply for leave' },
    { path: '/history', label: 'My history' },
  ],
  manager: [
    { path: '/team', label: 'Team overview' },
    { path: '/approvals', label: 'Approvals (3)' },
    { path: '/calendar', label: 'Team calendar' },
    { path: '/apply', label: 'Apply for leave' },
    { path: '/history', label: 'My history' },
  ],
  admin: [
    { path: '/admin', label: 'Company overview' },
    { path: '/users', label: 'Users' },
    { path: '/policies', label: 'Leave policies' },
    { path: '/reports', label: 'Reports' },
  ],
}

export const myRequests: LeaveRequest[] = [
  { id: 1, type: 'Annual', dates: '12–16 Oct', days: 5, status: 'Pending' },
  { id: 2, type: 'Sick', dates: '3 Sep', days: 1, status: 'Approved' },
  { id: 3, type: 'Personal', dates: '18 Aug', days: 1, status: 'Rejected' },
  { id: 4, type: 'Annual', dates: '1–5 Jul', days: 5, status: 'Approved' },
]

export const pendingApprovals = [
  { id: 1, name: 'Chidi Eze', type: 'Annual leave', dates: '20–24 Oct', days: 5, reason: 'Family wedding in Enugu' },
  { id: 2, name: 'Ngozi Ade', type: 'Sick leave', dates: '2–3 Oct', days: 2, reason: "Doctor's appointment and recovery" },
  { id: 3, name: 'Bola Johnson', type: 'Personal leave', dates: '9 Oct', days: 1, reason: 'Moving house' },
]

export const team = [
  { name: 'Chidi Eze', status: 'In office', next: '20–24 Oct', left: 9 },
  { name: 'Ngozi Ade', status: 'On leave', next: 'Today–3 Oct', left: 4 },
  { name: 'Bola Johnson', status: 'In office', next: '9 Oct', left: 11 },
  { name: 'Kemi Alabi', status: 'On leave', next: 'Today–2 Oct', left: 7 },
]

export const users = [
  { name: 'Amara Okafor', role: 'Employee', dept: 'Engineering', manager: 'Tunde Bello' },
  { name: 'Tunde Bello', role: 'Manager', dept: 'Engineering', manager: 'Ifeoma Nwosu' },
  { name: 'Chidi Eze', role: 'Employee', dept: 'Engineering', manager: 'Tunde Bello' },
  { name: 'Ifeoma Nwosu', role: 'Admin', dept: 'HR', manager: 'None' },
]

export const leaveTypes = [
  { name: 'Annual', days: 20, approval: 'Yes', carry: '5 days' },
  { name: 'Sick', days: 10, approval: 'Yes', carry: 'No' },
  { name: 'Personal', days: 5, approval: 'Yes', carry: 'No' },
]

export const holidays = [
  { date: '1 Oct', name: 'Independence Day' },
  { date: '25 Dec', name: 'Christmas Day' },
  { date: '26 Dec', name: 'Boxing Day' },
]

export const departments = [
  { name: 'Engineering', days: 312 },
  { name: 'Sales', days: 220 },
  { name: 'Operations', days: 168 },
  { name: 'HR', days: 80 },
]