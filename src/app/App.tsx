import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { FinanceProvider } from '../state/FinanceContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <RouterProvider router={router} />
      </FinanceProvider>
    </ErrorBoundary>
  );
};

export default App;
