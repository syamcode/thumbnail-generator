import express from "express"
import { thumbnailGenerationQueue } from "@/jobs/thumbnailGeneration"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"

const router = express.Router()

router.post("/generate-thumbnail", async (req, res) => {
  try {
    const videoURL = req.body.videoURL
    const jobId = uuidv4()
    const outputDir = path.join("frames", jobId)
    const gifPath = path.join("gifs", `${jobId}.gif`)

    // Create necessary directories
    fs.mkdirSync(outputDir, { recursive: true })
    fs.mkdirSync("gifs", { recursive: true })

    // Add job to queue
    const job = await thumbnailGenerationQueue.add(
      {
        videoURL,
        outputDir,
        gifPath,
      },
      {
        jobId,
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      }
    )

    res.json({
      message: "Thumbnail generation started",
      jobId: job.id,
      status: "processing",
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to start thumbnail generation",
      details: (error as Error).message,
    })
  }
})

// Get job status
router.get("/thumbnail-status/:jobId", async (req, res) => {
  try {
    const job = await thumbnailGenerationQueue.getJob(req.params.jobId)

    if (!job) {
      res.status(404).json({ error: "Job not found" })
      return
    }

    const state = await job.getState()
    const progress = job.progress

    res.json({
      jobId: job.id,
      state,
      progress,
      data: job.returnvalue, // Will contain the gif path if job is completed
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to get job status",
      details: (error as Error).message,
    })
  }
})

export default router
