import { createBrowserRouter } from "react-router-dom";

import { RootLayout } from "@/layouts/root-layout";
import { AnalyticsPage } from "@/pages/analytics/analytics-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { LoginPage } from "@/pages/auth/login-page";
import { ChangePasswordPage } from "@/pages/auth/change-password-page";
import { RequestAccessPage } from "@/pages/auth/request-access-page";
import { NotFoundPage } from "@/pages/not-found/not-found-page";
import { SettingsPage } from "@/pages/settings/settings-page";
import KycManagement from "@/pages/kyc-management/kyc-management";
import UserManagement from "@/pages/user-management/user-management";
import UserManagementDetailsPage from "@/pages/user-management/user-details-page";
import Notifications from "@/pages/notifications/notifications";
import ContributionsAndAllocations from "@/pages/contributions-and-allocations/contributions-and-allocations";
import CADetailsPage from "@/pages/contributions-and-allocations/ca-details-page";
import { ProtectedRoute } from "@/components/auth/protected-route";
import PodsManagementPage from "@/pages/pods-management/pods-management";
import PodDetailsPage from "@/pages/pods-management/pod-details-page";
import PodPlansManagementPage from "@/pages/pod-plans-management/pod-plans-management";
import RolesManagementPage from "@/pages/roles-management/roles-management";
import CreateRolePage from "@/pages/roles-management/create-role-page";
import RoleDetailsPage from "@/pages/roles-management/role-details-page";
import AdminAccessPage from "@/pages/admin-access/admin-access-page";
import CreateAdminPage from "@/pages/admin-access/create-admin-page";
import AdminDetailsPage from "@/pages/admin-access/admin-details-page";
import PayoutManagementPage from "@/pages/payout-management/payout-management";
import Profile from "@/pages/profile/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "kyc-management",
        element: <KycManagement />,
      },
      {
        path: "users-management",
        element: <UserManagement />,
      },
      {
        path: "users-management/:id",
        element: <UserManagementDetailsPage />,
      },
      {
        path: "pods-management",
        element: <PodsManagementPage />,
      },
      {
        path: "pods-management/:id",
        element: <PodDetailsPage />,
      },
      {
        path: "pod-plans-management",
        element: <PodPlansManagementPage />,
      },
      {
        path: "payout-management",
        element: <PayoutManagementPage />,
      },
      {
        path: "roles-management",
        element: <RolesManagementPage />,
      },
      {
        path: "roles-management/new",
        element: <CreateRolePage />,
      },
      {
        path: "roles-management/:roleId",
        element: <RoleDetailsPage />,
      },
      {
        path: "admin-access",
        element: <AdminAccessPage />,
      },
      {
        path: "admin-access/new",
        element: <CreateAdminPage />,
      },
      {
        path: "admin-access/:adminId",
        element: <AdminDetailsPage />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "contributions-and-allocations",
        element: <ContributionsAndAllocations />,
      },
      {
        path: "contributions-and-allocations/:id",
        element: <CADetailsPage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/request-access",
    element: <RequestAccessPage />,
  },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },
]);
