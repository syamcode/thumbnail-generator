import React from 'react';
import { JobStatus } from '../types';

type ProgressBarProps = {
  status: JobStatus;
};

export function ProgressBar({ status }: ProgressBarProps) {
  return (
    <div className="w-full max-w-xl">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">
          {status.state === 'active' ? 'Processing...' : status.state}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            status.state === 'active' 
              ? 'bg-blue-500 animate-progress-indeterminate' 
              : status.state === 'completed'
              ? 'bg-green-500 w-full'
              : 'bg-red-500 w-full'
          }`}
        />
      </div>
    </div>
  );
}