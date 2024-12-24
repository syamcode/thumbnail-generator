import React, { useState, useEffect } from 'react';
import { Video } from 'lucide-react';
import { VideoUrlInput } from './components/VideoUrlInput';
import { ProgressBar } from './components/ProgressBar';
import { ThumbnailDisplay } from './components/ThumbnailDisplay';
import { StatusMessage } from './components/StatusMessage';
import { JobStatus } from './types';
import { generateThumbnail, checkJobStatus, getThumbnailUrl } from './services/mockApi';
import { useJobState } from './hooks/useJobState';

export default function App() {
  const { currentJobId, updateJobId } = useJobState();
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const processVideo = async (url: string) => {
    setIsProcessing(true);
    setError(null);
    setThumbnailUrl(null);
    
    try {
      const data = await generateThumbnail(url);
      updateJobId(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollStatus = async () => {
    if (!currentJobId) return;

    try {
      const data = await checkJobStatus(currentJobId);
      setStatus(data);
      
      if (data.state === 'completed') {
        const url = await getThumbnailUrl(currentJobId);
        setThumbnailUrl(url);
      } else if (data.state === 'failed') {
        setError('Failed to generate thumbnail');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    }
  };

  // Check status on initial load if jobId exists
  useEffect(() => {
    if (currentJobId) {
      pollStatus();
    }
  }, []);

  useEffect(() => {
    if (currentJobId && status?.state !== 'completed') {
      const interval = setInterval(pollStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [currentJobId, status]);

  const handleReset = () => {
    updateJobId(null);
    setStatus(null);
    setThumbnailUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Thumbnail Generator
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Generate a thumbnail from any video URL. Just paste the URL and we'll do the rest.
          </p>
        </div>

        <div className="space-y-8">
          {!currentJobId && (
            <VideoUrlInput onSubmit={processVideo} isProcessing={isProcessing} />
          )}

          {error && <StatusMessage message={error} type="error" />}

          {status && status.state !== 'completed' && (
            <div className="max-w-xl mx-auto">
              <ProgressBar status={status} />
              {status.state === 'active' && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Generating your thumbnail...
                </p>
              )}
            </div>
          )}

          {thumbnailUrl && (
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                <img
                  src={thumbnailUrl}
                  alt="Generated Thumbnail"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Generate Another Thumbnail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}