import { JobStatus, UploadResponse } from '../types';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API URL

export async function generateThumbnail(url: string): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Failed to process video');
  }

  return response.json();
}

export async function checkJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }

  return response.json();
}

export async function getThumbnailUrl(jobId: string): Promise<string> {
  return `${API_BASE_URL}/thumbnail/${jobId}`;
}