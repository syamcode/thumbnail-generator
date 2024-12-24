import { JobStatus, UploadResponse } from '../types';

// Simulated processing time in milliseconds
const PROCESSING_TIME = 3000;
const PROGRESS_INTERVAL = 100;

// Mock thumbnail URLs
const SAMPLE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640',
  'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=640',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640',
];

// Store job states in memory
const jobStates = new Map<string, { state: JobStatus['state']; thumbnailUrl?: string }>();

export async function generateThumbnail(url: string): Promise<UploadResponse> {
  const jobId = Math.random().toString(36).substring(7);
  
  // Initialize job state
  jobStates.set(jobId, { state: 'active' });
  
  // Simulate processing
  setTimeout(() => {
    jobStates.set(jobId, { 
      state: 'completed',
      thumbnailUrl: SAMPLE_THUMBNAILS[Math.floor(Math.random() * SAMPLE_THUMBNAILS.length)]
    });
  }, PROCESSING_TIME);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        jobId,
        message: 'Processing started'
      });
    }, 500);
  });
}

export async function checkJobStatus(jobId: string): Promise<JobStatus> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const jobState = jobStates.get(jobId) || { state: 'failed' };
      resolve({
        jobId,
        state: jobState.state
      });
    }, PROGRESS_INTERVAL);
  });
}

export async function getThumbnailUrl(jobId: string): Promise<string> {
  const jobState = jobStates.get(jobId);
  return jobState?.thumbnailUrl || SAMPLE_THUMBNAILS[0];
}