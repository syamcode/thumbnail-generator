export type JobStatus = {
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  progress?: number;
  data?: any;
};

export type UploadResponse = {
  jobId: string;
  message: string;
  status: string;
};