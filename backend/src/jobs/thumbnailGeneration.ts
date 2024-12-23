import Queue from "bull"
import { generateThumbnail } from "@/workers/thumbnailGenerator"

export const thumbnailGenerationQueue = new Queue("thumbnail-generation", {
  redis: {
    host: "localhost",
    port: 6379,
  },
})

// Process jobs
thumbnailGenerationQueue.process(async (job) => {
  const { videoPath, outputDir, gifPath } = job.data

  try {
    await generateThumbnail(videoPath, outputDir, gifPath)
    return { success: true, gifPath }
  } catch (error) {
    throw error
  }
})
