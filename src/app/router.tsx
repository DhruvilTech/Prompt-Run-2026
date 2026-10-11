import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PlanPage } from '../features/plan/PlanPage';
import { TransactionsPage } from '../features/transactions/TransactionsPage';
import { SimulatorPage } from '../features/simulator/SimulatorPage';
import { GoalsPage } from '../features/goals/GoalsPage';
import { InsightsPage } from '../features/insights/InsightsPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AppShell />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/plan',
        element: <PlanPage />,
      },
      {
        path: '/transactions',
        element: <TransactionsPage />,
      },
      {
        path: '/simulate',
        element: <SimulatorPage />,
      },
      {
        path: '/goals',
        element: <GoalsPage />,
      },
      {
        path: '/insights',
        element: <InsightsPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
