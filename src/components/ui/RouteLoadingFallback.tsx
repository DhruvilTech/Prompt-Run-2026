import React, { Suspense } from 'react';

/**
 * Accessible loading indicator for asynchronous route transitions
 */
export const RouteLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-label="Loading page content"
    className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 space-y-4"
  >
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-midnight-border" />
      <div className="absolute inset-0 rounded-full border-2 border-mint-lime border-t-transparent animate-spin" />
    </div>
    <span className="text-xs font-mono text-paper-muted animate-pulse">
      Loading Telemetry...
    </span>
    <span className="sr-only">Loading page content, please wait.</span>
  </div>
);

export const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>
);
