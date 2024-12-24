export type JobStatus = {
  jobId: string
  state: "waiting" | "active" | "completed" | "failed"
  progress?: number
  data?: JobStatusData
}

export type JobStatusData = {
  success: boolean
  gifUrl: string
}

export type UploadResponse = {
  jobId: string
  message: string
  status: string
}
