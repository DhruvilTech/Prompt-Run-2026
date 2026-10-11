import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { FinanceProvider } from '../state/FinanceContext';

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <RouterProvider router={router} />
    </FinanceProvider>
  );
};

export default App;
