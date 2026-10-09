import { Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/login';
import Signup from './pages/signup';
import Layout from './components/layout';
import ProtectedRoutes from './routes/ProtectedRoutes';
import EmployeeDashboard from './pages/employee/employee-dashboard';
import ApplyLeave from './pages/employee/apply-leave';
import History from './pages/employee/history';
import TeamOverview from './pages/manager/team-overview';
import Approvals from './pages/manager/approvals';
import TeamCalendar from './pages/manager/team-calender';
import CompanyOverview from './pages/admin/company-overview';
import Users from './pages/admin/users';
import { Policies } from './pages/admin/policies';
import { Reports } from './pages/admin/report';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route element={<ProtectedRoutes allowed={['employee', 'manager', 'admin']} />}>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/apply" element={<ApplyLeave />} />
            <Route path="/history" element={<History />} />
          </Route>
          <Route element={<ProtectedRoutes allowed={['manager']} />}>
            <Route path="/team" element={<TeamOverview />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/calendar" element={<TeamCalendar />} />
          </Route>
          <Route element={<ProtectedRoutes allowed={['admin']} />}>
            <Route path="/admin" element={<CompanyOverview />} />
            <Route path="/users" element={<Users />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App