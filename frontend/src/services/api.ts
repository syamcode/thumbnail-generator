import { JobStatus, UploadResponse } from "../types"
import { config } from "../config/env"

export async function generateThumbnail(
  videoURL: string
): Promise<UploadResponse> {
  const response = await fetch(`${config.apiBaseUrl}/api/generate-thumbnail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ videoURL }),
  })

  if (!response.ok) {
    throw new Error("Failed to process video")
  }

  return response.json()
}

export async function checkJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(
    `${config.apiBaseUrl}/api/thumbnail-status/${jobId}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch status")
  }

  return response.json()
}

export function getThumbnailUrl(jobId: string): string {
  return `${config.apiBaseUrl}/gifs/${jobId}.gif`
}
