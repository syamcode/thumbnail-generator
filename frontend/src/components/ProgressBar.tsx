import React from 'react';
import { JobStatus } from '../types';

type ProgressBarProps = {
  status: JobStatus;
};

export function ProgressBar({ status }: ProgressBarProps) {
  const isIndeterminate = status.progress === undefined;

  return (
    <div className="w-full max-w-xl">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">
          {status.state === 'active' ? 'Processing...' : status.state}
        </span>
        {!isIndeterminate && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(status.progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            status.state === 'active' 
              ? 'bg-blue-500' 
              : status.state === 'completed'
              ? 'bg-green-500'
              : 'bg-red-500'
          } ${isIndeterminate ? 'animate-progress-indeterminate' : ''}`}
          style={!isIndeterminate ? { width: `${status.progress}%` } : undefined}
        />
      </div>
    </div>
  );
}