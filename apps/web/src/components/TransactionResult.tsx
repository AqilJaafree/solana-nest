'use client';

import { TransactionCountResponse } from '@solana-block-counter/shared';

interface TransactionResultProps {
  result: TransactionCountResponse;
}

export function TransactionResult({ result }: TransactionResultProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatBlockTime = (blockTime: number) => {
    return new Date(blockTime * 1000).toLocaleString();
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Main Result */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 bg-opacity-20 rounded-full mb-4">
          <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {result.transactionCount.toLocaleString()} Transactions
        </h2>
        <p className="text-blue-200">
          Found in Solana block #{result.blockNumber.toLocaleString()}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="text-sm font-medium text-white">Block Number</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {result.blockNumber.toLocaleString()}
          </p>
        </div>

        <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className="text-sm font-medium text-white">Transaction Count</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {result.transactionCount.toLocaleString()}
          </p>
        </div>

        {result.blockTime && (
          <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-white">Block Time</span>
            </div>
            <p className="text-sm text-blue-200">
              {formatBlockTime(result.blockTime)}
            </p>
          </div>
        )}

        <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-white">Response</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-blue-200">
              {result.cached ? '⚡ Cached (Fast!)' : '🔄 Fresh Data'}
            </p>
            <p className="text-xs text-blue-300">
              {formatDate(result.timestamp)}
            </p>
          </div>
        </div>
      </div>

      {/* Success Indicator */}
      <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-green-200 font-medium">Success!</p>
            <p className="text-green-300 text-sm">
              Block data retrieved successfully from Solana blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
