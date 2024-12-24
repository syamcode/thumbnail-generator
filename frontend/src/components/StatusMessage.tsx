import React from 'react';
import { AlertCircle } from 'lucide-react';

type StatusMessageProps = {
  message: string;
  type: 'error' | 'info';
};

export function StatusMessage({ message, type }: StatusMessageProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  return (
    <div className={`p-4 border rounded-lg flex items-center gap-2 ${styles[type]}`}>
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}