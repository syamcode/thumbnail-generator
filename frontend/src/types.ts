export type JobStatus = {
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed';
};

export type UploadResponse = {
  jobId: string;
  message: string;
};