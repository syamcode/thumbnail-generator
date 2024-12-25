import express from "express"
import { thumbnailGenerationQueue } from "@/jobs/thumbnailGeneration"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import { setCache, getCache } from "@/utils/cache"

/**
 * Express router for handling thumbnail generation endpoints
 */
const router = express.Router()

/**
 * POST /generate-thumbnail
 * Initiates the thumbnail generation process for a given video URL
 *
 * Request Body:
 * - videoURL: string - The URL of the video to generate thumbnail from
 *
 * Returns:
 * - message: string - Status message
 * - jobId: string - Unique identifier for the generation job
 * - status: string - Current status of the job
 *
 * Cache Strategy:
 * - Caches the jobId against videoURL for 24 hours
 * - Reuses existing jobId if video was previously processed
 */
router.post("/generate-thumbnail", async (req, res) => {
  try {
    const videoURL = req.body.videoURL
    let jobId = uuidv4()

    // Define paths for temporary and output files
    const tempDir = path.join("temps/", jobId)
    const gifPath = path.join("assets/gif/", `${jobId}.gif`)

    // Check if we've already processed this video
    const cachedJobId = await getCache(videoURL)
    if (!cachedJobId) {
      // First time processing this video

      // Ensure temporary directory exists
      fs.mkdirSync(tempDir, { recursive: true })

      // Configure and add job to the processing queue
      const job = await thumbnailGenerationQueue.add(
        {
          videoURL,
          tempDir,
          gifPath,
        },
        {
          jobId,
          attempts: 3, // Retry up to 3 times on failure
          removeOnComplete: false, // Keep job data for status checking
          removeOnFail: false, // Keep failed jobs for debugging
        }
      )

      // Cache the jobId for future requests
      await setCache(videoURL, jobId, 3600 * 24) // 24 hour cache
    } else {
      // Reuse existing job ID for this video
      jobId = cachedJobId
    }

    res.json({
      message: "Thumbnail generation started",
      jobId: jobId,
      status: "processing",
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to start thumbnail generation",
      details: (error as Error).message,
    })
  }
})

/**
 * GET /thumbnail-status/:jobId
 * Retrieves the current status of a thumbnail generation job
 *
 * URL Parameters:
 * - jobId: string - The ID of the job to check
 *
 * Returns:
 * - jobId: string - The ID of the job
 * - state: string - Current state of the job (waiting/active/completed/failed)
 * - progress: number - Progress percentage of the job
 * - data: object - Result data (includes gif path if completed)
 */
router.get("/thumbnail-status/:jobId", async (req, res) => {
  try {
    const job = await thumbnailGenerationQueue.getJob(req.params.jobId)

    if (!job) {
      res.status(404).json({ error: "Job not found" })
      return
    }

    // Fetch current job state and progress
    const state = await job.getState()
    const progress = job.progress

    res.json({
      jobId: job.id,
      state,
      progress,
      data: job.returnvalue, // Contains the gif path if job is completed
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to get job status",
      details: (error as Error).message,
    })
  }
})

export default router
