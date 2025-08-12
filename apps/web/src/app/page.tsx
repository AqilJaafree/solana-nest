'use client';

import { useState, useEffect } from 'react';
import { BlockForm } from '@/components/BlockForm';
import { TransactionResult } from '@/components/TransactionResult';
import { TransactionCountResponse } from '@solana-block-counter/shared';

export default function Home() {
  const [result, setResult] = useState<TransactionCountResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check API health on component mount - FIXED: Moved to useEffect
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };

    checkHealth();
  }, []); // Empty dependency array means this runs once on mount

  const handleBlockSubmit = async (blockNumber: number) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:3000/blocks/${blockNumber}/transactions`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.message) ? errorData.message[0] : errorData.message || 'Failed to fetch block data');
      }

      const data: TransactionCountResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            🚀 Solana Block Counter
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-6">
            Enter any Solana block number to get the exact transaction count. 
            Powered by NestJS API with enterprise-grade caching and validation.
          </p>
          
          {/* API Status */}
          <div className="inline-flex items-center px-4 py-2 rounded-lg border">
            {apiStatus === 'checking' && (
              <div className="bg-blue-500 bg-opacity-20 border-blue-500 border-opacity-30 px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="text-blue-200 text-sm">Checking API...</span>
                </div>
              </div>
            )}
            {apiStatus === 'online' && (
              <div className="bg-green-500 bg-opacity-20 border-green-500 border-opacity-30 px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-200 text-sm">API Online</span>
                </div>
              </div>
            )}
            {apiStatus === 'offline' && (
              <div className="bg-red-500 bg-opacity-20 border-red-500 border-opacity-30 px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-200 text-sm">API Offline - Start your NestJS server!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
            {/* Block Form */}
            <BlockForm 
              onSubmit={handleBlockSubmit} 
              loading={loading}
            />

            {/* Loading State */}
            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-6 py-3 bg-blue-500 bg-opacity-20 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span className="text-white">Fetching block data from Solana...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-8 p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg">
                <p className="text-red-200 text-center">❌ {error}</p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <TransactionResult result={result} />
            )}
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-blue-200 text-sm">
                Sub-second response times with Alchemy RPC and smart caching
              </p>
            </div>
            
            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Grade</h3>
              <p className="text-blue-200 text-sm">
                Input validation, rate limiting, and comprehensive error handling
              </p>
            </div>
            
            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10">
              <div className="text-2xl mb-2">🧪</div>
              <h3 className="text-lg font-semibold text-white mb-2">Battle Tested</h3>
              <p className="text-blue-200 text-sm">
                17/17 Jest tests passing with 85%+ coverage
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-blue-300">
          <p className="mb-2">Built with ❤️ using NestJS, NextJS, and TypeScript</p>
          <div className="flex justify-center items-center space-x-4 text-sm">
            <span>API: <code className="bg-white bg-opacity-10 px-2 py-1 rounded">http://localhost:3000</code></span>
            <span>•</span>
            <span>Frontend: <code className="bg-white bg-opacity-10 px-2 py-1 rounded">http://localhost:3001</code></span>
          </div>
        </footer>
      </div>
    </main>
  );
}
