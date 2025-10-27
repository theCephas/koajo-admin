import { createBrowserRouter } from "react-router-dom";

import { RootLayout } from "@/layouts/root-layout";
import { AnalyticsPage } from "@/pages/analytics/analytics-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { LoginPage } from "@/pages/auth/login-page";
import { RequestAccessPage } from "@/pages/auth/request-access-page";
import { NotFoundPage } from "@/pages/not-found/not-found-page";
import { SettingsPage } from "@/pages/settings/settings-page";
import KycManagement from "@/pages/kyc-management/kyc-management";
import UserManagement from "@/pages/user-management/user-management";
import UserManagementDetailsPage from "@/pages/user-management/user-details-page";
import GroupsManagament from "@/pages/groups-management/groups-managament";
import ProjectsPage from "@/pages/groups-management/projects-page";
import ProjectDetailsPage from "@/pages/groups-management/project-details-page";
import ContactsPage from "@/pages/groups-management/contacts-page";
import Notifications from "@/pages/notifications/notifications";
import ContributionsAndAllocations from "@/pages/contributions-and-allocations/contributions-and-allocations";
import CADetailsPage from "@/pages/contributions-and-allocations/ca-details-page";
import { ProtectedRoute } from "@/components/auth/protected-route";
import PodsManagementPage from "@/pages/pods-management/pods-management";
import PodDetailsPage from "@/pages/pods-management/pod-details-page";
import PodPlansManagementPage from "@/pages/pod-plans-management/pod-plans-management";

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
        path: "groups-management",
        element: <GroupsManagament />,
      },
      {
        path: "groups-management/projects",
        element: <ProjectsPage />,
      },
      {
        path: "/groups-management/projects/:groupId",
        element: <ProjectDetailsPage />,
      },
      {
        path: "/groups-management/projects/:groupId/contacts",
        element: <ContactsPage />,
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
]);
