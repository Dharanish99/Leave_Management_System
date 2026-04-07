import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { RoleRedirect } from './RoleRedirect';
import { AppShell } from '../layouts/AppShell';
import { SuspenseLoader } from '../components/shared';

// Lazy Load Feature pages
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import('../features/auth/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AuditLogPage = lazy(() => import('../features/auth/AuditLogPage').then((m) => ({ default: m.AuditLogPage })));
const StudentDashboard = lazy(() => import('../features/dashboard/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const StaffDashboard = lazy(() => import('../features/dashboard/staff/StaffDashboard').then((m) => ({ default: m.StaffDashboard })));
const HoDDashboard = lazy(() => import('../features/dashboard/hod/HoDDashboard').then((m) => ({ default: m.HoDDashboard })));
const PrincipalDashboard = lazy(() => import('../features/dashboard/principal/PrincipalDashboard').then((m) => ({ default: m.PrincipalDashboard })));
const LeaveApplicationPage = lazy(() => import('../features/leaves/LeaveApplicationPage').then((m) => ({ default: m.LeaveApplicationPage })));
const MyLeavesPage = lazy(() => import('../features/leaves/MyLeavesPage').then((m) => ({ default: m.MyLeavesPage })));
const LeaveReviewPage = lazy(() => import('../features/leaves/LeaveReviewPage').then((m) => ({ default: m.LeaveReviewPage })));
const UserManagementPage = lazy(() => import('../features/users/UserManagementPage').then((m) => ({ default: m.UserManagementPage })));
const AddUserPage = lazy(() => import('../features/users/AddUserPage').then((m) => ({ default: m.AddUserPage })));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Public route
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Root → role-based redirect
          {
            index: true,
            element: <RoleRedirect />,
          },

          // ── Dashboards ──
          {
            path: 'dashboard/student',
            element: <RoleRoute allowedRoles={['student']} />,
            children: [{ index: true, element: withSuspense(StudentDashboard) }],
          },
          {
            path: 'dashboard/staff',
            element: <RoleRoute allowedRoles={['staff']} />,
            children: [{ index: true, element: withSuspense(StaffDashboard) }],
          },
          {
            path: 'dashboard/hod',
            element: <RoleRoute allowedRoles={['hod']} />,
            children: [{ index: true, element: withSuspense(HoDDashboard) }],
          },
          {
            path: 'dashboard/principal',
            element: <RoleRoute allowedRoles={['principal']} />,
            children: [{ index: true, element: withSuspense(PrincipalDashboard) }],
          },

          // ── Leaves ──
          {
            path: 'leaves/apply',
            element: <RoleRoute allowedRoles={['staff', 'student']} />,
            children: [{ index: true, element: withSuspense(LeaveApplicationPage) }],
          },
          {
            path: 'leaves/my',
            element: <RoleRoute allowedRoles={['staff', 'student']} />,
            children: [{ index: true, element: withSuspense(MyLeavesPage) }],
          },
          {
            path: 'leaves/review',
            element: <RoleRoute allowedRoles={['hod', 'principal']} />,
            children: [{ index: true, element: withSuspense(LeaveReviewPage) }],
          },

          // ── Users ──
          {
            path: 'users',
            element: <RoleRoute allowedRoles={['principal', 'hod']} />,
            children: [{ index: true, element: withSuspense(UserManagementPage) }],
          },
          {
            path: 'users/add',
            element: <RoleRoute allowedRoles={['principal', 'hod']} />,
            children: [{ index: true, element: withSuspense(AddUserPage) }],
          },
          {
            path: 'users/edit/:id',
            element: <RoleRoute allowedRoles={['principal', 'hod']} />,
            children: [{ index: true, element: withSuspense(AddUserPage) }],
          },

          // ── Notifications ──
          {
            path: 'notifications',
            element: withSuspense(NotificationsPage),
          },

          // ── Profile ──
          {
            path: 'profile',
            element: withSuspense(ProfilePage),
          },

          // ── Audit ──
          {
            path: 'audit',
            element: <RoleRoute allowedRoles={['principal']} />,
            children: [{ index: true, element: withSuspense(AuditLogPage) }],
          },

          // Catch-all → redirect to root
          {
            path: '*',
            element: <Navigate to="/" replace />,
          },
        ],
      },
    ],
  },
]);
