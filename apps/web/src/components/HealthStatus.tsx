'use client';

import { useState, useEffect } from 'react';
import { HealthResponse } from '@solana-block-counter/shared';

export function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3000/health');
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-blue-500 bg-opacity-20 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span className="text-blue-200 text-sm">Checking API status...</span>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-red-500 bg-opacity-20 rounded-lg border border-red-500 border-opacity-30">
          <svg className="h-4 w-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-200 text-sm">API Offline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center px-4 py-2 bg-green-500 bg-opacity-20 rounded-lg border border-green-500 border-opacity-30">
        <svg className="h-4 w-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
        </svg>
        <span className="text-green-200 text-sm">
          API Online • Uptime: {Math.floor(health.uptime / 60)}m {Math.floor(health.uptime % 60)}s
        </span>
      </div>
    </div>
  );
}
