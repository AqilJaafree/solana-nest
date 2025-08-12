'use client';

import { useState } from 'react';

interface BlockFormProps {
  onSubmit: (blockNumber: number) => void;
  loading: boolean;
}

export function BlockForm({ onSubmit, loading }: BlockFormProps) {
  const [blockNumber, setBlockNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const num = parseInt(blockNumber);
    
    if (!blockNumber || isNaN(num)) {
      setError('Please enter a valid block number');
      return;
    }
    
    if (num < 1) {
      setError('Block number must be greater than 0');
      return;
    }
    
    if (num > 999999999) {
      setError('Block number is too large');
      return;
    }

    onSubmit(num);
  };

  const handleCurrentSlot = async () => {
    try {
      const response = await fetch('http://localhost:3000/blocks/current');
      const data = await response.json();
      setBlockNumber(data.currentSlot.toString());
    } catch (err) {
      setError('Failed to fetch current slot');
    }
  };

  const exampleBlocks = [290000000, 295000000, 300000000];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="blockNumber" className="block text-sm font-medium text-white mb-2">
            Solana Block Number
          </label>
          <div className="relative">
            <input
              type="number"
              id="blockNumber"
              value={blockNumber}
              onChange={(e) => setBlockNumber(e.target.value)}
              placeholder="Enter block number (e.g., 290000000)"
              className="w-full px-4 py-3 pl-12 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <svg className="absolute left-4 top-3.5 h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-300">{error}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || !blockNumber}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Fetching...' : 'Get Transaction Count'}
          </button>
          
          <button
            type="button"
            onClick={handleCurrentSlot}
            disabled={loading}
            className="flex items-center px-4 py-3 bg-white bg-opacity-10 text-white border border-white border-opacity-20 rounded-lg hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Current Slot
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-blue-200 mb-2">Try these example blocks:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleBlocks.map((block) => (
            <button
              key={block}
              type="button"
              onClick={() => setBlockNumber(block.toString())}
              disabled={loading}
              className="px-3 py-1 text-xs bg-white bg-opacity-10 text-blue-200 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              {block.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
