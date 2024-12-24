import Queue from "bull"
import { generateThumbnail } from "@/workers/thumbnailGenerator"
import { env, redisConfig } from "../config/env"

export const thumbnailGenerationQueue = new Queue(
  "thumbnail-generation",
  redisConfig
)

// Process jobs
thumbnailGenerationQueue.process(async (job) => {
  const { videoURL, tempDir, gifPath } = job.data

  try {
    await generateThumbnail(videoURL, tempDir, gifPath)
    return { success: true, gifUrl: `${env.GIF_URL}/${job.id}.gif` }
  } catch (error) {
    throw error
  }
})
