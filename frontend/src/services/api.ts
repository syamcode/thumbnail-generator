import { JobStatus, UploadResponse } from "../types"

const API_BASE_URL = "http://localhost:3000/api" // Adjust this to match your API base URL

export async function generateThumbnail(
  videoURL: string
): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-thumbnail`, {
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
  const response = await fetch(`${API_BASE_URL}/thumbnail-status/${jobId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch status")
  }

  return response.json()
}

export function getThumbnailUrl(jobId: string): string {
  return `http://localhost:3000/gifs/${jobId}.gif`
}
