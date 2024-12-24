import { useState, useEffect } from 'react';

export function useJobState() {
  // Get initial jobId from URL hash if it exists
  const getInitialJobId = () => window.location.hash.replace('#', '') || null;
  
  const [currentJobId, setCurrentJobId] = useState<string | null>(getInitialJobId);

  // Update URL hash when jobId changes
  const updateJobId = (jobId: string | null) => {
    setCurrentJobId(jobId);
    if (jobId) {
      window.location.hash = jobId;
    } else {
      window.location.hash = '';
    }
  };

  return {
    currentJobId,
    updateJobId
  };
}