import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { SuspenseWrapper } from '../components/ui/RouteLoadingFallback';

// Route-based code splitting
const LandingPage = lazy(() =>
  import('../features/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const PlanPage = lazy(() =>
  import('../features/plan/PlanPage').then((m) => ({ default: m.PlanPage }))
);
const TransactionsPage = lazy(() =>
  import('../features/transactions/TransactionsPage').then((m) => ({
    default: m.TransactionsPage,
  }))
);
const SimulatorPage = lazy(() =>
  import('../features/simulator/SimulatorPage').then((m) => ({ default: m.SimulatorPage }))
);
const GoalsPage = lazy(() =>
  import('../features/goals/GoalsPage').then((m) => ({ default: m.GoalsPage }))
);
const InsightsPage = lazy(() =>
  import('../features/insights/InsightsPage').then((m) => ({ default: m.InsightsPage }))
);
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <LandingPage />
      </SuspenseWrapper>
    ),
  },
  {
    element: <AppShell />,
    children: [
      {
        path: '/dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/plan',
        element: (
          <SuspenseWrapper>
            <PlanPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/transactions',
        element: (
          <SuspenseWrapper>
            <TransactionsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/simulate',
        element: (
          <SuspenseWrapper>
            <SimulatorPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/goals',
        element: (
          <SuspenseWrapper>
            <GoalsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/insights',
        element: (
          <SuspenseWrapper>
            <InsightsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
